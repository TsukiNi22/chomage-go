import {describe, expect, it} from "vitest";
import {locatedJobs} from "./jobs";
import type {Job} from "./jobs";

function job(id: number, needsLocationCheck: boolean): Job {
    return {needsLocationCheck: needsLocationCheck, id: id} as Job;
}

describe("locatedJobs", () => {
    it("ne garde que les offres réellement géocodées", () => {
        const kept = locatedJobs([job(1, false), job(2, true), job(3, false)]);

        expect(kept.map((j) => j.id)).toEqual([1, 3]);
    });

    it("rend un tableau vide quand aucune offre n'est localisée", () => {
        expect(locatedJobs([job(1, true)])).toEqual([]);
    });

    it("ne modifie pas la liste d'origine", () => {
        const list = [job(1, false), job(2, true)];

        locatedJobs(list);

        expect(list).toHaveLength(2);
    });
});
