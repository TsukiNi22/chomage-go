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

export type ApiJob = {
    id: number;
    title: string;
    description: string | null;
    type: number;
    sector: string | null;
    remote: number;
    salaryMin: number | null;
    salaryMax: number | null;
    createdAt: string | null;
    companiesId?: number;
    company?: { id?: number; name: string } | null;
    address: ApiAddress | null;
    skills?: { id: number; name: string }[];
};

export function toJob(row: ApiJob): Job {
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
    if (row.company !== null && row.company !== undefined) {
        company = row.company.name;
    }

    let companyId: number | null = null;
    if (row.companiesId !== undefined) {
        companyId = row.companiesId;
    } else if (row.company !== null && row.company !== undefined && row.company.id !== undefined) {
        companyId = row.company.id;
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
        companyId: companyId,
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
        skills: (row.skills || []).map(function (skill) {
            return skill.name;
        }),
    };
}

async function errorMessage(
    response: Response,
    fallback: string,
): Promise<string> {
    try {
        const body = await response.json();
        if (body && typeof body.error === "string") {
            return body.error;
        }
    } catch {
        return fallback;
    }
    return fallback;
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

export type CompanyAddress = {
    label: string;
    street: string | null;
    postalCode: string | null;
    city: string | null;
    latitude: number | null;
    longitude: number | null;
};

export type CompanySummary = {
    id: number;
    name: string;
    siret: string;
    description: string | null;
    link: string | null;
    employeeRange: number;
    activity: string | null;
    legalName: string | null;
    sireneCheckedAt: string | null;
    addressId: number | null;
    suspendedAt?: string | null;
    bannedAt?: string | null;
    moderationReason?: string | null;
    address?: CompanyAddress | null;
};

export type CompanyListItem = CompanySummary & {
    jobsCount: number;
};

export const EMPLOYEE_RANGES = [
    "0 à 10 salariés",
    "11 à 100 salariés",
    "101 à 500 salariés",
    "Plus de 500 salariés",
];

export function employeeRangeLabel(range: number): string {
    const label = EMPLOYEE_RANGES[range];
    if (label === undefined) {
        return "Effectif non renseigné";
    }
    return label;
}

/** Entreprises visibles publiquement, avec leur nombre d'offres en ligne. */
export async function fetchCompanies(): Promise<CompanyListItem[]> {
    let response;
    try {
        response = await fetch(apiBase() + "/api/companies", {
            cache: "no-store",
        });
    } catch {
        return [];
    }

    if (!response.ok) {
        return [];
    }

    return await response.json();
}

export type SireneEstablishment = {
    siret: string;
    name: string;
    legalName: string | null;
    activity: string | null;
    employeeRange: number;
    address: CompanyAddress | null;
};

export type SireneLookup = {
    ok: boolean;
    establishment: SireneEstablishment | null;
    message: string | null;
};

/** Confronte un SIRET à l'annuaire des entreprises, sans rien enregistrer. */
export async function lookupSiret(siret: string): Promise<SireneLookup> {
    let response;
    try {
        response = await fetch(
            API_URL + "/api/companies/siret/" + encodeURIComponent(siret),
        );
    } catch {
        return {
            ok: false,
            establishment: null,
            message: "L'annuaire des entreprises ne répond pas. Réessayez.",
        };
    }

    if (response.ok) {
        return { ok: true, establishment: await response.json(), message: null };
    }

    return {
        ok: false,
        establishment: null,
        message: await errorMessage(
            response,
            "Ce numéro de SIRET n'a pas pu être vérifié.",
        ),
    };
}

export type CompanyResult = {
    company: CompanySummary | null;
    message: string | null;
};

/**
 * Rattache le compte courant à un établissement.
 * Le nom, l'activité et l'adresse proviennent de l'API Sirene, jamais du formulaire.
 */
export async function postCompany(siret: string): Promise<CompanyResult> {
    let response;
    try {
        response = await fetch(API_URL + "/api/companies", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ siret }),
        });
    } catch {
        return { company: null, message: "Le service ne répond pas. Réessayez." };
    }

    if (response.ok) {
        return { company: await response.json(), message: null };
    }

    return {
        company: null,
        message: await errorMessage(
            response,
            "L'entreprise n'a pas pu être enregistrée.",
        ),
    };
}

