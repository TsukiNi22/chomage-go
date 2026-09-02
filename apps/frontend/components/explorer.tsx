"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import JobDetails from "@/components/job-details";
import JobList from "@/components/job-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { jobs, locatedJobs } from "@/lib/jobs";
import type { Job } from "@/lib/jobs";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
const CONTRACTS = ["CDI", "CDD", "Alternance", "Stage"];
const FRANCE_LAT = 46.7;
const FRANCE_LON = 2.4;
const FRANCE_ZOOM = 6;

export default function Explorer() {
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [search, setSearch] = useState("");
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [contract, setContract] = useState<string | null>(null);
    const [location, setLocation] = useState("");
    const [byPostalCode, setByPostalCode] = useState(false);
    const results = jobs.filter(function (job) {
        const text = search.toLowerCase();

        if (location !== "") {
            const place = location.toLowerCase();
            let field = job.city.toLowerCase();
            if (byPostalCode) {
                field = job.postalCode;
            }
            if (!field.includes(place)) {
                return false;
            }
        }

        if (contract !== null && job.contract !== contract) {
            return false;
        }
        if (text === "") {
            return true;
        }
        const target =
            job.title +
            " " +
            job.company +
            " " +
            job.sector +
            " " +
            job.contract;

        return target.toLowerCase().includes(text);
    });
    const visibleJobs = results.slice(0, DISPLAY_LIMIT);
    const mappableJobs = locatedJobs(visibleJobs);

    let targetLat = FRANCE_LAT;
    let targetLon = FRANCE_LON;
    let targetZoom = FRANCE_ZOOM;

    if (selectedJob !== null) {
        targetLat = selectedJob.lat;
        targetLon = selectedJob.lon;
        targetZoom = 14;
    } else if ((search !== "" || location !== "") && mappableJobs.length > 0) {
        targetLat = mappableJobs[0].lat;
        targetLon = mappableJobs[0].lon;
        targetZoom = 11;
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

    function handleLocation(event: React.ChangeEvent<HTMLInputElement>) {
        setLocation(event.target.value);
    }

    function toggleContract(value: string) {
        if (contract === value) {
            setContract(null);
        } else {
            setContract(value);
        }
    }

    function toggleLocationMode(checked: boolean) {
        setByPostalCode(checked);
        setLocation("");
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

    let locationPlaceholder = "Commune : Rennes, Lyon…";
    if (byPostalCode) {
        locationPlaceholder = "Code postal : 35000…";
    }

    let searchBar = null;
    if (!isFullscreen) {
        searchBar = (
            <div className="mx-auto mb-4 max-w-6xl">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                        value={search}
                        onChange={handleSearch}
                        placeholder="Métier, entreprise, secteur…"
                        className="sm:flex-1"
                    />
                    <Input
                        value={location}
                        onChange={handleLocation}
                        placeholder={locationPlaceholder}
                        className="sm:w-72"
                    />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                    {CONTRACTS.map(function (value) {
                        let style = "border-border bg-background hover:border-primary";
                        if (contract === value) {
                            style = "border-primary bg-accent text-accent-foreground";
                        }

                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={function () {
                                    toggleContract(value);
                                }}
                                aria-pressed={contract === value}
                                className={cn(
                                    "border px-3.5 py-1.5 font-heading text-xs font-medium transition-colors",
                                    style,
                                )}
                            >
                                {value}
                            </button>
                        );
                    })}

                    <span className="mx-1 h-5 w-px bg-border" />

                    <Switch
                        id="location-mode"
                        checked={byPostalCode}
                        onCheckedChange={toggleLocationMode}
                    />
                    <Label
                        htmlFor="location-mode"
                        className="font-heading text-xs font-medium"
                    >
                        Rechercher par code postal
                    </Label>
                </div>
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
                        jobs={mappableJobs}
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
