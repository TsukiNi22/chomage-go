import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {errorHandler} from "./errorHandler.middleware.ts";
import {HttpError} from "../types/httpError.ts";
import {mockRequest, mockResponse} from "../testing/express.mocks.ts";

beforeEach(() => {
    // errorHandler journalise systématiquement : on garde la sortie des tests lisible.
    vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
});

function run(error: unknown) {
    const captured = mockResponse();
    errorHandler(error, mockRequest(), captured.res, () => {});
    return captured;
}

describe("errorHandler", () => {
    it("reprend le statut et le message d'une HttpError", () => {
        const captured = run(new HttpError(404, "Offre introuvable"));

        expect(captured.status).toBe(404);
        expect(captured.body).toEqual({error: "Offre introuvable"});
    });

    it("fusionne le bloc de détails dans la réponse", () => {
        const captured = run(
            new HttpError(403, "Ce compte est suspendu", {
                moderation: {state: "suspended", source: "account"},
            }),
        );

        expect(captured.body).toEqual({
            error: "Ce compte est suspendu",
            moderation: {state: "suspended", source: "account"},
        });
    });

    it("bascule en 500 pour une erreur non typée, en conservant son message", () => {
        const captured = run(new Error("boom"));

        expect(captured.status).toBe(500);
        expect(captured.body).toEqual({error: "boom"});
    });

    it("retombe sur un message générique quand l'erreur n'en porte pas", () => {
        const captured = run({});

        expect(captured.status).toBe(500);
        expect(captured.body).toEqual({error: "Internal Server Error"});
    });

    it("accepte aussi statusCode, utilisé par certaines librairies", () => {
        const captured = run({statusCode: 413, message: "Payload too large"});

        expect(captured.status).toBe(413);
    });

    it("ignore un bloc de détails qui n'est pas un objet", () => {
        const captured = run({status: 400, message: "Requête invalide", details: "oups"});

        expect(captured.body).toEqual({error: "Requête invalide"});
    });
});
