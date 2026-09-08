"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import {
    applicationStatusLabel,
    type JobApplication,
} from "@/lib/applications-context";

type Props = {
    application: JobApplication | null;
    open: boolean;
    onClose: () => void;
    onDelete?: (application: JobApplication) => void;
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

export default function ApplicationDetails(props: Props) {
    const application = props.application;

    if (application === null) {
        return null;
    }

    function handleOpenChange(open: boolean) {
        if (!open) {
            props.onClose();
        }
    }

    let appliedAt = "Date inconnue";
    if (application.appliedAt !== "") {
        appliedAt = new Date(application.appliedAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    }

    let messageBlock = (
        <p className="text-sm italic text-muted-foreground">
            Vous n&apos;avez pas joint de message à cette candidature.
        </p>
    );
    if (application.message !== "") {
        messageBlock = (
            <p className="whitespace-pre-wrap border-l-2 border-primary bg-wash p-4 text-sm leading-relaxed">
                {application.message}
            </p>
        );
    }

    let statusClass = "font-heading";
    if (application.status === 1) {
        statusClass = "border-success font-heading text-success";
    }
    if (application.status === 2) {
        statusClass = "border-destructive font-heading text-destructive";
    }

    let unavailableBlock = null;
    if (application.unavailableReason !== null) {
        unavailableBlock = (
            <div className="border-l-2 border-destructive bg-destructive/5 p-4">
                <p className="font-heading text-sm font-semibold text-destructive">
                    {application.unavailableReason}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Cette offre n&apos;est plus diffusée sur la plateforme. Votre
                    candidature reste enregistrée, mais l&apos;employeur peut ne plus y
                    donner suite.
                </p>
            </div>
        );
    }

    const current = application;
    let deleteButton = null;
    if (props.onDelete) {
        deleteButton = (
            <Button
                type="button"
                variant="ghost"
                onClick={function () {
                    if (props.onDelete) {
                        props.onDelete(current);
                    }
                }}
                className="self-start font-heading font-semibold text-destructive hover:bg-destructive/10"
            >
                <Trash2 className="mr-2 h-4 w-4" />
                Retirer ma candidature
            </Button>
        );
    }

    return (
        <Dialog open={props.open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg gap-0 p-0">
                <DialogHeader className="border-b border-border p-6 pr-14 text-left">
                    <div className="flex items-start justify-between gap-4">
                        <DialogTitle className="font-heading text-xl font-bold text-primary">
                            {application.title}
                        </DialogTitle>
                        <Badge variant="outline" className="shrink-0 font-heading">
                            {application.contractType}
                        </Badge>
                    </div>
                    <DialogDescription className="text-base text-foreground">
                        {application.company}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-5 p-6">
                    {unavailableBlock}

                    <div className="grid grid-cols-2 gap-5">
                        <Field label="Ville" value={application.city} />
                        <Field label="Envoyée le" value={appliedAt} />

                        <div className="flex flex-col gap-1">
                            <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                Statut
                            </span>
                            <Badge variant="outline" className={"self-start " + statusClass}>
                                {applicationStatusLabel(application.status)}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-2">
                        <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                            Message envoyé
                        </span>
                        {messageBlock}
                    </div>

                    {deleteButton}
                </div>
            </DialogContent>
        </Dialog>
    );
}