export async function fetchCompany(id: number): Promise<CompanyDetails | null> {
    let response;
    try {
        response = await fetch(apiBase() + "/api/companies/" + id, {
            cache: "no-store",
        });
    } catch {
        return null;
    }

    if (!response.ok) {
        return null;
    }

    return await response.json();
}

export type CompanyDetails = CompanySummary & {
    jobs: ApiJob[];
};

export async function patchCompany(
    id: number,
    values: { description?: string; link?: string },
): Promise<CompanySummary | null> {
    let response;
    try {
        response = await fetch(API_URL + "/api/companies/" + id, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
        });
    } catch {
        return null;
    }

    if (!response.ok) {
        return null;
    }

    return await response.json();
}

export async function refreshCompanyFromSirene(
    id: number,
): Promise<CompanySummary | null> {
    let response;
    try {
        response = await fetch(API_URL + "/api/companies/" + id + "/refresh", {
            method: "POST",
            credentials: "include",
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
    status: number;
    createdAt: string | null;
    job: {
        title: string;
        type: number;
        companiesId: number;
        company: { id: number; name: string } | null;
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

export type ApplyResult = {
    ok: boolean;
    message: string | null;
};

export async function postApplication(
    jobId: number,
    description: string,
): Promise<ApplyResult> {
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
        return { ok: false, message: "Le service ne répond pas. Réessayez." };
    }

    if (response.ok) {
        return { ok: true, message: null };
    }

    let message = "La candidature n'a pas pu être envoyée.";
    try {
        const body = await response.json();
        if (body && typeof body.error === "string") {
            message = body.error;
        }
    } catch {
        message = "La candidature n'a pas pu être envoyée.";
    }

    if (message.includes("déjà postulé")) {
        return { ok: true, message: null };
    }

    return { ok: false, message: message };
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

export type AccountModeration = {
    state: "suspended" | "banned";
    reason: string | null;
    since: string | null;
};

export type AccountState = {
    profile: UserProfile | null;
    moderation: AccountModeration | null;
};

/**
 * Charge le profil, en distinguant l'indisponibilité du service d'un compte modéré :
 * l'API répond 403 avec le motif quand le compte est suspendu ou banni.
 */
export async function fetchAccountState(): Promise<AccountState> {
    let response;
    try {
        response = await fetch(API_URL + "/api/users", {
            credentials: "include",
        });
    } catch {
        return { profile: null, moderation: null };
    }

    if (response.ok) {
        return { profile: await response.json(), moderation: null };
    }

    if (response.status === 403) {
        try {
            const body = await response.json();
            if (body && body.moderation) {
                return { profile: null, moderation: body.moderation };
            }
        } catch {
            return { profile: null, moderation: null };
        }
    }

    return { profile: null, moderation: null };
}

export async function fetchPublicProfile(id: number): Promise<UserProfile | null> {
    let response;
    try {
        response = await fetch(API_URL + "/api/users/" + id, {
            credentials: "include",
        });
    } catch {
        return null;
    }

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
    address?: { city: string | null; label: string } | null;
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
        emailVerified: boolean;
        description: string | null;
        resume: string | null;
        address: string | null;
        createdAt: string | null;
        suspendedAt: string | null;
        bannedAt: string | null;
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

export type NewJobAddress = {
    label: string;
    street?: string | null;
    postal_code?: string | null;
    city?: string | null;
    latitude?: number | null;
    longitude?: number | null;
};

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
    address?: NewJobAddress;
};

export type NewJobResult = {
    job: EmployerJob | null;
    message: string | null;
};

export async function postJob(input: NewJobInput): Promise<NewJobResult> {
    let response;
    try {
        response = await fetch(API_URL + "/api/jobs", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
        });
    } catch {
        return { job: null, message: "Le service ne répond pas. Réessayez." };
    }

    if (response.ok) {
        return { job: await response.json(), message: null };
    }

    return {
        job: null,
        message: await errorMessage(
            response,
            "La publication a échoué. Une offre du même intitulé existe peut-être déjà.",
        ),
    };
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

export async function patchJobSkill(
    jobId: number,
    skillId: number,
    name: string,
): Promise<boolean> {
    let response;
    try {
        response = await fetch(
            API_URL + "/api/jobs/" + jobId + "/skills/" + skillId,
            {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            },
        );
    } catch {
        return false;
    }

    return response.ok;
}

export async function deleteJobSkill(
    jobId: number,
    skillId: number,
): Promise<boolean> {
    let response;
    try {
        response = await fetch(
            API_URL + "/api/jobs/" + jobId + "/skills/" + skillId,
            { method: "DELETE", credentials: "include" },
        );
    } catch {
        return false;
    }

    return response.ok;
}

export type AdminMetrics = {
    users: number;
    companies: number;
    jobs: number;
    applications: number;
    suspended: number;
    banned: number;
    reports: number;
    openReports: number;
    byRank: { rank: number; total: number }[];
    byApplicationStatus: { status: number; total: number }[];
    topCities: { city: string | null; total: number }[];
    topSectors: { sector: string | null; total: number }[];
};

export type AdminUser = {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    rank: number;
    companiesId: number | null;
    suspendedAt: string | null;
    bannedAt: string | null;
    moderationReason: string | null;
    createdAt: string | null;
    lastLoginAt: string | null;
    company: { name: string } | null;
};

export async function fetchAdminMetrics(): Promise<AdminMetrics | null> {
    let response;
    try {
        response = await fetch(API_URL + "/api/admin/metrics", {
            credentials: "include",
        });
    } catch {
        return null;
    }

    if (!response.ok) {
        return null;
    }

    return await response.json();
}

export type AdminUserFilters = {
    q?: string;
    rank?: string;
    state?: string;
};

function queryString(filters: Record<string, string | undefined>): string {
    const params = new URLSearchParams();

    for (const key of Object.keys(filters)) {
        const value = filters[key];
        if (value !== undefined && value !== "") {
            params.set(key, value);
        }
    }

    const query = params.toString();
    if (query === "") {
        return "";
    }
    return "?" + query;
}

export async function fetchAdminUsers(
    filters: AdminUserFilters = {},
): Promise<AdminUser[]> {
    let response;
    try {
        response = await fetch(
            API_URL + "/api/admin/users" + queryString(filters),
            { credentials: "include" },
        );
    } catch {
        return [];
    }

    if (!response.ok) {
        return [];
    }

    return await response.json();
}

export type AdminJob = {
    id: number;
    title: string;
    sector: string | null;
    type: number;
    remote: number;
    salaryMin: number | null;
    salaryMax: number | null;
    createdAt: string | null;
    applicantsCount: number;
    companiesId: number;
    company: { id: number; name: string } | null;
    address: { city: string | null; postalCode: string | null } | null;
    poster: {
        id: number;
        firstname: string;
        lastname: string;
        email: string;
    } | null;
};

export async function fetchAdminJobs(q: string = ""): Promise<AdminJob[]> {
    let response;
    try {
        response = await fetch(API_URL + "/api/admin/jobs" + queryString({ q }), {
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

export type ReportedUser = {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    emailContact: string | null;
    emailVerified: boolean;
    address: string | null;
    description: string | null;
    resume: string | null;
    rank: number;
    suspendedAt: string | null;
    bannedAt: string | null;
    createdAt: string | null;
};

export type ReportedJob = {
    id: number;
    title: string;
    description: string | null;
    type: number;
    sector: string | null;
    remote: number;
    salaryMin: number | null;
    salaryMax: number | null;
    createdAt: string | null;
    companiesId: number;
    company: CompanySummary | null;
    address: { label: string; city: string | null; postalCode: string | null } | null;
    skills: { id: number; name: string }[];
};

export type AdminReport = {
    id: number;
    reason: string;
    description: string | null;
    status: number;
    createdAt: string | null;
    reporter: {
        id: number;
        firstname: string;
        lastname: string;
        email: string;
    } | null;
    targetUser: ReportedUser | null;
    job: ReportedJob | null;
    company: CompanySummary | null;
};

export type AdminCompany = CompanyListItem & {
    employeesCount: number;
};

export async function fetchAdminCompanies(q: string = ""): Promise<AdminCompany[]> {
    let response;
    try {
        response = await fetch(
            API_URL + "/api/admin/companies" + queryString({ q }),
            { credentials: "include" },
        );
    } catch {
        return [];
    }

    if (!response.ok) {
        return [];
    }

    return await response.json();
}

export async function moderateCompany(
    id: number,
    action: "suspend" | "reactivate" | "ban",
    reason: string,
): Promise<boolean> {
    const payload: { action: string; reason?: string } = { action };
    if (reason !== "") {
        payload.reason = reason;
    }

    let response;
    try {
        response = await fetch(
            API_URL + "/api/admin/companies/" + id + "/moderation",
            {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            },
        );
    } catch {
        return false;
    }

    return response.ok;
}

export async function fetchAdminReports(
    filters: { q?: string; status?: string } = {},
): Promise<AdminReport[]> {
    let response;
    try {
        response = await fetch(
            API_URL + "/api/admin/reports" + queryString(filters),
            { credentials: "include" },
        );
    } catch {
        return [];
    }

    if (!response.ok) {
        return [];
    }

    return await response.json();
}

export async function setReportStatus(
    id: number,
    status: number,
): Promise<boolean> {
    let response;
    try {
        response = await fetch(API_URL + "/api/admin/reports/" + id, {
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

export type RankResult = {
    ok: boolean;
    message: string | null;
};

export async function setUserRank(
    id: number,
    rank: number,
): Promise<RankResult> {
    let response;
    try {
        response = await fetch(API_URL + "/api/admin/users/" + id + "/rank", {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rank }),
        });
    } catch {
        return { ok: false, message: "Le service ne répond pas. Réessayez." };
    }

    if (response.ok) {
        return { ok: true, message: null };
    }

    return {
        ok: false,
        message: await errorMessage(response, "Le rôle n'a pas pu être modifié."),
    };
}

export const REPORT_REASONS = [
    { value: "offre-frauduleuse", label: "Offre frauduleuse" },
    { value: "contenu-discriminatoire", label: "Contenu discriminatoire" },
    { value: "contenu-inapproprie", label: "Contenu inapproprié" },
    { value: "usurpation", label: "Usurpation d'identité" },
    { value: "entreprise-non-conforme", label: "Entreprise non conforme" },
    { value: "spam", label: "Spam ou publicité" },
    { value: "autre", label: "Autre motif" },
];

export function reportReasonLabel(value: string): string {
    const found = REPORT_REASONS.find(function (reason) {
        return reason.value === value;
    });
    if (found === undefined) {
        return value;
    }
    return found.label;
}

export type ReportResult = {
    ok: boolean;
    message: string | null;
};

export async function postReport(input: {
    job_id?: number;
    user_id?: number;
    company_id?: number;
    reason: string;
    description?: string;
}): Promise<ReportResult> {
    let response;
    try {
        response = await fetch(API_URL + "/api/reports", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
        });
    } catch {
        return { ok: false, message: "Le service ne répond pas. Réessayez." };
    }

    if (response.ok) {
        return { ok: true, message: null };
    }

    return {
        ok: false,
        message: await errorMessage(
            response,
            "Le signalement n'a pas pu être enregistré.",
        ),
    };
}

export async function moderateUser(
    id: number,
    action: "suspend" | "reactivate" | "ban",
    reason: string,
): Promise<boolean> {
    const payload: { action: string; reason?: string } = { action };
    if (reason !== "") {
        payload.reason = reason;
    }

    let response;
    try {
        response = await fetch(
            API_URL + "/api/admin/users/" + id + "/moderation",
            {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            },
        );
    } catch {
        return false;
    }

    return response.ok;
}

export async function adminDeleteJob(id: number): Promise<boolean> {
    let response;
    try {
        response = await fetch(API_URL + "/api/admin/jobs/" + id, {
            method: "DELETE",
            credentials: "include",
        });
    } catch {
        return false;
    }

    return response.ok;
}

export async function fetchReceivedCount(): Promise<{ pending: number; total: number }> {
    let response;
    try {
        response = await fetch(API_URL + "/api/applications/received", {
            credentials: "include",
        });
    } catch {
        return { pending: 0, total: 0 };
    }

    if (!response.ok) {
        return { pending: 0, total: 0 };
    }

    return await response.json();
}
