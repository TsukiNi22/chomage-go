"use client";

import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { employeeRangeLabel, reportReasonLabel, type AdminReport } from "@/lib/api";
import { openResume, safeResume } from "@/lib/resume";
import { formatSiret } from "@/lib/siret";

const CONTRACTS = ["CDI", "CDD", "Alternance", "Stage", "Freelance"];
const REMOTES = ["Aucun", "Partiel", "Total"];
const RANKS = ["Administrateur", "Employeur", "Candidat"];

type Props = {
    report: AdminReport | null;
    onClose: () => void;
};

function Field(props: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {props.label}
            </span>
            <span className="text-sm">{props.children}</span>
        </div>
    );
}

function fromList(list: string[], index: number, fallback: string): string {
    const value = list[index];
    if (value === undefined) {
        return fallback;
    }
    return value;
}

function formatDate(value: string | null): string {
    if (value === null) {
        return "—";
    }
    return new Date(value).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

/** Détail de l'élément signalé, pour que la modération décide sur pièces. */
export default function ReportDetailDialog(props: Props) {
    const report = props.report;

    if (report === null) {
        return null;
    }

    function handleOpenChange(open: boolean) {
        if (!open) {
            props.onClose();
        }
    }

    let body = (
        <p className="text-sm italic text-muted-foreground">
            L&apos;élément signalé a été supprimé depuis le signalement.
        </p>
    );

    if (report.job !== null) {
        const job = report.job;

        let place = "Adresse non renseignée";
        if (job.address !== null) {
            place = job.address.label;
        }

        let salary = "Non renseignée";
        if (job.salaryMin !== null) {
            salary = job.salaryMin.toLocaleString("fr-FR") + " €";
            if (job.salaryMax !== null) {
                salary =
                    salary + " – " + job.salaryMax.toLocaleString("fr-FR") + " €";
            }
        }

        body = (
            <div className="flex flex-col gap-5">
                <div>
                    <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Offre signalée
                    </p>
                    <h3 className="font-heading text-lg font-bold text-primary">
                        {job.title}
                    </h3>
                </div>

                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {job.description || "Aucune description."}
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Entreprise">{job.company?.name || "—"}</Field>
                    <Field label="Secteur">{job.sector || "—"}</Field>
                    <Field label="Contrat">
                        {fromList(CONTRACTS, job.type, "CDI")}
                    </Field>
                    <Field label="Télétravail">
                        {fromList(REMOTES, job.remote, "Aucun")}
                    </Field>
                    <Field label="Lieu">{place}</Field>
                    <Field label="Rémunération">{salary}</Field>
                    <Field label="Publiée le">{formatDate(job.createdAt)}</Field>
                </div>

                {job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {job.skills.map(function (skill) {
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
                )}
            </div>
        );
    } else if (report.targetUser !== null) {
        const user = report.targetUser;
        const resumeHref = safeResume(user.resume);

        let verified = (
            <Badge
                variant="outline"
                className="border-action-text font-heading text-action-text"
            >
                Adresse non vérifiée
            </Badge>
        );
        if (user.emailVerified) {
            verified = (
                <Badge
                    variant="outline"
                    className="border-success font-heading text-success"
                >
                    Adresse vérifiée
                </Badge>
            );
        }

        let resumeBlock = (
            <p className="text-sm italic text-muted-foreground">
                Aucun CV déposé.
            </p>
        );
        if (resumeHref !== null) {
            resumeBlock = (
                <div className="flex flex-wrap items-center gap-4">
                    <button
                        type="button"
                        onClick={function () {
                            openResume(user.resume);
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
        }

        body = (
            <div className="flex flex-col gap-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                            Profil signalé
                        </p>
                        <h3 className="font-heading text-lg font-bold text-primary">
                            {user.firstname} {user.lastname}
                        </h3>
                    </div>
                    {verified}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Adresse de connexion">{user.email}</Field>
                    <Field label="Adresse de contact">
                        {user.emailContact || "—"}
                    </Field>
                    <Field label="Rôle">
                        {fromList(RANKS, user.rank, "Inconnu")}
                    </Field>
                    <Field label="Inscrit le">{formatDate(user.createdAt)}</Field>
                    <Field label="Adresse postale">{user.address || "—"}</Field>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Présentation
                    </span>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                        {user.description || "Aucune présentation."}
                    </p>
                </div>

                {resumeBlock}
            </div>
        );
    } else if (report.company !== null) {
        const company = report.company;

        body = (
            <div className="flex flex-col gap-5">
                <div>
                    <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Entreprise signalée
                    </p>
                    <h3 className="font-heading text-lg font-bold text-primary">
                        {company.name}
                    </h3>
                </div>

                <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {company.description || "Aucune présentation."}
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="SIRET">{formatSiret(company.siret)}</Field>
                    <Field label="Dénomination légale">
                        {company.legalName || "—"}
                    </Field>
                    <Field label="Activité">{company.activity || "—"}</Field>
                    <Field label="Effectif">
                        {employeeRangeLabel(company.employeeRange)}
                    </Field>
                    <Field label="Adresse">
                        {company.address?.label || "—"}
                    </Field>
                    <Field label="Site">{company.link || "—"}</Field>
                </div>
            </div>
        );
    }

    let reporter = "Compte supprimé";
    if (report.reporter !== null) {
        reporter =
            report.reporter.firstname +
            " " +
            report.reporter.lastname +
            " (" +
            report.reporter.email +
            ")";
    }

    return (
        <Dialog open={true} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="font-heading text-primary">
                        Signalement — {reportReasonLabel(report.reason)}
                    </DialogTitle>
                    <DialogDescription>
                        Déposé par {reporter} le {formatDate(report.createdAt)}.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-1 border-l-2 border-destructive bg-destructive/5 p-4">
                    <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Précisions du signalement
                    </span>
                    <p className="whitespace-pre-wrap text-sm">
                        {report.description || "Aucune précision fournie."}
                    </p>
                </div>

                <Separator />

                {body}
            </DialogContent>
        </Dialog>
    );
}
