"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatSalary } from "@/components/job-list";
import type { Job } from "@/lib/jobs";

type Props = {
    job: Job | null;
    open: boolean;
    onClose: () => void;
};

function Field(props: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {props.label}
            </span>
            <span className="text-sm">{props.value}</span>
        </div>
    );
}

export default function JobDetails(props: Props) {
    const [applied, setApplied] = useState(false);
    const job = props.job;
    let jobId = 0;
    if (job !== null) {
        jobId = job.id;
    }

    useEffect(
        function () {
            setApplied(false);
        },
        [jobId],
    );

    function handleOpenChange(open: boolean) {
        if (!open) {
            props.onClose();
        }
    }

    function handleApply() {
        setApplied(true);
    }

    if (job === null) {
        return null;
    }

    const publishedAt = new Date(job.publishedAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    let footerMessage = (
        <p className="text-xs text-muted-foreground">
            Votre profil sera transmis à l&apos;employeur.
        </p>
    );
    let applyLabel = "Postuler";

    if (applied) {
        footerMessage = (
            <p
                aria-live="polite"
                className="font-heading text-sm font-semibold text-success"
            >
                Candidature envoyée à {job.company}.
            </p>
        );
        applyLabel = "Candidature envoyée";
    }

    return (
        <Dialog open={props.open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg gap-0 p-0">
                <DialogHeader className="border-b border-border p-6 pr-14 text-left">
                    <div className="flex items-start justify-between gap-4">
                        <DialogTitle className="font-heading text-xl font-bold text-primary">
                            {job.title}
                        </DialogTitle>
                        <Badge variant="outline" className="shrink-0 font-heading">
                            {job.contract}
                        </Badge>
                    </div>
                    <DialogDescription className="text-base text-foreground">
                        {job.company}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-5 p-6">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        {job.description}
                    </p>

                    <Separator />

                    <div className="grid grid-cols-2 gap-5">
                        <Field
                            label="Lieu"
                            value={job.address + ", " + job.postalCode + " " + job.city}
                        />
                        <Field label="Rémunération" value={formatSalary(job)} />
                        <Field label="Secteur" value={job.sector} />
                        <Field label="Télétravail" value={job.remote} />
                        <Field label="Publiée le" value={publishedAt} />
                    </div>
                </div>

                <DialogFooter className="border-t border-border bg-muted p-6 sm:justify-between">
                    {footerMessage}

                    <Button
                        type="button"
                        onClick={handleApply}
                        disabled={applied}
                        className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                    >
                        {applyLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
