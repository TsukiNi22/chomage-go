"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    fetchJobApplicants,
    setApplicationStatus,
    type Applicant,
} from "@/lib/api";
import { openResume, safeResume } from "@/lib/resume";
import ReportDialog from "@/components/report-dialog";
import { Flag } from "lucide-react";

type Props = {
    jobId: number | null;
    jobTitle: string;
    open: boolean;
    onClose: () => void;
    onChanged?: () => void;
};

const STATUS_LABELS = ["En attente", "Acceptée", "Refusée"];

function statusLabel(status: number) {
    const label = STATUS_LABELS[status];
    if (label === undefined) {
        return "En attente";
    }
    return label;
}

export default function JobApplicants(props: Props) {
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(0);
    const [reported, setReported] = useState<Applicant | null>(null);

    const jobId = props.jobId;
    const isOpen = props.open;

    useEffect(
        function () {
            if (!isOpen || jobId === null) {
                return;
            }

            let cancelled = false;
            setLoading(true);

            fetchJobApplicants(jobId).then(function (rows) {
                if (cancelled) {
                    return;
                }
                setApplicants(rows);
                setLoading(false);
            });

            return function () {
                cancelled = true;
            };
        },
        [isOpen, jobId],
    );

    function handleOpenChange(open: boolean) {
        if (!open) {
            props.onClose();
        }
    }

    async function updateStatus(id: number, status: number) {
        setBusy(id);
        const ok = await setApplicationStatus(id, status);
        if (ok && jobId !== null) {
            const rows = await fetchJobApplicants(jobId);
            setApplicants(rows);
            if (props.onChanged) {
                props.onChanged();
            }
        }
        setBusy(0);
    }

    let body = <p className="text-sm text-muted-foreground">Chargement…</p>;

    if (!loading && applicants.length === 0) {
        body = (
            <p className="text-sm text-muted-foreground">
                Aucune candidature reçue pour cette offre.
            </p>
        );
    }

    if (!loading && applicants.length > 0) {
        body = (
            <div className="flex flex-col gap-5">
                {applicants.map(function (applicant) {
                    const user = applicant.user;

                    let name = "Candidat supprimé";
                    let contactEmail = "";
                    let profile = null;
                    let addressLine = null;
                    let loginEmail = null;
                    let verifiedBadge = null;
                    let resumeLink = null;
                    let skills = null;
                    let reportButton = null;

                    if (user !== null) {
                        name = user.firstname + " " + user.lastname;

                        contactEmail = user.email;
                        if (user.emailContact) {
                            contactEmail = user.emailContact;
                        }

                        if (user.emailContact && user.emailContact !== user.email) {
                            loginEmail = (
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                        Adresse de connexion
                                    </span>
                                    <span className="text-sm">{user.email}</span>
                                </div>
                            );
                        }

                        if (user.emailVerified) {
                            verifiedBadge = (
                                <Badge
                                    variant="outline"
                                    className="border-success font-heading text-success"
                                >
                                    Adresse vérifiée
                                </Badge>
                            );
                        } else {
                            verifiedBadge = (
                                <Badge
                                    variant="outline"
                                    className="border-action-text font-heading text-action-text"
                                >
                                    Adresse non vérifiée
                                </Badge>
                            );
                        }

                        if (user.address) {
                            addressLine = (
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                        Adresse
                                    </span>
                                    <span className="text-sm">{user.address}</span>
                                </div>
                            );
                        }

                        if (user.description) {
                            profile = (
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                        Présentation
                                    </span>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {user.description}
                                    </p>
                                </div>
                            );
                        }

                        const candidate = applicant;
                        reportButton = (
                            <button
                                type="button"
                                onClick={function () {
                                    setReported(candidate);
                                }}
                                className="flex items-center gap-1.5 font-heading text-xs font-medium text-destructive underline underline-offset-4 hover:no-underline"
                            >
                                <Flag className="h-3.5 w-3.5" />
                                Signaler ce profil
                            </button>
                        );

                        const resumeHref = safeResume(user.resume);
                        const resumeValue = user.resume;
                        if (resumeHref !== null) {
                            resumeLink = (
                                <div className="flex flex-wrap items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={function () {
                                            openResume(resumeValue);
                                        }}
                                        className="font-heading text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
                                    >
                                        Consulter le CV
                                    </button>
                                    <a
                                        href={resumeHref}
                                        download={"cv-" + user.lastname + ".pdf"}
                                        className="font-heading text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
                                    >
                                        Télécharger le CV
                                    </a>
                                </div>
                            );
                        } else {
                            resumeLink = (
                                <p className="text-sm italic text-muted-foreground">
                                    Ce candidat n&apos;a pas déposé de CV.
                                </p>
                            );
                        }

                        if (user.skills && user.skills.length > 0) {
                            skills = (
                                <div className="flex flex-wrap gap-2">
                                    {user.skills.map(function (skill) {
                                        return (
                                            <Badge
                                                key={skill.id}
                                                variant="outline"
                                                className="font-heading"
                                            >
                                                {skill.name}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            );
                        }
                    }

                    let messageBlock = (
                        <p className="text-sm italic text-muted-foreground">
                            Aucun message joint.
                        </p>
                    );
                    if (applicant.description) {
                        messageBlock = (
                            <p className="whitespace-pre-wrap border-l-2 border-primary bg-wash p-3 text-sm leading-relaxed">
                                {applicant.description}
                            </p>
                        );
                    }

                    let statusClass = "font-heading";
                    if (applicant.status === 1) {
                        statusClass = "border-success font-heading text-success";
                    }
                    if (applicant.status === 2) {
                        statusClass = "border-destructive font-heading text-destructive";
                    }

                    return (
                        <article
                            key={applicant.id}
                            className="flex flex-col gap-3 border border-border bg-background p-5"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-heading text-base font-bold text-primary">
                                        {name}
                                    </h3>
                                    <a
                                        href={"mailto:" + contactEmail}
                                        className="font-heading text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
                                    >
                                        {contactEmail}
                                    </a>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    {verifiedBadge}
                                    <Badge variant="outline" className={statusClass}>
                                        {statusLabel(applicant.status)}
                                    </Badge>
                                </div>
                            </div>

                            {loginEmail}
                            {addressLine}
                            {profile}
                            {skills}
                            {messageBlock}
                            {resumeLink}

                            <div className="flex flex-wrap gap-3 border-t border-border pt-3">
                                <Button
                                    type="button"
                                    disabled={busy === applicant.id}
                                    onClick={function () {
                                        updateStatus(applicant.id, 1);
                                    }}
                                    className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                                >
                                    Accepter
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    disabled={busy === applicant.id}
                                    onClick={function () {
                                        updateStatus(applicant.id, 2);
                                    }}
                                    className="font-heading font-semibold text-destructive hover:bg-destructive/10"
                                >
                                    Refuser
                                </Button>
                                <Button
                                    asChild
                                    variant="ghost"
                                    className="font-heading font-semibold text-primary hover:bg-accent"
                                >
                                    <a href={"mailto:" + contactEmail}>Contacter</a>
                                </Button>
                                {reportButton}
                            </div>
                        </article>
                    );
                })}
            </div>
        );
    }

    let reportSubject = "";
    let reportUserId: number | null = null;
    if (reported !== null && reported.user !== null) {
        reportSubject = reported.user.firstname + " " + reported.user.lastname;
        reportUserId = reported.user.id;
    }

    return (
        <>
        <Dialog open={props.open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="font-heading text-primary">
                        Candidatures reçues
                    </DialogTitle>
                    <DialogDescription>{props.jobTitle}</DialogDescription>
                </DialogHeader>

                {body}
            </DialogContent>
        </Dialog>

        <ReportDialog
            open={reported !== null}
            onClose={function () {
                setReported(null);
            }}
            userId={reportUserId}
            subject={reportSubject}
        />
        </>
    );
}
