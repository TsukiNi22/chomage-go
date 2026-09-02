import data from "./jobs.json";

export type Job = {
    id: number;
    title: string;
    company: string;
    sector: string;
    contract: "CDI" | "CDD" | "Alternance" | "Stage";
    city: string;
    postalCode: string;
    address: string;
    lat: number;
    lon: number;
    lambertX: number | null;
    lambertY: number | null;
    geocodingSource: string | null;
    geocodingScore: number | null;
    geocodedAt: string | null;
    needsLocationCheck: boolean;
    salaryMin: number;
    salaryMax: number | null;
    remote: "Aucun" | "Partiel" | "Total";
    publishedAt: string;
    description: string;
};

export const jobs = data as Job[];

export function locatedJobs(list: Job[]): Job[] {
    return list.filter(function (job) {
        return job.needsLocationCheck === false;
    });
}
