import {describe, expect, it} from "vitest";
import {HttpError} from "./httpError.ts";

describe("HttpError", () => {
    it("porte un statut et un message", () => {
        const error = new HttpError(404, "Offre introuvable");

        expect(error.status).toBe(404);
        expect(error.message).toBe("Offre introuvable");
        expect(error.details).toBeUndefined();
    });

    it("reste une Error, donc capturable par un catch générique", () => {
        const error = new HttpError(403, "Accès refusé");

        expect(error).toBeInstanceOf(Error);
    });

    it("transporte un bloc de détails optionnel", () => {
        const error = new HttpError(403, "Ce compte est suspendu", {
            moderation: {state: "suspended", source: "account"},
        });

        expect(error.details).toEqual({
            moderation: {state: "suspended", source: "account"},
        });
    });
});
