import {describe, expect, it} from "vitest";
import {locatedCompanies, toCompanyPin} from "./companies";
import type {CompanyPin} from "./companies";
import type {CompanyListItem} from "./api";

function row(overrides: Partial<CompanyListItem> = {}): CompanyListItem {
    return {
        id: 1,
        name: "Atelier Numérique",
        siret: "73282932000074",
        description: "Studio de développement",
        link: "https://atelier-numerique.fr",
        employeeRange: 1,
        activity: "Information et communication",
        legalName: "ATELIER NUMERIQUE SAS",
        sireneCheckedAt: null,
        addressId: 4,
        jobsCount: 3,
        address: {
            label: "8 rue de Londres 75009 Paris",
            street: "8 rue de Londres",
            postalCode: "75009",
            city: "Paris",
            latitude: 48.876,
            longitude: 2.331,
        },
        ...overrides,
    };
}

describe("toCompanyPin", () => {
    it("reprend les coordonnées quand l'entreprise est géocodée", () => {
        const pin = toCompanyPin(row());

        expect(pin.lat).toBe(48.876);
        expect(pin.lon).toBe(2.331);
        expect(pin.located).toBe(true);
        expect(pin.city).toBe("Paris");
        expect(pin.postalCode).toBe("75009");
    });

    it("marque l'entreprise comme non localisée sans adresse", () => {
        const pin = toCompanyPin(row({address: null}));

        expect(pin.located).toBe(false);
        expect(pin.lat).toBe(0);
        expect(pin.lon).toBe(0);
        expect(pin.addressLabel).toBe("");
    });

    it("marque l'entreprise comme non localisée si les coordonnées manquent", () => {
        const pin = toCompanyPin(
            row({
                address: {
                    label: "Lieu-dit Les Granges",
                    street: null,
                    postalCode: null,
                    city: null,
                    latitude: null,
                    longitude: null,
                },
            }),
        );

        expect(pin.located).toBe(false);
        expect(pin.addressLabel).toBe("Lieu-dit Les Granges");
    });

    it("remplace une activité absente par une mention explicite", () => {
        expect(toCompanyPin(row({activity: null})).activity).toBe("Non renseignée");
    });

    it("remplace une description absente par une chaîne vide", () => {
        expect(toCompanyPin(row({description: null})).description).toBe("");
    });

    it("conserve le lien et le nombre d'offres tels quels", () => {
        const pin = toCompanyPin(row({link: null, jobsCount: 0}));

        expect(pin.link).toBeNull();
        expect(pin.jobsCount).toBe(0);
    });
});

describe("locatedCompanies", () => {
    it("écarte les entreprises sans position", () => {
        const list = [
            {id: 1, located: true},
            {id: 2, located: false},
        ] as CompanyPin[];

        expect(locatedCompanies(list).map((c) => c.id)).toEqual([1]);
    });
});
