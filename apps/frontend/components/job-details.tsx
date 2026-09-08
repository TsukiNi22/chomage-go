"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import ReportDialog from "@/components/report-dialog";
import { Flag } from "lucide-react";
import { formatSalary } from "@/components/job-list";
import { distanceInKm, formatDistance } from "@/lib/distance";
import { authClient } from "@/lib/auth-client";
import { UserRank } from "@/lib/user-rank";
import type { Job } from "@/lib/jobs";
import { useApplications } from "@/lib/applications-context";

type Position = { lat: number; lon: number };

type Props = {
    job: Job | null;
    position?: Position | null;
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
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [applyError, setApplyError] = useState<string | null>(null);
    const [reportOpen, setReportOpen] = useState(false);
    const { data: session } = authClient.useSession();
    const { addApplication } = useApplications();
    const job = props.job;
    let jobId = 0;
    if (job !== null) {
        jobId = job.id;
    }

    useEffect(
        function () {
            setApplied(false);
            setMessage("");
            setApplyError(null);
            setReportOpen(false);
        },
        [jobId],
    );

    function handleOpenChange(open: boolean) {
        if (!open) {
            props.onClose();
        }
    }

    async function handleApply() {
        if (job === null) {
            return;
        }

        setSending(true);
        setApplyError(null);
        const problem = await addApplication(job, message.trim());
        setSending(false);

        if (problem !== null) {
            setApplyError(problem);
            return;
        }

        setApplied(true);
    }

    if (job === null) {
        return null;
    }

    let distanceField = null;
    if (props.position && job.needsLocationCheck === false) {
        const km = distanceInKm(
            props.position.lat,
            props.position.lon,
            job.lat,
            job.lon,
        );
        distanceField = <Field label="Distance" value={formatDistance(km)} />;
    }

    const publishedAt = new Date(job.publishedAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    const isJobSeeker = session?.user?.rank === UserRank.JOB_SEEKER;

    let restrictionMessage: string | null = null;
    if (!session) {
        restrictionMessage = "Connectez-vous pour postuler.";
    } else if (!isJobSeeker) {
        restrictionMessage = "Les employeurs ne peuvent pas postuler à une offre.";
    }

    const canApply = isJobSeeker && !applied;

    let footerText = "Votre profil sera transmis à l'employeur.";
    let footerClass = "text-xs text-muted-foreground";
    let applyLabel = "Postuler";
    if (sending) {
        applyLabel = "Envoi…";
    }

    let messageBlock = null;
    if (canApply) {
        messageBlock = (
            <div className="flex flex-col gap-1.5">
                <label
                    htmlFor="candidature-message"
                    className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                >
                    Votre message (facultatif)
                </label>
                <textarea
                    id="candidature-message"
                    value={message}
                    onChange={function (event) {
                        setMessage(event.target.value);
                    }}
                    maxLength={1000}
                    placeholder="Expliquez en quelques lignes pourquoi cette offre vous intéresse."
                    className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring"
                />
                <span className="text-xs text-muted-foreground">
                    {message.length} / 1000 caractères
                </span>
            </div>
        );
    }

    let footerMessage = (
        <p className="text-xs text-muted-foreground">
            Votre profil sera transmis à l&apos;employeur.
        </p>
    );
    if (restrictionMessage !== null) {
        footerMessage = (
            <p
                role="alert"
                className="font-heading text-sm font-semibold text-destructive"
            >
                {restrictionMessage}
            </p>
        );
    } else if (applyError !== null) {
        footerMessage = (
            <p
                role="alert"
                className="font-heading text-sm font-semibold text-destructive"
            >
                {applyError}
            </p>
        );
    } else if (applied) {
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


    let companyLine: React.ReactNode = job.company;
    if (job.companyId !== null) {
        companyLine = (
            <Link
                href={"/entreprises/" + job.companyId}
                className="font-semibold text-primary underline underline-offset-4 hover:no-underline"
            >
                {job.company}
            </Link>
        );
    }

    let reportButton = null;
    if (session) {
        reportButton = (
            <button
                type="button"
                onClick={function () {
                    setReportOpen(true);
                }}
                className="flex items-center gap-1.5 self-start font-heading text-xs font-medium text-destructive underline underline-offset-4 hover:no-underline"
            >
                <Flag className="h-3.5 w-3.5" />
                Signaler cette offre
            </button>
        );
    }

    return (
        <>
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
                        {companyLine}
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
                        {distanceField}
                    </div>

                    {messageBlock}

                    {reportButton}
                </div>

                <DialogFooter className="border-t border-border bg-muted p-6 sm:justify-between">
                    {footerMessage}

                    <Button
                        type="button"
                        onClick={handleApply}
                        disabled={!canApply || sending}
                        className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-action"
                    >
                        {applyLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <ReportDialog
            open={reportOpen}
            onClose={function () {
                setReportOpen(false);
            }}
            jobId={job.id}
            subject={job.title + " — " + job.company}
        />
        </>
    );
}
