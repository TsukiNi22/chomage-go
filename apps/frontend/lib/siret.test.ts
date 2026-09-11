import {describe, expect, it} from "vitest";
import {formatSiret, isValidSiret, normalizeSiret, siretError} from "./siret";

const VALID = "73282932000074";

describe("normalizeSiret", () => {
    it("retire les espaces de la saisie", () => {
        expect(normalizeSiret("732 829 320 00074")).toBe(VALID);
        expect(normalizeSiret("  732\t829\n320 00074 ")).toBe(VALID);
    });
});

describe("isValidSiret", () => {
    it("accepte un SIRET dont la clé de contrôle est correcte", () => {
        expect(isValidSiret(VALID)).toBe(true);
        expect(isValidSiret("732 829 320 00074")).toBe(true);
    });

    it("rejette une clé de contrôle fausse", () => {
        expect(isValidSiret("12345678901234")).toBe(false);
    });

    it("rejette une longueur ou des caractères invalides", () => {
        expect(isValidSiret("7328293200007")).toBe(false);
        expect(isValidSiret("7328293200007A")).toBe(false);
        expect(isValidSiret("")).toBe(false);
    });

    it("applique la même règle que le backend", () => {
        // Le front pré-valide, le backend revalide : les deux doivent trancher pareil.
        for (const siret of ["55208131766522", "44306184100047", "39931587100034"]) {
            expect(isValidSiret(siret), siret).toBe(true);
        }
    });
});

describe("siretError", () => {
    it("ne rend aucun message pour un SIRET valide", () => {
        expect(siretError(VALID)).toBeNull();
    });

    it("signale une saisie vide", () => {
        expect(siretError("")).toBe("Le numéro de SIRET est obligatoire.");
        expect(siretError("   ")).toBe("Le numéro de SIRET est obligatoire.");
    });

    it("signale les caractères non numériques avant la longueur", () => {
        expect(siretError("ABC")).toBe("Le numéro de SIRET ne contient que des chiffres.");
    });

    it("signale une longueur incorrecte", () => {
        expect(siretError("1234")).toBe("Le numéro de SIRET comporte 14 chiffres.");
        expect(siretError("123456789012345")).toBe("Le numéro de SIRET comporte 14 chiffres.");
    });

    it("signale une clé de contrôle invalide en dernier recours", () => {
        expect(siretError("12345678901234")).toBe(
            "Ce numéro de SIRET est invalide (clé de contrôle incorrecte).",
        );
    });
});

describe("formatSiret", () => {
    it("groupe les chiffres en 3-3-3-5", () => {
        expect(formatSiret(VALID)).toBe("732 829 320 00074");
    });

    it("reformate une saisie déjà espacée", () => {
        expect(formatSiret("732829 32000074")).toBe("732 829 320 00074");
    });

    it("laisse une saisie incomplète telle quelle, sans espaces", () => {
        expect(formatSiret("732 829")).toBe("732829");
    });
});
