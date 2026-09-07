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
import { safeResume } from "@/lib/resume";

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
                    let resumeLink = null;
                    let skills = null;

                    if (user !== null) {
                        name = user.firstname + " " + user.lastname;

                        contactEmail = user.email;
                        if (user.emailContact) {
                            contactEmail = user.emailContact;
                        }

                        if (user.description) {
                            profile = (
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {user.description}
                                </p>
                            );
                        }

                        const resumeHref = safeResume(user.resume);
                        if (resumeHref !== null) {
                            resumeLink = (
                                <a
                                    href={resumeHref}
                                    download={"cv-" + user.lastname + ".pdf"}
                                    className="font-heading text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
                                >
                                    Télécharger le CV
                                </a>
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
                                <Badge variant="outline" className={statusClass}>
                                    {statusLabel(applicant.status)}
                                </Badge>
                            </div>

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
                            </div>
                        </article>
                    );
                })}
            </div>
        );
    }

    return (
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
    );
}
