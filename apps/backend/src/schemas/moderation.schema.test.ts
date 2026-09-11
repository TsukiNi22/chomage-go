import {describe, expect, it} from "vitest";
import {moderationSchema, rankSchema, reportStatusSchema} from "./admin.schema.ts";
import {postReportSchema, REPORT_REASONS} from "./reports.schema.ts";
import {patchApplicationSchema, postApplicationSchema} from "./applications.schema.ts";

describe("moderationSchema", () => {
    it("n'accepte que les trois actions de modération", () => {
        for (const action of ["suspend", "reactivate", "ban"]) {
            expect(moderationSchema.safeParse({action: action}).success, action).toBe(true);
        }
        expect(moderationSchema.safeParse({action: "delete"}).success).toBe(false);
    });

    it("limite le motif à 500 caractères", () => {
        expect(moderationSchema.safeParse({action: "ban", reason: "x".repeat(500)}).success).toBe(true);
        expect(moderationSchema.safeParse({action: "ban", reason: "x".repeat(501)}).success).toBe(false);
    });

    it("rend le motif facultatif", () => {
        expect(moderationSchema.safeParse({action: "reactivate"}).success).toBe(true);
    });
});

describe("rankSchema", () => {
    it("couvre exactement les rangs 0 à 2", () => {
        expect(rankSchema.safeParse({rank: 0}).success).toBe(true);
        expect(rankSchema.safeParse({rank: 2}).success).toBe(true);
        expect(rankSchema.safeParse({rank: 3}).success).toBe(false);
        expect(rankSchema.safeParse({rank: -1}).success).toBe(false);
    });
});

describe("reportStatusSchema / patchApplicationSchema", () => {
    it("bornent leurs statuts à 0, 1 ou 2", () => {
        for (const status of [0, 1, 2]) {
            expect(reportStatusSchema.safeParse({status: status}).success).toBe(true);
            expect(patchApplicationSchema.safeParse({status: status}).success).toBe(true);
        }
        expect(reportStatusSchema.safeParse({status: 3}).success).toBe(false);
        expect(patchApplicationSchema.safeParse({status: 3}).success).toBe(false);
    });

    it("exigent le statut", () => {
        expect(patchApplicationSchema.safeParse({}).success).toBe(false);
    });
});

describe("postReportSchema", () => {
    it("n'accepte que les motifs de la liste fermée", () => {
        for (const reason of REPORT_REASONS) {
            expect(postReportSchema.safeParse({reason: reason}).success, reason).toBe(true);
        }
        expect(postReportSchema.safeParse({reason: "je-n-aime-pas"}).success).toBe(false);
    });

    it("accepte n'importe laquelle des trois cibles", () => {
        expect(postReportSchema.safeParse({reason: "spam", job_id: 4}).success).toBe(true);
        expect(postReportSchema.safeParse({reason: "spam", user_id: 4}).success).toBe(true);
        expect(postReportSchema.safeParse({reason: "spam", company_id: 4}).success).toBe(true);
    });

    it("limite la description à 1000 caractères", () => {
        expect(postReportSchema.safeParse({reason: "autre", description: "x".repeat(1001)}).success).toBe(false);
    });
});

describe("postApplicationSchema", () => {
    it("exige l'offre visée", () => {
        expect(postApplicationSchema.safeParse({job_id: 12}).success).toBe(true);
        expect(postApplicationSchema.safeParse({description: "Bonjour"}).success).toBe(false);
    });

    it("rend la lettre de motivation facultative", () => {
        expect(postApplicationSchema.safeParse({job_id: 12}).success).toBe(true);
    });
});
