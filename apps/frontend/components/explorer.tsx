"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import JobDetails from "@/components/job-details";
import JobList from "@/components/job-list";
import { Skeleton } from "@/components/ui/skeleton";
import { jobs } from "@/lib/jobs";
import type { Job } from "@/lib/jobs";
import { Input } from "@/components/ui/input"

const Map = dynamic(
    function () {
        return import("@/components/map");
    },
    {
        ssr: false,
        loading: function () {
            return <Skeleton className="h-full w-full rounded-none" />;
        },
    },
);

const DISPLAY_LIMIT = 60;

export default function Explorer() {
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [search, setSearch] = useState("");
    const [detailsOpen, setDetailsOpen] = useState(false);

    const visibleJobs = jobs.slice(0, DISPLAY_LIMIT);

    let targetLat = null;
    let targetLon = null;
    let targetZoom = 6;

    if (selectedJob !== null) {
        targetLat = selectedJob.lat;
        targetLon = selectedJob.lon;
        targetZoom = 14;
    }

    function selectJob(job: Job) {
        setSelectedJob(job);
        setDetailsOpen(true);
    }

    function closeDetails() {
        setDetailsOpen(false);
    }

    function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
        setSearch(event.target.value);
    }

    return (
        <section className="bg-wash px-6 pb-14 pt-10">
            <div className="mx-auto mb-4 max-w-6xl">
                <Input value={search} onChange={handleSearch}/>
            </div>
            <div className="mx-auto flex h-[34rem] max-w-6xl flex-col overflow-hidden border border-border bg-background lg:flex-row">
                <div className="order-2 h-full w-full overflow-y-auto border-border lg:order-1 lg:w-[26rem] lg:border-r">
                    <JobList
                        jobs={visibleJobs}
                        total={jobs.length}
                        selectedJob={selectedJob}
                        onSelect={selectJob}
                    />
                </div>

                <div className="order-1 h-64 w-full lg:order-2 lg:h-full lg:flex-1 isolate">
                    <Map
                        jobs={visibleJobs}
                        selectedJob={selectedJob}
                        onSelect={selectJob}
                        targetLat={targetLat}
                        targetLon={targetLon}
                        targetZoom={targetZoom}
                    />
                </div>
            </div>

            <JobDetails
                job={selectedJob}
                open={detailsOpen}
                onClose={closeDetails}
            />
        </section>
    );
}
