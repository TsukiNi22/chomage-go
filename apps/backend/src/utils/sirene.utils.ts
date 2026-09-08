import {HttpError} from "../types/httpError.ts";

// API publique et sans clé de l'annuaire des entreprises (données Sirene de l'Insee).
const SIRENE_ENDPOINT = "https://recherche-entreprises.api.gouv.fr/search";

export type SireneEstablishment = {
    siret: string;
    name: string;
    legalName: string | null;
    activity: string | null;
    employeeRange: number;
    address: {
        label: string;
        street: string | null;
        postalCode: string | null;
        city: string | null;
        latitude: number | null;
        longitude: number | null;
    } | null;
};

// Tranches d'effectifs Insee -> index employeeRange utilisé par la plateforme.
// 0: 0-10, 1: 11-100, 2: 101-500, 3: plus de 500.
const EMPLOYEE_RANGES: Record<string, number> = {
    "NN": 0,
    "00": 0,
    "01": 0,
    "02": 0,
    "03": 0,
    "11": 1,
    "12": 1,
    "21": 1,
    "22": 2,
    "31": 2,
    "32": 2,
    "41": 3,
    "42": 3,
    "51": 3,
    "52": 3,
    "53": 3,
};

export function normalizeSiret(value: string): string
{
    return value.replace(/\s/g, "");
}

export function isValidSiret(value: string): boolean
{
    const siret = normalizeSiret(value);

    if (!/^\d{14}$/.test(siret)) {
        return false;
    }

    let total = 0;
    for (let i = 0; i < 14; i++) {
        let digit = Number(siret[13 - i]);
        if (i % 2 === 1) {
            digit = digit * 2;
            if (digit > 9) {
                digit = digit - 9;
            }
        }
        total = total + digit;
    }

    return total % 10 === 0;
}

function employeeRange(code: unknown): number
{
    if (typeof code !== "string") {
        return 0;
    }
    const range = EMPLOYEE_RANGES[code];
    if (range === undefined) {
        return 0;
    }
    return range;
}

function text(value: unknown): string | null
{
    if (typeof value !== "string") {
        return null;
    }
    const trimmed = value.trim();
    if (trimmed === "") {
        return null;
    }
    return trimmed;
}

function number(value: unknown): number | null
{
    if (typeof value === "number") {
        return value;
    }
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        if (!isNaN(parsed)) {
            return parsed;
        }
    }
    return null;
}

// Sections de la nomenclature d'activités française. L'annuaire ne renvoie que le code
// NAF de l'activité principale, la section donne le libellé lisible qui l'accompagne.
const NAF_SECTIONS: Record<string, string> = {
    A: "Agriculture, sylviculture et pêche",
    B: "Industries extractives",
    C: "Industrie manufacturière",
    D: "Production et distribution d'électricité et de gaz",
    E: "Production et distribution d'eau, assainissement et gestion des déchets",
    F: "Construction",
    G: "Commerce et réparation d'automobiles et de motocycles",
    H: "Transports et entreposage",
    I: "Hébergement et restauration",
    J: "Information et communication",
    K: "Activités financières et d'assurance",
    L: "Activités immobilières",
    M: "Activités spécialisées, scientifiques et techniques",
    N: "Activités de services administratifs et de soutien",
    O: "Administration publique",
    P: "Enseignement",
    Q: "Santé humaine et action sociale",
    R: "Arts, spectacles et activités récréatives",
    S: "Autres activités de services",
    T: "Activités des ménages en tant qu'employeurs",
    U: "Activités extra-territoriales",
};

function activityLabel(section: unknown, code: unknown): string | null
{
    const naf = text(code);
    let label = null;

    if (typeof section === "string") {
        const found = NAF_SECTIONS[section.toUpperCase()];
        if (found !== undefined) {
            label = found;
        }
    }

    if (label === null) {
        return naf;
    }
    if (naf === null) {
        return label;
    }
    return label + " (NAF " + naf + ")";
}

function toEstablishment(siret: string, company: any, establishment: any): SireneEstablishment
{
    const name =
        text(establishment?.nom_commercial) ||
        text(company?.nom_complet) ||
        text(company?.nom_raison_sociale) ||
        siret;

    let address = null;
    const label = text(establishment?.adresse);
    if (label !== null) {
        address = {
            label: label,
            street: null, // l'annuaire ne renvoie que l'adresse complète
            postalCode: text(establishment?.code_postal),
            city: text(establishment?.libelle_commune),
            latitude: number(establishment?.latitude),
            longitude: number(establishment?.longitude),
        };
    }

    return {
        siret: siret,
        name: name,
        legalName: text(company?.nom_raison_sociale) || text(company?.nom_complet),
        activity: activityLabel(
            company?.section_activite_principale,
            establishment?.activite_principale ?? company?.activite_principale,
        ),
        employeeRange: employeeRange(
            establishment?.tranche_effectif_salarie ?? company?.tranche_effectif_salarie,
        ),
        address: address,
    };
}

/**
 * Interroge l'annuaire des entreprises pour un SIRET donné.
 * Lève une HttpError si le SIRET est mal formé, inconnu, ou si le service est indisponible.
 */
export async function lookupSiret(rawSiret: string): Promise<SireneEstablishment>
{
    const siret = normalizeSiret(rawSiret);

    if (!isValidSiret(siret)) {
        throw new HttpError(400, "Ce numéro de SIRET est invalide (14 chiffres, clé de contrôle incorrecte)");
    }

    const url = SIRENE_ENDPOINT + "?q=" + encodeURIComponent(siret) + "&limite_matching_etablissements=1&page=1&per_page=1";

    let response;
    try {
        response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    } catch {
        throw new HttpError(503, "L'annuaire des entreprises est injoignable, réessayez dans un instant");
    }

    if (!response.ok) {
        throw new HttpError(503, "L'annuaire des entreprises est injoignable, réessayez dans un instant");
    }

    const data: any = await response.json();
    const results = data?.results;
    if (!Array.isArray(results) || results.length === 0) {
        throw new HttpError(404, "Aucun établissement ne correspond à ce SIRET");
    }

    const company = results[0];

    let establishment = null;
    if (Array.isArray(company.matching_etablissements)) {
        establishment = company.matching_etablissements.find(function (item: any) {
            return item?.siret === siret;
        });
    }
    if (!establishment && company.siege?.siret === siret) {
        establishment = company.siege;
    }
    if (!establishment) {
        throw new HttpError(404, "Aucun établissement ne correspond à ce SIRET");
    }

    return toEstablishment(siret, company, establishment);
}
