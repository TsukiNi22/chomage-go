"use client";

import { useState } from "react";
import ApplicationsTable from "@/components/applications-table";
import ApplicationDetails from "@/components/application-details";
import {
    useApplications,
    type JobApplication,
} from "@/lib/applications-context";

export default function MyApplicationsPage() {
    const { applications } = useApplications();
    const [selected, setSelected] = useState<JobApplication | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    function openDetails(application: JobApplication) {
        setSelected(application);
        setDetailsOpen(true);
    }

    function closeDetails() {
        setDetailsOpen(false);
    }

    return (
        <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="font-heading text-2xl font-bold text-primary">
                    Mes candidatures
                </h1>
                <p className="text-sm text-muted-foreground">
                    {applications.length} candidature(s)
                </p>
            </div>

            <ApplicationsTable
                applications={applications}
                onSelect={openDetails}
            />

            <ApplicationDetails
                application={selected}
                open={detailsOpen}
                onClose={closeDetails}
            />
        </div>
    );
}
