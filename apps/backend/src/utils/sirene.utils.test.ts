import {afterEach, describe, expect, it, vi} from "vitest";
import {isValidSiret, lookupSiret, normalizeSiret} from "./sirene.utils.ts";
import {HttpError} from "../types/httpError.ts";

// SIRET dont la clé de contrôle de Luhn est correcte.
const VALID = "73282932000074";

// La doublure garde la signature de fetch : les assertions sur mock.calls
// restent typees (url, puis options).
function stubFetch(payload: unknown, ok: boolean = true) {
    const fetchMock = vi.fn(async (..._args: Parameters<typeof fetch>) => ({
        ok: ok,
        json: async () => payload,
    }));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("normalizeSiret", () => {
    it("retire les espaces de saisie", () => {
        expect(normalizeSiret("732 829 320 00074")).toBe(VALID);
    });

    it("laisse intacte une saisie déjà compacte", () => {
        expect(normalizeSiret(VALID)).toBe(VALID);
    });
});

describe("isValidSiret", () => {
    it("accepte des SIRET dont la clé de contrôle est correcte", () => {
        expect(isValidSiret(VALID)).toBe(true);
        expect(isValidSiret("55208131766522")).toBe(true);
        expect(isValidSiret("44306184100047")).toBe(true);
    });

    it("accepte une saisie espacée, la normalisation est faite en amont", () => {
        expect(isValidSiret("732 829 320 00074")).toBe(true);
    });

    it("rejette une clé de contrôle fausse", () => {
        expect(isValidSiret("81250712000019")).toBe(false);
        expect(isValidSiret("12345678901234")).toBe(false);
    });

    it("rejette tout ce qui ne fait pas exactement 14 chiffres", () => {
        expect(isValidSiret("")).toBe(false);
        expect(isValidSiret("7328293200007")).toBe(false);
        expect(isValidSiret("732829320000740")).toBe(false);
        expect(isValidSiret("7328293200007A")).toBe(false);
    });
});

describe("lookupSiret", () => {
    it("refuse un SIRET mal formé avant tout appel réseau", async () => {
        const fetchMock = stubFetch({});

        await expect(lookupSiret("12345678901234")).rejects.toMatchObject({status: 400});
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("traduit une panne réseau en 503", async () => {
        vi.stubGlobal("fetch", vi.fn(async () => {
            throw new Error("ECONNREFUSED");
        }));

        await expect(lookupSiret(VALID)).rejects.toMatchObject({status: 503});
    });

    it("traduit une réponse HTTP en erreur en 503", async () => {
        stubFetch({}, false);

        await expect(lookupSiret(VALID)).rejects.toMatchObject({status: 503});
    });

    it("rend 404 quand l'annuaire ne renvoie aucun résultat", async () => {
        stubFetch({results: []});

        await expect(lookupSiret(VALID)).rejects.toMatchObject({status: 404});
    });

    it("rend 404 quand aucun établissement du résultat ne porte ce SIRET", async () => {
        stubFetch({
            results: [
                {
                    nom_complet: "AUTRE SOCIETE",
                    matching_etablissements: [{siret: "55208131766522"}],
                    siege: {siret: "44306184100047"},
                },
            ],
        });

        await expect(lookupSiret(VALID)).rejects.toMatchObject({status: 404});
    });

    it("lève bien une HttpError, reprise telle quelle par errorHandler", async () => {
        stubFetch({results: []});

        await expect(lookupSiret(VALID)).rejects.toBeInstanceOf(HttpError);
    });

    it("mappe un établissement correspondant", async () => {
        stubFetch({
            results: [
                {
                    nom_complet: "GOOGLE FRANCE",
                    nom_raison_sociale: "GOOGLE FRANCE SARL",
                    section_activite_principale: "J",
                    matching_etablissements: [
                        {
                            siret: VALID,
                            nom_commercial: "  Google Paris  ",
                            adresse: "8 RUE DE LONDRES 75009 PARIS",
                            code_postal: "75009",
                            libelle_commune: "PARIS",
                            latitude: "48.876",
                            longitude: "2.331",
                            activite_principale: "70.10Z",
                            tranche_effectif_salarie: "41",
                        },
                    ],
                },
            ],
        });

        const found = await lookupSiret(VALID);

        expect(found).toEqual({
            siret: VALID,
            name: "Google Paris",
            legalName: "GOOGLE FRANCE SARL",
            activity: "Information et communication (NAF 70.10Z)",
            employeeRange: 3,
            address: {
                label: "8 RUE DE LONDRES 75009 PARIS",
                street: null,
                postalCode: "75009",
                city: "PARIS",
                latitude: 48.876,
                longitude: 2.331,
            },
        });
    });

    it("retombe sur le siège quand la liste des établissements ne contient rien", async () => {
        stubFetch({
            results: [
                {
                    nom_complet: "PETITE ENTREPRISE",
                    siege: {siret: VALID, adresse: "1 PLACE CENTRALE 33000 BORDEAUX"},
                },
            ],
        });

        const found = await lookupSiret(VALID);

        expect(found.name).toBe("PETITE ENTREPRISE");
        expect(found.address?.city).toBeNull();
    });

    it("retombe sur le SIRET quand aucun nom n'est exploitable", async () => {
        stubFetch({results: [{siege: {siret: VALID}}]});

        const found = await lookupSiret(VALID);

        expect(found.name).toBe(VALID);
        expect(found.legalName).toBeNull();
        expect(found.address).toBeNull();
    });

    it("ramène une tranche d'effectif inconnue au premier palier", async () => {
        stubFetch({
            results: [{siege: {siret: VALID, tranche_effectif_salarie: "99"}}],
        });

        expect((await lookupSiret(VALID)).employeeRange).toBe(0);
    });

    it("traduit les tranches Insee en paliers de la plateforme", async () => {
        const cases: [string, number][] = [["03", 0], ["12", 1], ["31", 2], ["53", 3]];

        for (const [code, expected] of cases) {
            stubFetch({results: [{siege: {siret: VALID, tranche_effectif_salarie: code}}]});
            expect((await lookupSiret(VALID)).employeeRange).toBe(expected);
        }
    });

    it("se contente du code NAF quand la section d'activité est inconnue", async () => {
        stubFetch({
            results: [
                {siege: {siret: VALID, activite_principale: "62.01Z"}, section_activite_principale: "Z"},
            ],
        });

        expect((await lookupSiret(VALID)).activity).toBe("62.01Z");
    });

    it("interroge l'annuaire avec le SIRET normalisé", async () => {
        const fetchMock = stubFetch({results: [{siege: {siret: VALID}}]});

        await lookupSiret("732 829 320 00074");

        expect(String(fetchMock.mock.calls[0][0])).toContain(VALID);
    });
});
