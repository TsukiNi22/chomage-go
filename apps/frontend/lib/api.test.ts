import {afterEach, describe, expect, it, vi} from "vitest";
import {
    LIST_REVALIDATE_SECONDS,
    employeeRangeLabel,
    fetchJobs,
    postReport,
    reportReasonLabel,
    toJob,
} from "./api";
import type {ApiJob} from "./api";

function apiJob(overrides: Partial<ApiJob> = {}): ApiJob {
    return {
        id: 12,
        title: "Développeur back-end",
        description: "Node, Express, PostgreSQL",
        type: 0,
        sector: "Informatique",
        remote: 1,
        salaryMin: 32000,
        salaryMax: 40000,
        createdAt: "2026-08-01T10:00:00.000Z",
        companiesId: 3,
        company: {id: 3, name: "Atelier Numérique"},
        address: {
            street: "8 rue de Londres",
            postalCode: "75009",
            city: "Paris",
            latitude: 48.876,
            longitude: 2.331,
            lambertX: 651000,
            lambertY: 6863000,
            geocodingSource: "api-adresse",
            geocodingScore: 0.97,
            geocodedAt: "2026-08-01T10:00:01.000Z",
            needsLocationCheck: false,
        },
        skills: [
            {id: 1, name: "TypeScript"},
            {id: 2, name: "PostgreSQL"},
        ],
        ...overrides,
    };
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

describe("toJob", () => {
    it("mappe une offre complète", () => {
        const job = toJob(apiJob());

        expect(job).toMatchObject({
            id: 12,
            title: "Développeur back-end",
            company: "Atelier Numérique",
            companyId: 3,
            sector: "Informatique",
            contract: "CDI",
            remote: "Partiel",
            city: "Paris",
            postalCode: "75009",
            address: "8 rue de Londres",
            lat: 48.876,
            lon: 2.331,
            salaryMin: 32000,
            salaryMax: 40000,
            needsLocationCheck: false,
            skills: ["TypeScript", "PostgreSQL"],
        });
    });

    it("traduit l'index de contrat en libellé", () => {
        const labels = [0, 1, 2, 3].map((type) => toJob(apiJob({type: type})).contract);

        expect(labels).toEqual(["CDI", "CDD", "Alternance", "Stage"]);
    });

    it("retombe sur CDI pour un type de contrat inconnu", () => {
        expect(toJob(apiJob({type: 9})).contract).toBe("CDI");
    });

    it("traduit l'index de télétravail en libellé", () => {
        const labels = [0, 1, 2].map((remote) => toJob(apiJob({remote: remote})).remote);

        expect(labels).toEqual(["Aucun", "Partiel", "Total"]);
    });

    it("retombe sur « Aucun » pour un télétravail inconnu", () => {
        expect(toJob(apiJob({remote: 9})).remote).toBe("Aucun");
    });

    it("affiche une mention quand l'employeur n'est pas joint", () => {
        expect(toJob(apiJob({company: null})).company).toBe("Employeur non renseigné");
    });

    it("récupère l'entreprise depuis la relation quand companiesId manque", () => {
        const job = toJob(apiJob({companiesId: undefined, company: {id: 7, name: "Kelp"}}));

        expect(job.companyId).toBe(7);
    });

    it("laisse companyId à null quand rien ne le renseigne", () => {
        expect(toJob(apiJob({companiesId: undefined, company: null})).companyId).toBeNull();
    });

    it("écarte de la carte une offre sans coordonnées, même si la base la dit vérifiée", () => {
        const job = toJob(
            apiJob({
                address: {
                    street: null,
                    postalCode: null,
                    city: null,
                    latitude: null,
                    longitude: null,
                    lambertX: null,
                    lambertY: null,
                    geocodingSource: null,
                    geocodingScore: null,
                    geocodedAt: null,
                    needsLocationCheck: false,
                },
            }),
        );

        expect(job.needsLocationCheck).toBe(true);
        expect(job.lat).toBe(0);
        expect(job.lon).toBe(0);
    });

    it("gère une offre entièrement dépourvue d'adresse", () => {
        const job = toJob(apiJob({address: null}));

        expect(job.needsLocationCheck).toBe(true);
        expect(job.city).toBe("");
        expect(job.lambertX).toBeNull();
        expect(job.geocodingSource).toBeNull();
    });

    it("comble les champs facultatifs absents", () => {
        const job = toJob(
            apiJob({
                sector: null,
                description: null,
                salaryMin: null,
                salaryMax: null,
                createdAt: null,
                skills: undefined,
            }),
        );

        expect(job.sector).toBe("Non renseigné");
        expect(job.description).toBe("");
        expect(job.salaryMin).toBe(0);
        expect(job.salaryMax).toBeNull();
        expect(job.publishedAt).toBe("");
        expect(job.skills).toEqual([]);
    });
});

describe("employeeRangeLabel", () => {
    it("libelle les quatre tranches connues", () => {
        expect(employeeRangeLabel(0)).toBe("0 à 10 salariés");
        expect(employeeRangeLabel(3)).toBe("Plus de 500 salariés");
    });

    it("reste lisible pour une tranche hors barème", () => {
        expect(employeeRangeLabel(9)).toBe("Effectif non renseigné");
        expect(employeeRangeLabel(-1)).toBe("Effectif non renseigné");
    });
});

describe("reportReasonLabel", () => {
    it("traduit un motif connu", () => {
        expect(reportReasonLabel("offre-frauduleuse")).toBe("Offre frauduleuse");
    });

    it("rend la valeur brute pour un motif inconnu, plutôt qu'une case vide", () => {
        expect(reportReasonLabel("motif-inedit")).toBe("motif-inedit");
    });
});

describe("fetchJobs", () => {
    it("mappe les lignes renvoyées par l'API", async () => {
        stubFetch(() => ({ok: true, json: async () => [apiJob()]}));

        const jobs = await fetchJobs();

        expect(jobs).toHaveLength(1);
        expect(jobs[0].company).toBe("Atelier Numérique");
    });

    it("rend une liste vide quand l'API est injoignable", async () => {
        stubFetch(() => {
            throw new Error("ECONNREFUSED");
        });

        await expect(fetchJobs()).resolves.toEqual([]);
    });

    it("rend une liste vide sur une réponse en erreur", async () => {
        stubFetch(() => ({ok: false, json: async () => ({error: "boom"})}));

        await expect(fetchJobs()).resolves.toEqual([]);
    });

    it("laisse Next memoriser la liste quelques secondes plutot que de la refaire par visite", async () => {
        const mock = stubFetch(() => ({ok: true, json: async () => []}));

        await fetchJobs();

        expect(String(mock.mock.calls[0][0])).toBe("http://localhost:4000/api/jobs");
        expect(mock.mock.calls[0][1]).toMatchObject({
            next: {revalidate: LIST_REVALIDATE_SECONDS},
        });
        // Le rendu par requete etait la cause du plafond de debit mesure au k6.
        expect(mock.mock.calls[0][1]).not.toMatchObject({cache: "no-store"});
    });
});

describe("postReport", () => {
    const input = {job_id: 12, reason: "spam", description: "Offre répétée"};

    it("joint le cookie de session : sans lui l'API répond 401", async () => {
        const mock = stubFetch(() => ({ok: true, json: async () => ({})}));

        await postReport(input);

        expect(mock.mock.calls[0][1]).toMatchObject({
            method: "POST",
            credentials: "include",
        });
    });

    it("rend un succès sans message", async () => {
        stubFetch(() => ({ok: true, json: async () => ({})}));

        await expect(postReport(input)).resolves.toEqual({ok: true, message: null});
    });

    it("remonte le message d'erreur de l'API", async () => {
        stubFetch(() => ({ok: false, json: async () => ({error: "Signalement déjà déposé"})}));

        await expect(postReport(input)).resolves.toEqual({
            ok: false,
            message: "Signalement déjà déposé",
        });
    });

    it("retombe sur un message générique si la réponse n'est pas exploitable", async () => {
        stubFetch(() => ({
            ok: false,
            json: async () => {
                throw new Error("not json");
            },
        }));

        const result = await postReport(input);

        expect(result.message).toBe("Le signalement n'a pas pu être enregistré.");
    });

    it("distingue une panne réseau d'un refus de l'API", async () => {
        stubFetch(() => {
            throw new Error("ECONNREFUSED");
        });

        await expect(postReport(input)).resolves.toEqual({
            ok: false,
            message: "Le service ne répond pas. Réessayez.",
        });
    });
});
