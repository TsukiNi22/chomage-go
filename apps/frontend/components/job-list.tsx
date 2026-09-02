"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Job } from "@/lib/jobs";

export function formatSalary(job: Job): string {
    const low = job.salaryMin.toLocaleString("fr-FR");
    if (job.salaryMax === null) {
        return "À partir de " + low + " € brut par an";
    }
    const high = job.salaryMax.toLocaleString("fr-FR");
    return low + " – " + high + " € brut par an";
}

type JobRowProps = {
    job: Job;
    selected: boolean;
    onSelect: (job: Job) => void;
};

function JobRow(props: JobRowProps) {
    const job = props.job;

    function handleClick() {
        props.onSelect(job);
    }

    let locationWarning = null;
    if (job.needsLocationCheck) {
        locationWarning = (
            <Badge
                variant="outline"
                className="mt-2 border-destructive font-heading text-destructive"
            >
                Localisation à vérifier
            </Badge>
        );
    }

    let rowBackground = "bg-background hover:bg-muted";
    if (props.selected) {
        rowBackground = "bg-accent";
    }

    return (
        <li>
            <button
                type="button"
                onClick={handleClick}
                aria-current={props.selected}
                className={cn(
                    "w-full border-b border-border px-6 py-5 text-left transition-colors",
                    rowBackground,
                )}
            >
                <div className="flex items-start justify-between gap-4">
                    <h3 className="font-heading text-base font-semibold text-primary">
                        {job.title}
                    </h3>
                    <Badge variant="outline" className="shrink-0 font-heading">
                        {job.contract}
                    </Badge>
                </div>

                <p className="mt-1 text-sm">{job.company}</p>

                <p className="mt-2 text-sm text-muted-foreground">
                    {job.city} ({job.postalCode})
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                    {formatSalary(job)}
                </p>

                {locationWarning}
            </button>
        </li>
    );
}

type Props = {
    jobs: Job[];
    total: number;
    selectedJob: Job | null;
    onSelect: (job: Job) => void;
};

export default function JobList(props: Props) {
    if (props.jobs.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-8 py-16 text-center">
                <p className="font-heading text-base font-semibold text-primary">
                    Aucune offre dans ce secteur
                </p>
                <p className="max-w-xs text-sm text-muted-foreground">
                    Élargissez le périmètre de recherche ou essayez une autre commune.
                </p>
            </div>
        );
    }

    let displayedCount = "";
    if (props.jobs.length < props.total) {
        displayedCount = " · " + props.jobs.length + " affichées";
    }

    return (
        <div>
            <p className="border-b border-border bg-muted px-6 py-3 font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {props.total} offres publiées
                {displayedCount}
            </p>

            <ul>
                {props.jobs.map(function (job) {
                    let selected = false;
                    if (props.selectedJob !== null && props.selectedJob.id === job.id) {
                        selected = true;
                    }

                    return (
                        <JobRow
                            key={job.id}
                            job={job}
                            selected={selected}
                            onSelect={props.onSelect}
                        />
                    );
                })}
            </ul>
        </div>
    );
}
