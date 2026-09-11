import {describe, expect, it} from "vitest";
import {isUniqueViolation} from "./dbError.utils.ts";

describe("isUniqueViolation", () => {
    it("ignore les valeurs vides", () => {
        expect(isUniqueViolation(null)).toBe(false);
        expect(isUniqueViolation(undefined)).toBe(false);
    });

    it("reconnaît le code PostgreSQL 23505", () => {
        expect(isUniqueViolation({code: "23505"})).toBe(true);
    });

    it("rejette les autres codes SQL", () => {
        expect(isUniqueViolation({code: "23503"})).toBe(false); // violation de clé étrangère
        expect(isUniqueViolation({code: "42P01"})).toBe(false); // table inconnue
    });

    it("descend dans la chaîne des causes", () => {
        // Drizzle enveloppe l'erreur du pilote : le code n'est pas au premier niveau.
        const error = {message: "insert failed", cause: {cause: {code: "23505"}}};

        expect(isUniqueViolation(error)).toBe(true);
    });

    it("s'arrête quand aucune cause ne porte le code", () => {
        expect(isUniqueViolation({cause: {cause: {code: "42P01"}}})).toBe(false);
    });

    it("ne confond pas le code avec un nombre", () => {
        expect(isUniqueViolation({code: 23505})).toBe(false);
    });
});
