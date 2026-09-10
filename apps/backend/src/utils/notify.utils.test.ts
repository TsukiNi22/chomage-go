import {describe, expect, it} from "vitest";
import {renderNewApplicationMail, renderVerificationMail} from "./notify.utils.ts";

const baseApplication = {
    to: "employeur@exemple.fr",
    employerName: "Claire Dupont",
    jobTitle: "Développeur back-end",
    companyName: "Atelier Numérique",
    candidateName: "Marc Petit",
    message: null,
};

describe("renderNewApplicationMail", () => {
    it("reprend les informations de la candidature", () => {
        const html = renderNewApplicationMail(baseApplication);

        expect(html).toContain("Marc Petit a postulé");
        expect(html).toContain("Développeur back-end");
        expect(html).toContain("Atelier Numérique");
        expect(html).toContain("Bonjour Claire Dupont");
    });

    it("signale l'absence de message plutôt que de laisser un bloc vide", () => {
        expect(renderNewApplicationMail(baseApplication)).toContain("Aucun message joint.");
    });

    it("traite une chaîne vide comme une absence de message", () => {
        const html = renderNewApplicationMail({...baseApplication, message: ""});

        expect(html).toContain("Aucun message joint.");
    });

    it("insère le message du candidat quand il y en a un", () => {
        const html = renderNewApplicationMail({
            ...baseApplication,
            message: "Disponible dès septembre.",
        });

        expect(html).toContain("Disponible dès septembre.");
        expect(html).not.toContain("Aucun message joint.");
    });

    it("échappe le HTML des champs remplis par un utilisateur", () => {
        const html = renderNewApplicationMail({
            ...baseApplication,
            candidateName: "<script>alert(1)</script>",
            message: 'Voir <a href="http://exemple.fr">ici</a> & la suite',
        });

        expect(html).not.toContain("<script>");
        expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
        expect(html).toContain("&lt;a href=&quot;http://exemple.fr&quot;&gt;");
        expect(html).toContain("&amp; la suite");
    });

    it("porte la mention légale du démonstrateur", () => {
        expect(renderNewApplicationMail(baseApplication)).toContain(
            "ne constitue pas un service public en exploitation",
        );
    });
});

describe("renderVerificationMail", () => {
    const input = {
        name: "Marc Petit",
        url: "http://localhost:4000/api/auth/verify-email?token=abc123",
    };

    it("affiche le lien deux fois : dans le bouton et en clair", () => {
        const html = renderVerificationMail(input);
        const occurrences = html.split(input.url).length - 1;

        expect(occurrences).toBe(2);
    });

    it("annonce la durée de validité du lien", () => {
        expect(renderVerificationMail(input)).toContain("expire dans une heure");
    });

    it("échappe l'URL avant de l'écrire dans l'attribut href", () => {
        const html = renderVerificationMail({
            name: "Marc",
            url: 'http://exemple.fr/?t=1" onmouseover="alert(1)',
        });

        expect(html).not.toContain('" onmouseover="alert(1)"');
        expect(html).toContain("&quot; onmouseover=&quot;alert(1)");
    });

    it("échappe aussi le nom du destinataire", () => {
        const html = renderVerificationMail({...input, name: "<b>Marc</b>"});

        expect(html).toContain("Bonjour &lt;b&gt;Marc&lt;/b&gt;");
    });
});
