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

export type CompanySummary = {
    id: number;
    name: string;
    siret: string;
    description: string | null;
    link: string | null;
    employeeRange: number;
};

export async function postCompany(
    name: string,
    siret: string,
): Promise<CompanySummary | null> {
    let response;
    try {
        response = await fetch(API_URL + "/api/companies", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, siret, employee_range: 0 }),
        });
    } catch {
        return null;
    }

    if (!response.ok) {
        return null;
    }

    return await response.json();
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
    company?: CompanySummary | null;
};

export type ApiApplication = {
    id: number;
    jobId: number;
    description: string | null;
    createdAt: string | null;
    job: {
        title: string;
        type: number;
        company: { name: string } | null;
        address: { city: string | null } | null;
    } | null;
};

export async function fetchApplications(): Promise<ApiApplication[]> {
    let response;
    try {
        response = await fetch(API_URL + "/api/applications", {
            credentials: "include",
        });
    } catch {
        return [];
    }

    if (!response.ok) {
        return [];
    }

    return await response.json();
}

export async function postApplication(
    jobId: number,
    description: string,
): Promise<boolean> {
    const payload: { job_id: number; description?: string } = { job_id: jobId };
    if (description !== "") {
        payload.description = description;
    }

    let response;
    try {
        response = await fetch(API_URL + "/api/applications", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    } catch {
        return false;
    }

    if (response.status === 409) {
        return true;
    }

    return response.ok;
}

export async function deleteApplication(id: number): Promise<boolean> {
    let response;
    try {
        response = await fetch(API_URL + "/api/applications/" + id, {
            method: "DELETE",
            credentials: "include",
        });
    } catch {
        return false;
    }

    return response.ok;
}

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
export type EmployerJob = {
    id: number;
    title: string;
    description: string | null;
    type: number;
    sector: string | null;
    remote: number;
    salaryMin: number | null;
    salaryMax: number | null;
    maxApplicants: number | null;
    companiesId: number;
    skills?: { id: number; name: string }[];
};

export type Applicant = {
    id: number;
    jobId: number;
    description: string | null;
    status: number;
    createdAt: string | null;
    user: {
        id: number;
        firstname: string;
        lastname: string;
        email: string;
        emailContact: string | null;
        description: string | null;
        resume: string | null;
        address: string | null;
        skills: { id: number; name: string }[];
    } | null;
};

export async function fetchCompanyJobs(companiesId: number): Promise<EmployerJob[]> {
    let response;
    try {
        response = await fetch(API_URL + "/api/jobs", { credentials: "include" });
    } catch {
        return [];
    }

    if (!response.ok) {
        return [];
    }

    const rows = (await response.json()) as EmployerJob[];

    return rows.filter(function (row) {
        return row.companiesId === companiesId;
    });
}

export async function fetchJobApplicants(jobId: number): Promise<Applicant[]> {
    let response;
    try {
        response = await fetch(API_URL + "/api/jobs/" + jobId + "/applications", {
            credentials: "include",
        });
    } catch {
        return [];
    }

    if (!response.ok) {
        return [];
    }

    return await response.json();
}

export async function setApplicationStatus(
    id: number,
    status: number,
): Promise<boolean> {
    let response;
    try {
        response = await fetch(API_URL + "/api/applications/" + id, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
    } catch {
        return false;
    }

    return response.ok;
}

export type NewJobInput = {
    companies_id: number;
    title: string;
    description?: string;
    type: number;
    sector?: string;
    remote?: number;
    salary_min: number;
    salary_max?: number;
    max_applicants?: number;
};

export async function postJob(input: NewJobInput): Promise<EmployerJob | null> {
    let response;
    try {
        response = await fetch(API_URL + "/api/jobs", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
        });
    } catch {
        return null;
    }

    if (!response.ok) {
        return null;
    }

    return await response.json();
}

export async function deleteJob(id: number): Promise<boolean> {
    let response;
    try {
        response = await fetch(API_URL + "/api/jobs/" + id, {
            method: "DELETE",
            credentials: "include",
        });
    } catch {
        return false;
    }

    return response.ok;
}

export async function postJobSkill(jobId: number, name: string): Promise<boolean> {
    let response;
    try {
        response = await fetch(API_URL + "/api/jobs/" + jobId + "/skills", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        });
    } catch {
        return false;
    }

    return response.ok;
}

export async function fetchJobSkills(
    jobId: number,
): Promise<{ id: number; name: string }[]> {
    let response;
    try {
        response = await fetch(API_URL + "/api/jobs/" + jobId + "/skills");
    } catch {
        return [];
    }

    if (!response.ok) {
        return [];
    }

    return await response.json();
}
