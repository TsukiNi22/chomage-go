import {describe, expect, it} from "vitest";
import {isSafeResume, safeResume} from "./resume";

const PDF = "data:application/pdf;base64,JVBERi0xLjQKJcfsj6IK";

describe("isSafeResume", () => {
    it("accepte un PDF encodé en base64", () => {
        expect(isSafeResume(PDF)).toBe(true);
    });

    it("refuse les valeurs vides", () => {
        expect(isSafeResume(null)).toBe(false);
        expect(isSafeResume(undefined)).toBe(false);
        expect(isSafeResume("")).toBe(false);
    });

    it("refuse un autre type MIME, même en data URI", () => {
        expect(isSafeResume("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==")).toBe(false);
        expect(isSafeResume("data:image/svg+xml;base64,PHN2Zz4=")).toBe(false);
    });

    it("refuse un schéma d'URL exécutable", () => {
        expect(isSafeResume("javascript:alert(1)")).toBe(false);
        expect(isSafeResume("https://exemple.fr/cv.pdf")).toBe(false);
    });

    it("refuse un contenu hors alphabet base64", () => {
        expect(isSafeResume("data:application/pdf;base64,<script>")).toBe(false);
        expect(isSafeResume("data:application/pdf;base64,")).toBe(false);
    });

    it("refuse une charge utile accolée après le PDF", () => {
        expect(isSafeResume(PDF + '"><script>alert(1)</script>')).toBe(false);
    });
});

describe("safeResume", () => {
    it("rend la valeur quand elle est sûre", () => {
        expect(safeResume(PDF)).toBe(PDF);
    });

    it("rend null plutôt que de propager une valeur douteuse", () => {
        expect(safeResume("javascript:alert(1)")).toBeNull();
        expect(safeResume(null)).toBeNull();
    });
});
