"use client";

import { useState } from "react";
import JobPostingsTable from "@/components/job-posting-table";
import CreateJobPostingDialog from "@/components/job-posting-add";
import { employerJobPostings, type EmployerJobPosting } from "@/lib/employer-jobs";

export default function EmployerJobsPage() {
    const [postings, setPostings] = useState<EmployerJobPosting[]>(employerJobPostings);

    function handleCreate(newPosting: EmployerJobPosting) {
        setPostings(function (previous) {
            return [...previous, newPosting];
        });
    }
    return (
        <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="font-heading text-2xl font-bold text-primary">
                    Mes offres publiées
                </h1>
                <p className="text-sm text-muted-foreground">{postings.length} offre(s)</p>
            </div>

            <JobPostingsTable postings={postings} />
            <div className="mt-6 flex justify-end">
                <CreateJobPostingDialog onCreate={handleCreate} />
            </div>
        </div>
    );
}
