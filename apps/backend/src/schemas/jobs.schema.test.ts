import {describe, expect, it} from "vitest";
import {addressSchema, patchJobSchema, postJobSchema} from "./jobs.schema.ts";

const validJob = {
    companies_id: 3,
    title: "Développeur back-end",
    type: 0,
    salary_min: 32000,
};

describe("postJobSchema", () => {
    it("accepte le minimum requis pour publier une offre", () => {
        expect(postJobSchema.safeParse(validJob).success).toBe(true);
    });

    it("exige entreprise, intitulé, type de contrat et salaire plancher", () => {
        for (const field of ["companies_id", "title", "type", "salary_min"]) {
            const body: Record<string, unknown> = {...validJob};
            delete body[field];

            expect(postJobSchema.safeParse(body).success, field).toBe(false);
        }
    });

    it("borne le télétravail aux trois valeurs de l'interface", () => {
        // 0 aucun, 1 partiel, 2 total — voir REMOTES dans lib/api.ts côté front.
        expect(postJobSchema.safeParse({...validJob, remote: 0}).success).toBe(true);
        expect(postJobSchema.safeParse({...validJob, remote: 2}).success).toBe(true);
        expect(postJobSchema.safeParse({...validJob, remote: 3}).success).toBe(false);
        expect(postJobSchema.safeParse({...validJob, remote: -1}).success).toBe(false);
    });

    it("refuse un nombre maximal de candidats nul ou négatif", () => {
        expect(postJobSchema.safeParse({...validJob, max_applicants: 1}).success).toBe(true);
        expect(postJobSchema.safeParse({...validJob, max_applicants: 0}).success).toBe(false);
        expect(postJobSchema.safeParse({...validJob, max_applicants: -5}).success).toBe(false);
    });

    it("refuse un identifiant d'entreprise décimal", () => {
        expect(postJobSchema.safeParse({...validJob, companies_id: 3.5}).success).toBe(false);
    });

    it("limite le secteur à 100 caractères", () => {
        expect(postJobSchema.safeParse({...validJob, sector: "x".repeat(100)}).success).toBe(true);
        expect(postJobSchema.safeParse({...validJob, sector: "x".repeat(101)}).success).toBe(false);
    });

    it("retire les champs non déclarés", () => {
        const parsed = postJobSchema.parse({...validJob, companiesId: 99, rank: 0});

        expect(parsed).not.toHaveProperty("companiesId");
        expect(parsed).not.toHaveProperty("rank");
    });
});

describe("patchJobSchema", () => {
    it("accepte une mise à jour partielle", () => {
        expect(patchJobSchema.safeParse({title: "Nouveau titre"}).success).toBe(true);
    });

    it("accepte un corps vide — c'est le controller qui rend le 400", () => {
        expect(patchJobSchema.safeParse({}).success).toBe(true);
    });

    it("conserve les bornes du schéma de création", () => {
        expect(patchJobSchema.safeParse({remote: 7}).success).toBe(false);
    });
});

describe("addressSchema", () => {
    it("exige un libellé d'au moins 3 caractères", () => {
        expect(addressSchema.safeParse({label: "Rue de la Paix, Paris"}).success).toBe(true);
        expect(addressSchema.safeParse({label: "ab"}).success).toBe(false);
    });

    it("accepte des coordonnées nulles, une adresse peut ne pas être géocodée", () => {
        const result = addressSchema.safeParse({
            label: "Lieu-dit Les Granges",
            latitude: null,
            longitude: null,
            city: null,
        });

        expect(result.success).toBe(true);
    });

    it("refuse des coordonnées transmises en chaîne", () => {
        const result = addressSchema.safeParse({label: "8 rue de Londres", latitude: "48.87"});

        expect(result.success).toBe(false);
    });
});
