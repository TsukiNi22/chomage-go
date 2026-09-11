import {describe, expect, it} from "vitest";
import {distanceInKm, formatDistance} from "./distance";

const PARIS = {lat: 48.8566, lon: 2.3522};
const LYON = {lat: 45.764, lon: 4.8357};

describe("distanceInKm", () => {
    it("rend 0 pour deux fois le même point", () => {
        expect(distanceInKm(PARIS.lat, PARIS.lon, PARIS.lat, PARIS.lon)).toBe(0);
    });

    it("calcule une distance orthodromique connue", () => {
        // Paris — Lyon : environ 392 km à vol d'oiseau.
        expect(distanceInKm(PARIS.lat, PARIS.lon, LYON.lat, LYON.lon)).toBeCloseTo(391.5, 0);
    });

    it("est symétrique", () => {
        const aller = distanceInKm(PARIS.lat, PARIS.lon, LYON.lat, LYON.lon);
        const retour = distanceInKm(LYON.lat, LYON.lon, PARIS.lat, PARIS.lon);

        expect(aller).toBeCloseTo(retour, 9);
    });

    it("reste précis sur de courtes distances", () => {
        // Un centième de degré de latitude vaut environ 1,11 km.
        expect(distanceInKm(48.8566, 2.3522, 48.8666, 2.3522)).toBeCloseTo(1.11, 2);
    });

    it("gère le passage du méridien de Greenwich", () => {
        const km = distanceInKm(48.8566, -0.5, 48.8566, 0.5);

        expect(km).toBeGreaterThan(0);
        expect(km).toBeCloseTo(73.3, 0);
    });
});

describe("formatDistance", () => {
    it("passe en mètres sous le kilomètre", () => {
        expect(formatDistance(0.4)).toBe("À 400 m");
        expect(formatDistance(0.999)).toBe("À 999 m");
        expect(formatDistance(0)).toBe("À 0 m");
    });

    it("garde une décimale, virgule française, sous 10 km", () => {
        expect(formatDistance(1)).toBe("À 1,0 km");
        expect(formatDistance(4.26)).toBe("À 4,3 km");
        expect(formatDistance(9.99)).toBe("À 10,0 km");
    });

    it("arrondit au kilomètre au-delà de 10 km", () => {
        expect(formatDistance(10)).toBe("À 10 km");
        expect(formatDistance(391.49)).toBe("À 391 km");
    });
});
