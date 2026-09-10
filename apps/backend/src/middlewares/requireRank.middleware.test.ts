import {describe, expect, it, vi} from "vitest";
import {requireRank} from "./requireRank.middleware.ts";
import {mockRequest, mockResponse} from "../testing/express.mocks.ts";

const ADMIN = 0;
const EMPLOYER = 1;
const JOB_SEEKER = 2;

describe("requireRank", () => {
    it("refuse une requête sans utilisateur authentifié", () => {
        const captured = mockResponse();
        const next = vi.fn();

        requireRank(ADMIN)(mockRequest(), captured.res, next);

        expect(captured.status).toBe(401);
        expect(captured.body).toEqual({error: "Non authentifié"});
        expect(next).not.toHaveBeenCalled();
    });

    it("refuse un rang non autorisé", () => {
        const captured = mockResponse();
        const next = vi.fn();
        const req = mockRequest({user: {id: "7", rank: JOB_SEEKER}} as any);

        requireRank(ADMIN)(req, captured.res, next);

        expect(captured.status).toBe(403);
        expect(captured.body).toEqual({error: "Accès refusé"});
        expect(next).not.toHaveBeenCalled();
    });

    it("laisse passer un rang autorisé", () => {
        const captured = mockResponse();
        const next = vi.fn();
        const req = mockRequest({user: {id: "7", rank: ADMIN}} as any);

        requireRank(ADMIN)(req, captured.res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(captured.calls).toBe(0);
    });

    it("accepte plusieurs rangs", () => {
        const guard = requireRank(ADMIN, EMPLOYER);
        const next = vi.fn();

        guard(mockRequest({user: {rank: EMPLOYER}} as any), mockResponse().res, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    it("refuse tout le monde si aucun rang n'est déclaré", () => {
        const captured = mockResponse();
        const next = vi.fn();

        requireRank()(mockRequest({user: {rank: ADMIN}} as any), captured.res, next);

        expect(captured.status).toBe(403);
        expect(next).not.toHaveBeenCalled();
    });

    it("refuse un utilisateur sans rang plutôt que de le traiter comme admin", () => {
        const captured = mockResponse();
        const next = vi.fn();

        requireRank(ADMIN)(mockRequest({user: {id: "7"}} as any), captured.res, next);

        expect(captured.status).toBe(403);
        expect(next).not.toHaveBeenCalled();
    });
});
