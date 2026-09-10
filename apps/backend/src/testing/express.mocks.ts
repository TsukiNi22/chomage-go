import type {Request, Response} from "express";

/**
 * Doublures minimales d'Express pour tester middlewares et utilitaires
 * sans monter de serveur.
 */

export type CapturedResponse = {
    res: Response;
    /** Statut passé à res.status(), null si la réponse a été envoyée sans. */
    status: number | null;
    /** Dernier corps passé à res.json(). */
    body: any;
    /** Nombre d'appels à res.json(), pour vérifier qu'on ne répond qu'une fois. */
    calls: number;
};

export function mockResponse(): CapturedResponse
{
    const captured: CapturedResponse = {
        res: null as unknown as Response,
        status: null,
        body: null,
        calls: 0,
    };

    const res = {
        status(code: number) {
            captured.status = code;
            return res;
        },
        json(body: unknown) {
            captured.body = body;
            captured.calls = captured.calls + 1;
            return res;
        },
    };

    captured.res = res as unknown as Response;

    return captured;
}

export function mockRequest(overrides: Partial<Request> = {}): Request
{
    return {body: {}, params: {}, query: {}, headers: {}, ...overrides} as Request;
}
