"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Job } from "@/lib/jobs";

export type JobApplication = {
    id: number;
    jobId: number;
    title: string;
    company: string;
    city: string;
    contractType: string;
    appliedAt: string; // ISO date
};

type ApplicationsContextValue = {
    applications: JobApplication[];
    addApplication: (job: Job) => void;
    hasApplied: (jobId: number) => boolean;
};

const ApplicationsContext = createContext<ApplicationsContextValue | undefined>(
    undefined,
);

export function ApplicationsProvider(props: { children: ReactNode }) {
    const [applications, setApplications] = useState<JobApplication[]>([]);

    function hasApplied(jobId: number) {
        return applications.some(function (application) {
            return application.jobId === jobId;
        });
    }

    function addApplication(job: Job) {
        if (hasApplied(job.id)) {
            return;
        }

        const newApplication: JobApplication = {
            id: Date.now(),
            jobId: job.id,
            title: job.title,
            company: job.company,
            city: job.city,
            contractType: job.contract,
            appliedAt: new Date().toISOString(),
        };

        setApplications(function (previous) {
            return [...previous, newApplication];
        });
    }

    return (
        <ApplicationsContext.Provider
            value={{ applications, addApplication, hasApplied }}
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
