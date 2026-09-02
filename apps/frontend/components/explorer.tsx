"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import JobDetails from "@/components/job-details";
import JobList from "@/components/job-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { jobs } from "@/lib/jobs";
import type { Job } from "@/lib/jobs";
import { Input } from "@/components/ui/input";

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
    const [isFullscreen, setIsFullscreen] = useState(false);
    const results = jobs.filter(function (job) {
        const text = search.toLowerCase();

        if (text === "") {
            return true;
        }
        const target = job.title + " " + job.company + " " + job.city + " " + job.postalCode + " " + job.sector + " " + job.contract;
        return target.toLowerCase().includes(text);
    });
    const visibleJobs = results.slice(0, DISPLAY_LIMIT);

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

    function toggleFullscreen() {
        setIsFullscreen(function (previous) {
            return !previous;
        });
    }

    useEffect(
        function () {
            function handleKeyDown(event: KeyboardEvent) {
                if (event.key === "Escape") {
                    setIsFullscreen(false);
                }
            }
            window.addEventListener("keydown", handleKeyDown);
            return function () {
                window.removeEventListener("keydown", handleKeyDown);
            };
        },
        [],
    );

    let fullscreenLabel = "Passer en plein écran";
    let fullscreenIcon = <Maximize2 className="h-4 w-4" />;
    if (isFullscreen) {
        fullscreenLabel = "Quitter le plein écran";
        fullscreenIcon = <Minimize2 className="h-4 w-4" />;
    }

    let searchBar = null;
    if (!isFullscreen) {
        searchBar = (
            <div className="mx-auto mb-4 max-w-6xl">
                <Input
                    value={search}
                    onChange={handleSearch}
                    placeholder="Métier, entreprise, ville…"
                />
            </div>
        );
    }

    return (
        <section
            className={cn(
                "bg-wash px-6 pb-14 pt-10",
                isFullscreen && "fixed inset-0 z-50 bg-background p-0",
            )}
        >
            {searchBar}

            <div
                className={cn(
                    "relative mx-auto flex h-[34rem] max-w-6xl flex-col overflow-hidden border border-border bg-background lg:flex-row",
                    isFullscreen && "h-full max-w-none",
                )}
            >
                <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="absolute right-3 top-3 z-10"
                    aria-label={fullscreenLabel}
                >
                    {fullscreenIcon}
                </Button>

                <div className="order-2 h-full w-full overflow-y-auto border-border lg:order-1 lg:w-[26rem] lg:border-r">
                    <JobList
                        jobs={visibleJobs}
                        total={results.length}
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
