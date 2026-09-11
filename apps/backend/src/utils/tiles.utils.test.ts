import {afterEach, describe, expect, it} from "vitest";
import {
    MAX_ZOOM,
    TILE_TTL_MS,
    isFresh,
    isValidTile,
    tileCacheDir,
    tileFileName,
    tileSourceUrl,
} from "./tiles.utils.ts";

const ORIGINAL_DIR = process.env.TILE_CACHE_DIR;

afterEach(() => {
    if (ORIGINAL_DIR === undefined) {
        delete process.env.TILE_CACHE_DIR;
    } else {
        process.env.TILE_CACHE_DIR = ORIGINAL_DIR;
    }
});

describe("isValidTile", () => {
    it("accepte des coordonnees dans la grille", () => {
        expect(isValidTile(0, 0, 0)).toBe(true);
        expect(isValidTile(6, 30, 20)).toBe(true);
        expect(isValidTile(12, 2073, 1408)).toBe(true);
        expect(isValidTile(MAX_ZOOM, 0, 0)).toBe(true);
    });

    it("refuse un zoom hors bornes", () => {
        expect(isValidTile(-1, 0, 0)).toBe(false);
        expect(isValidTile(MAX_ZOOM + 1, 0, 0)).toBe(false);
    });

    it("refuse une tuile en dehors de la grille du niveau", () => {
        // Au zoom 1 la grille fait 2x2 : les index valides sont 0 et 1.
        expect(isValidTile(1, 1, 1)).toBe(true);
        expect(isValidTile(1, 2, 0)).toBe(false);
        expect(isValidTile(1, 0, 2)).toBe(false);
        expect(isValidTile(1, -1, 0)).toBe(false);
    });

    it("refuse ce qui n'est pas un entier — la route construit un nom de fichier", () => {
        expect(isValidTile(NaN, 0, 0)).toBe(false);
        expect(isValidTile(1.5, 0, 0)).toBe(false);
        expect(isValidTile(1, 0.5, 0)).toBe(false);
        expect(isValidTile(Infinity, 0, 0)).toBe(false);
    });

    it("refuse les valeurs qui tenteraient une traversee de chemin", () => {
        // Number("../..") vaut NaN : la barriere tient avant tout acces disque.
        expect(isValidTile(Number("../.."), 0, 0)).toBe(false);
        expect(isValidTile(Number("2/../../etc"), 0, 0)).toBe(false);
    });
});

describe("tileFileName", () => {
    it("suit la convention z-x-y.png du cache existant", () => {
        expect(tileFileName(10, 515, 351)).toBe("10-515-351.png");
        expect(tileFileName(6, 30, 20)).toBe("6-30-20.png");
    });
});

describe("tileSourceUrl", () => {
    it("cible la couche PLAN IGN v2 en tuiles PM", () => {
        const url = tileSourceUrl(12, 2073, 1408);

        expect(url).toContain("data.geopf.fr/wmts");
        expect(url).toContain("LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2");
        expect(url).toContain("TILEMATRIXSET=PM");
    });

    it("place x en colonne et y en ligne, comme l'attend le WMTS", () => {
        const url = tileSourceUrl(12, 2073, 1408);

        expect(url).toContain("TILEMATRIX=12");
        expect(url).toContain("TILECOL=2073");
        expect(url).toContain("TILEROW=1408");
    });
});

describe("isFresh", () => {
    const now = 2_000_000_000_000;

    it("considere fraiche une tuile recente", () => {
        expect(isFresh(now - 1000, now)).toBe(true);
    });

    it("considere perimee une tuile au-dela de la duree de vie", () => {
        expect(isFresh(now - TILE_TTL_MS, now)).toBe(false);
        expect(isFresh(now - TILE_TTL_MS - 1, now)).toBe(false);
    });
});

describe("tileCacheDir", () => {
    it("est configurable par TILE_CACHE_DIR", () => {
        process.env.TILE_CACHE_DIR = "/tmp/tuiles-test";

        expect(tileCacheDir()).toBe("/tmp/tuiles-test");
    });

    it("rend un chemin absolu meme pour un defaut relatif", () => {
        delete process.env.TILE_CACHE_DIR;

        expect(tileCacheDir().startsWith("/")).toBe(true);
        expect(tileCacheDir().endsWith(".cache/tuiles")).toBe(true);
    });
});
