import {describe, expect, it} from "vitest";
import {
    patchUserSchema,
    postAvailabilitySchema,
    postExperienceSchema,
} from "./users.schema.ts";

const PDF = "data:application/pdf;base64,JVBERi0xLjQK";

describe("patchUserSchema", () => {
    it("accepte une mise à jour partielle", () => {
        expect(patchUserSchema.safeParse({firstname: "Marc"}).success).toBe(true);
    });

    it("n'accepte un CV que sous forme de PDF encodé en base64", () => {
        expect(patchUserSchema.safeParse({resume: PDF}).success).toBe(true);
        expect(patchUserSchema.safeParse({resume: ""}).success).toBe(true); // suppression du CV
        expect(patchUserSchema.safeParse({resume: "data:text/html;base64,PHNjcmlwdD4="}).success).toBe(false);
        expect(patchUserSchema.safeParse({resume: "https://exemple.fr/cv.pdf"}).success).toBe(false);
        expect(patchUserSchema.safeParse({resume: "javascript:alert(1)"}).success).toBe(false);
    });

    it("valide le format de l'adresse de contact", () => {
        expect(patchUserSchema.safeParse({email_contact: "marc@exemple.fr"}).success).toBe(true);
        expect(patchUserSchema.safeParse({email_contact: "marc(at)exemple.fr"}).success).toBe(false);
    });

    it("ne laisse pas modifier le rang ni l'entreprise de rattachement", () => {
        const parsed = patchUserSchema.parse({firstname: "Marc", rank: 0, companies_id: 1});

        expect(parsed).toEqual({firstname: "Marc"});
    });
});

describe("postExperienceSchema", () => {
    it("exige un intitulé, un type et le temps partiel", () => {
        expect(postExperienceSchema.safeParse({name: "Stage", type: 0, part_time: false}).success).toBe(true);
        expect(postExperienceSchema.safeParse({name: "Stage", type: 0}).success).toBe(false);
    });

    it("attend des dates ISO 8601", () => {
        const base = {name: "Stage", type: 0, part_time: false};

        expect(postExperienceSchema.safeParse({...base, start: "2026-01-15T00:00:00Z"}).success).toBe(true);
        expect(postExperienceSchema.safeParse({...base, start: "15/01/2026"}).success).toBe(false);
    });
});

describe("postAvailabilitySchema", () => {
    it("exige une date de début, la fin restant ouverte", () => {
        const base = {type: 0, part_time: false};

        expect(postAvailabilitySchema.safeParse({...base, start: "2026-01-15T00:00:00Z"}).success).toBe(true);
        expect(postAvailabilitySchema.safeParse(base).success).toBe(false);
    });
});
