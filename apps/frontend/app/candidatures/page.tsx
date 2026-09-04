"use client";

import ApplicationsTable from "@/components/applications-table";
import { useApplications } from "@/lib/applications-context";

export default function MyApplicationsPage() {
    const { applications } = useApplications();

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

            <ApplicationsTable applications={applications} />
        </div>
    );
}
