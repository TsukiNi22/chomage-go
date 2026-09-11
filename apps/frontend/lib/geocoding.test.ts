import {afterEach, describe, expect, it, vi} from "vitest";
import {normalize, searchPlace, searchPlaces} from "./geocoding";

function feature(label: string, lon: number, lat: number, score: number) {
    return {properties: {label: label, score: score}, geometry: {coordinates: [lon, lat]}};
}

// La doublure garde la signature de fetch : les assertions sur mock.calls
// restent typees (url, puis options).
function stubFetch(impl: () => unknown) {
    const mock = vi.fn((..._args: Parameters<typeof fetch>) => impl());
    vi.stubGlobal("fetch", mock);
    return mock;
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("normalize", () => {
    it("retire les accents et met en minuscules", () => {
        expect(normalize("Nîmes")).toBe("nimes");
        expect(normalize("SAINT-ÉTIENNE")).toBe("saint-etienne");
        expect(normalize("Où")).toBe("ou");
    });

    it("supprime les espaces de bord", () => {
        expect(normalize("  Lyon  ")).toBe("lyon");
    });

    it("permet une comparaison insensible à la saisie", () => {
        expect(normalize("Élancourt")).toBe(normalize("elancourt"));
    });
});

describe("searchPlaces", () => {
    it("inverse les coordonnées GeoJSON : la BAN renvoie [lon, lat]", async () => {
        stubFetch(() => ({
            ok: true,
            json: async () => ({features: [feature("Paris", 2.3522, 48.8566, 0.98)]}),
        }));

        const places = await searchPlaces("paris");

        expect(places).toEqual([{label: "Paris", lat: 48.8566, lon: 2.3522, score: 0.98}]);
    });

    it("transmet la requête encodée et la limite demandée", async () => {
        const mock = stubFetch(() => ({ok: true, json: async () => ({features: []})}));

        await searchPlaces("saint-étienne du rouvray", 3);

        const url = String(mock.mock.calls[0][0]);
        expect(url).toContain("https://api-adresse.data.gouv.fr/search/");
        expect(url).toContain("q=saint-%C3%A9tienne%20du%20rouvray");
        expect(url).toContain("limit=3");
    });

    it("demande 5 résultats par défaut", async () => {
        const mock = stubFetch(() => ({ok: true, json: async () => ({features: []})}));

        await searchPlaces("lyon");

        expect(String(mock.mock.calls[0][0])).toContain("limit=5");
    });

    it("rend une liste vide quand la BAN est injoignable", async () => {
        stubFetch(() => {
            throw new Error("offline");
        });

        await expect(searchPlaces("lyon")).resolves.toEqual([]);
    });

    it("rend une liste vide sur une réponse en erreur", async () => {
        stubFetch(() => ({ok: false, json: async () => ({})}));

        await expect(searchPlaces("lyon")).resolves.toEqual([]);
    });

    it("rend une liste vide quand la réponse ne contient pas de features", async () => {
        stubFetch(() => ({ok: true, json: async () => ({})}));

        await expect(searchPlaces("lyon")).resolves.toEqual([]);
    });
});

describe("searchPlace", () => {
    it("ne garde que le premier résultat", async () => {
        stubFetch(() => ({
            ok: true,
            json: async () => ({
                features: [feature("Lyon", 4.8357, 45.764, 0.9), feature("Lyon 2e", 4.82, 45.75, 0.8)],
            }),
        }));

        const place = await searchPlace("lyon");

        expect(place?.label).toBe("Lyon");
    });

    it("rend null quand rien ne correspond", async () => {
        stubFetch(() => ({ok: true, json: async () => ({features: []})}));

        await expect(searchPlace("zzzz")).resolves.toBeNull();
    });
});
