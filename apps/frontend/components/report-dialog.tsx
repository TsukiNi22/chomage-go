"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { postReport, REPORT_REASONS } from "@/lib/api";

type Props = {
    open: boolean;
    onClose: () => void;
    /** Offre signalée. Exclusif de userId. */
    jobId?: number | null;
    /** Profil signalé. Exclusif de jobId. */
    userId?: number | null;
    /** Entreprise signalée. Exclusif des deux autres. */
    companyId?: number | null;
    subject: string;
};

export default function ReportDialog(props: Props) {
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    const isOpen = props.open;

    useEffect(
        function () {
            if (isOpen) {
                setReason("");
                setDescription("");
                setError(null);
                setSent(false);
            }
        },
        [isOpen],
    );

    function handleOpenChange(open: boolean) {
        if (!open) {
            props.onClose();
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        if (reason === "") {
            setError("Choisissez un motif de signalement.");
            return;
        }

        const payload: {
            job_id?: number;
            user_id?: number;
            company_id?: number;
            reason: string;
            description?: string;
        } = { reason: reason };

        if (props.jobId !== undefined && props.jobId !== null) {
            payload.job_id = props.jobId;
        }
        if (props.userId !== undefined && props.userId !== null) {
            payload.user_id = props.userId;
        }
        if (props.companyId !== undefined && props.companyId !== null) {
            payload.company_id = props.companyId;
        }
        if (description.trim() !== "") {
            payload.description = description.trim();
        }

        setSending(true);
        const result = await postReport(payload);
        setSending(false);

        if (!result.ok) {
            setError(result.message);
            return;
        }

        setSent(true);
    }

    let body = (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="report-reason">Motif</Label>
                <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger id="report-reason" className="w-full">
                        <SelectValue placeholder="Sélectionner un motif" />
                    </SelectTrigger>
                    <SelectContent>
                        {REPORT_REASONS.map(function (item) {
                            return (
                                <SelectItem key={item.value} value={item.value}>
                                    {item.label}
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="report-description">Précisions (facultatif)</Label>
                <Textarea
                    id="report-description"
                    value={description}
                    maxLength={1000}
                    rows={4}
                    onChange={function (event) {
                        setDescription(event.target.value);
                    }}
                    placeholder="Décrivez ce qui pose problème."
                />
            </div>

            {error !== null && (
                <p
                    role="alert"
                    aria-live="assertive"
                    className="border border-destructive bg-destructive/5 px-3 py-2 text-sm text-destructive"
                >
                    {error}
                </p>
            )}

            <DialogFooter>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={props.onClose}
                    className="font-heading font-semibold text-primary hover:bg-accent"
                >
                    Annuler
                </Button>
                <Button
                    type="submit"
                    disabled={sending}
                    className="bg-destructive font-heading font-semibold text-destructive-foreground hover:bg-destructive/90"
                >
                    {sending ? "Envoi…" : "Envoyer le signalement"}
                </Button>
            </DialogFooter>
        </form>
    );

    if (sent) {
        body = (
            <div className="flex flex-col gap-4">
                <p aria-live="polite" className="text-sm text-muted-foreground">
                    Votre signalement a été transmis à l&apos;équipe de modération. Il
                    sera examiné dans les meilleurs délais.
                </p>
                <DialogFooter>
                    <Button
                        type="button"
                        onClick={props.onClose}
                        className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                    >
                        Fermer
                    </Button>
                </DialogFooter>
            </div>
        );
    }

    return (
        <Dialog open={props.open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-heading text-primary">
                        Signaler un contenu
                    </DialogTitle>
                    <DialogDescription>{props.subject}</DialogDescription>
                </DialogHeader>

                {body}
            </DialogContent>
        </Dialog>
    );
}
