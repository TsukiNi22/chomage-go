import { API_URL } from "./env";
import type { Job } from "./jobs";

const CONTRACTS: Job["contract"][] = ["CDI", "CDD", "Alternance", "Stage"];
const REMOTES: Job["remote"][] = ["Aucun", "Partiel", "Total"];

type ApiAddress = {
    street: string | null;
    postalCode: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
    lambertX: number | null;
    lambertY: number | null;
    geocodingSource: string | null;
    geocodingScore: number | null;
    geocodedAt: string | null;
    needsLocationCheck: boolean;
};

type ApiJob = {
    id: number;
    title: string;
    description: string | null;
    type: number;
    sector: string | null;
    remote: number;
    salaryMin: number | null;
    salaryMax: number | null;
    createdAt: string | null;
    company: { name: string } | null;
    address: ApiAddress | null;
};

function toJob(row: ApiJob): Job {
    const address = row.address;

    let contract = CONTRACTS[row.type];
    if (contract === undefined) {
        contract = "CDI";
    }

    let remote = REMOTES[row.remote];
    if (remote === undefined) {
        remote = "Aucun";
    }

    let company = "Employeur non renseigné";
    if (row.company !== null) {
        company = row.company.name;
    }

    let publishedAt = "";
    if (row.createdAt !== null) {
        publishedAt = row.createdAt;
    }

    let needsLocationCheck = true;
    if (address !== null && address.latitude !== null && address.longitude !== null) {
        needsLocationCheck = address.needsLocationCheck;
    }

    return {
        id: row.id,
        title: row.title,
        company: company,
        sector: row.sector || "Non renseigné",
        contract: contract,
        city: address?.city || "",
        postalCode: address?.postalCode || "",
        address: address?.street || "",
        lat: address?.latitude || 0,
        lon: address?.longitude || 0,
        lambertX: address?.lambertX ?? null,
        lambertY: address?.lambertY ?? null,
        geocodingSource: address?.geocodingSource ?? null,
        geocodingScore: address?.geocodingScore ?? null,
        geocodedAt: address?.geocodedAt ?? null,
        needsLocationCheck: needsLocationCheck,
        salaryMin: row.salaryMin || 0,
        salaryMax: row.salaryMax,
        remote: remote,
        publishedAt: publishedAt,
        description: row.description || "",
    };
}

function apiBase(): string {
    if (typeof window === "undefined" && process.env.BACKEND_URL) {
        return process.env.BACKEND_URL;
    }
    return API_URL;
}

export async function fetchJobs(): Promise<Job[]> {
    let response;
    try {
        response = await fetch(apiBase() + "/api/jobs", { cache: "no-store" });
    } catch {
        return [];
    }

    if (!response.ok) {
        return [];
    }

    const rows = (await response.json()) as ApiJob[];

    return rows.map(toJob);
}

export type UserProfile = {
    id: number;
    firstname: string;
    lastname: string;
    companiesId: number | null;
    emailContact: string | null;
    address: string | null;
    description: string | null;
    resume: string | null;
    rank?: number;
    email?: string;
    emailVerified?: boolean;
    localisation?: boolean;
};

export async function fetchMyProfile(): Promise<UserProfile | null> {
    const response = await fetch(API_URL + "/api/users", {
        credentials: "include",
    });

    if (!response.ok) {
        return null;
    }

    return await response.json();
}

export async function fetchUserDataExport(): Promise<unknown> {
    const response = await fetch(API_URL + "/api/extract", {
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("L'export a échoué (statut " + response.status + ")");
    }

    return await response.json();
}