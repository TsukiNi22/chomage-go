"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import type { Job } from "@/lib/jobs";
import { authClient } from "@/lib/auth-client";
import {
    deleteApplication,
    fetchApplications,
    postApplication,
    type ApiApplication,
} from "@/lib/api";

const CONTRACTS = ["CDI", "CDD", "Alternance", "Stage", "Freelance"];

export const APPLICATION_STATUS_LABELS = ["En attente", "Acceptée", "Refusée"];

export function applicationStatusLabel(status: number): string {
    const label = APPLICATION_STATUS_LABELS[status];
    if (label === undefined) {
        return "En attente";
    }
    return label;
}

export type JobApplication = {
    id: number;
    jobId: number;
    title: string;
    company: string;
    companyId: number | null;
    city: string;
    contractType: string;
    status: number;
    appliedAt: string;
    message: string;
};

type ApplicationsContextValue = {
    applications: JobApplication[];
    loading: boolean;
    addApplication: (job: Job, message: string) => Promise<string | null>;
    removeApplication: (id: number) => Promise<boolean>;
    hasApplied: (jobId: number) => boolean;
};

const ApplicationsContext = createContext<ApplicationsContextValue | undefined>(
    undefined,
);

function toApplication(row: ApiApplication): JobApplication {
    const job = row.job;

    let title = "Offre retirée";
    let company = "";
    let companyId: number | null = null;
    let city = "";
    let contractType = "";

    if (job !== null) {
        title = job.title;
        contractType = CONTRACTS[job.type] || "";
        if (job.company !== null) {
            company = job.company.name;
            companyId = job.company.id;
        }
        if (job.address !== null && job.address.city !== null) {
            city = job.address.city;
        }
    }

    let appliedAt = "";
    if (row.createdAt !== null) {
        appliedAt = row.createdAt;
    }

    let message = "";
    if (row.description !== null) {
        message = row.description;
    }

    return {
        id: row.id,
        jobId: row.jobId,
        title: title,
        company: company,
        companyId: companyId,
        city: city,
        contractType: contractType,
        status: row.status,
        appliedAt: appliedAt,
        message: message,
    };
}

export function ApplicationsProvider(props: { children: ReactNode }) {
    const { data: session } = authClient.useSession();
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);

    const reload = useCallback(async function () {
        const rows = await fetchApplications();
        setApplications(rows.map(toApplication));
        setLoading(false);
    }, []);

    useEffect(
        function () {
            if (!session) {
                setApplications([]);
                setLoading(false);
                return;
            }
            reload();
        },
        [session, reload],
    );

    function hasApplied(jobId: number) {
        return applications.some(function (application) {
            return application.jobId === jobId;
        });
    }

    async function addApplication(job: Job, message: string) {
        if (hasApplied(job.id)) {
            return null;
        }

        const result = await postApplication(job.id, message);
        if (result.ok) {
            await reload();
            return null;
        }

        return result.message;
    }

    async function removeApplication(id: number) {
        const ok = await deleteApplication(id);
        if (ok) {
            await reload();
        }
        return ok;
    }

    return (
        <ApplicationsContext.Provider
            value={{ applications, loading, addApplication, removeApplication, hasApplied }}
        >
            {props.children}
        </ApplicationsContext.Provider>
    );
}

export function useApplications() {
    const context = useContext(ApplicationsContext);
    if (context === undefined) {
        throw new Error(
            "useApplications doit être utilisé à l'intérieur d'un ApplicationsProvider",
        );
    }
    return context;
}
