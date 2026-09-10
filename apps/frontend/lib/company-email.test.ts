import {describe, expect, it} from "vitest";
import {companyEmailError, emailDomain, isPublicDomain} from "./company-email";

describe("emailDomain", () => {
    it("extrait le domaine en minuscules", () => {
        expect(emailDomain("Claire.Dupont@Atelier-Numerique.FR")).toBe("atelier-numerique.fr");
    });

    it("prend le dernier arobase, pas le premier", () => {
        expect(emailDomain("bizarre@interne@exemple.fr")).toBe("exemple.fr");
    });

    it("rend une chaîne vide sans arobase", () => {
        expect(emailDomain("claire.dupont")).toBe("");
    });
});

describe("isPublicDomain", () => {
    it("reconnaît les messageries grand public", () => {
        expect(isPublicDomain("marc@gmail.com")).toBe(true);
        expect(isPublicDomain("marc@orange.fr")).toBe(true);
        expect(isPublicDomain("marc@yopmail.com")).toBe(true);
    });

    it("laisse passer un domaine d'entreprise", () => {
        expect(isPublicDomain("claire@atelier-numerique.fr")).toBe(false);
    });

    it("n'est pas trompé par un domaine qui contient un domaine public", () => {
        expect(isPublicDomain("claire@notgmail.com")).toBe(false);
        expect(isPublicDomain("claire@gmail.com.exemple.fr")).toBe(false);
    });
});

describe("companyEmailError", () => {
    it("accepte une adresse professionnelle", () => {
        expect(companyEmailError("claire@atelier-numerique.fr")).toBeNull();
    });

    it("exige une adresse", () => {
        expect(companyEmailError("   ")).toBe("L'adresse électronique est obligatoire.");
    });

    it("refuse une adresse sans domaine exploitable", () => {
        expect(companyEmailError("claire")).toBe("Cette adresse électronique est invalide.");
        expect(companyEmailError("claire@localhost")).toBe("Cette adresse électronique est invalide.");
    });

    it("oriente vers l'adresse professionnelle pour une messagerie grand public", () => {
        const message = companyEmailError("claire@gmail.com");

        expect(message).toContain("adresse professionnelle");
    });
});
