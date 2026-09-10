import {beforeEach, describe, expect, it} from "vitest";
import {
    JOBS_CACHE_KEY,
    PUBLIC_CACHE_TTL_MS,
    clearPublicCache,
    invalidatePublicCache,
    readPublicCache,
    writePublicCache,
} from "./publicCache.utils.ts";

const T0 = 1_000_000;

beforeEach(() => {
    clearPublicCache();
});

describe("cache des reponses publiques", () => {
    it("ne rend rien pour une cle jamais ecrite", () => {
        expect(readPublicCache(JOBS_CACHE_KEY)).toBeNull();
    });

    it("relit la reponse memorisee", () => {
        writePublicCache(JOBS_CACHE_KEY, '[{"id":1}]', T0);

        expect(readPublicCache(JOBS_CACHE_KEY, T0 + 1)).toBe('[{"id":1}]');
    });

    it("reste valide pendant toute la duree de vie", () => {
        writePublicCache(JOBS_CACHE_KEY, "[]", T0);

        expect(readPublicCache(JOBS_CACHE_KEY, T0 + PUBLIC_CACHE_TTL_MS - 1)).toBe("[]");
    });

    it("expire une fois la duree de vie atteinte", () => {
        writePublicCache(JOBS_CACHE_KEY, "[]", T0);

        expect(readPublicCache(JOBS_CACHE_KEY, T0 + PUBLIC_CACHE_TTL_MS)).toBeNull();
    });

    it("libere l'entree expiree au lieu de la garder en memoire", () => {
        writePublicCache(JOBS_CACHE_KEY, "[]", T0);
        readPublicCache(JOBS_CACHE_KEY, T0 + PUBLIC_CACHE_TTL_MS);

        // Une seconde lecture, meme anterieure a l'expiration, ne doit plus rien rendre.
        expect(readPublicCache(JOBS_CACHE_KEY, T0 + 1)).toBeNull();
    });

    it("purge immediatement sur invalidation — une offre publiee doit apparaitre", () => {
        writePublicCache(JOBS_CACHE_KEY, '[{"id":1}]', T0);

        invalidatePublicCache(JOBS_CACHE_KEY);

        expect(readPublicCache(JOBS_CACHE_KEY, T0 + 1)).toBeNull();
    });

    it("n'invalide que la cle visee", () => {
        writePublicCache("a", "1", T0);
        writePublicCache("b", "2", T0);

        invalidatePublicCache("a");

        expect(readPublicCache("a", T0 + 1)).toBeNull();
        expect(readPublicCache("b", T0 + 1)).toBe("2");
    });

    it("remet le compteur a zero a chaque ecriture", () => {
        writePublicCache(JOBS_CACHE_KEY, "[]", T0);
        writePublicCache(JOBS_CACHE_KEY, "[1]", T0 + PUBLIC_CACHE_TTL_MS - 1);

        expect(readPublicCache(JOBS_CACHE_KEY, T0 + PUBLIC_CACHE_TTL_MS + 1)).toBe("[1]");
    });
});
