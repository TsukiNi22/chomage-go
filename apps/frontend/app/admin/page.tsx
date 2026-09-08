"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth-client";
import { UserRank } from "@/lib/user-rank";
import {
    adminDeleteJob,
    fetchAdminJobs,
    fetchAdminMetrics,
    fetchAdminReports,
    fetchAdminUsers,
    moderateUser,
    reportReasonLabel,
    setReportStatus,
    setUserRank,
    type AdminJob,
    type AdminMetrics,
    type AdminReport,
    type AdminUser,
} from "@/lib/api";

const RANK_LABELS = ["Administrateur", "Employeur", "Candidat"];
const STATUS_LABELS = ["En attente", "Acceptée", "Refusée"];
const REPORT_STATUS_LABELS = ["Ouvert", "Traité", "Rejeté"];
const CONTRACTS = ["CDI", "CDD", "Alternance", "Stage", "Freelance"];

function rankLabel(rank: number) {
    const label = RANK_LABELS[rank];
    if (label === undefined) {
        return "Inconnu";
    }
    return label;
}

function statusLabel(status: number) {
    const label = STATUS_LABELS[status];
    if (label === undefined) {
        return "Inconnu";
    }
    return label;
}

function reportStatusLabel(status: number) {
    const label = REPORT_STATUS_LABELS[status];
    if (label === undefined) {
        return "Inconnu";
    }
    return label;
}

function contractLabel(type: number) {
    const label = CONTRACTS[type];
    if (label === undefined) {
        return "CDI";
    }
    return label;
}

function Figure(props: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center gap-1 border border-border bg-background p-5 text-center">
            <span className="font-heading text-3xl font-bold text-primary">
                {props.value.toLocaleString("fr-FR")}
            </span>
            <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {props.label}
            </span>
        </div>
    );
}

function Breakdown(props: {
    title: string;
    rows: { label: string; total: number }[];
}) {
    return (
        <div className="border border-border bg-background p-5">
            <h3 className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {props.title}
            </h3>
            <ul className="mt-3 flex flex-col gap-2">
                {props.rows.map(function (row) {
                    return (
                        <li
                            key={row.label}
                            className="flex items-center justify-between gap-4 text-sm"
                        >
                            <span className="text-foreground">{row.label}</span>
                            <span className="font-heading font-semibold text-primary">
                                {row.total.toLocaleString("fr-FR")}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function ResultCount(props: { total: number; noun: string }) {
    return (
        <p aria-live="polite" className="text-sm text-muted-foreground">
            {props.total.toLocaleString("fr-FR")} {props.noun}
        </p>
    );
}

export default function AdminPage() {
    const { data: session, isPending } = authClient.useSession();
    const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [jobs, setJobs] = useState<AdminJob[]>([]);
    const [reports, setReports] = useState<AdminReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(0);
    const [reason, setReason] = useState("");

    const [userQuery, setUserQuery] = useState("");
    const [userRankFilter, setUserRankFilter] = useState("tous");
    const [userStateFilter, setUserStateFilter] = useState("tous");
    const [jobQuery, setJobQuery] = useState("");
    const [reportQuery, setReportQuery] = useState("");
    const [reportStatusFilter, setReportStatusFilter] = useState("tous");

    const [rankTarget, setRankTarget] = useState<AdminUser | null>(null);
    const [rankValue, setRankValue] = useState("2");
    const [rankSaving, setRankSaving] = useState(false);
    const [rankError, setRankError] = useState<string | null>(null);

    const [jobToDelete, setJobToDelete] = useState<AdminJob | null>(null);
    const [jobDeleting, setJobDeleting] = useState(false);

    const isAdmin = session?.user?.rank === UserRank.ADMIN;

    function filterValue(value: string): string {
        if (value === "tous") {
            return "";
        }
        return value;
    }

    const reload = useCallback(
        async function () {
            const [m, u, j, r] = await Promise.all([
                fetchAdminMetrics(),
                fetchAdminUsers({
                    q: userQuery,
                    rank: filterValue(userRankFilter),
                    state: filterValue(userStateFilter),
                }),
                fetchAdminJobs(jobQuery),
                fetchAdminReports({
                    q: reportQuery,
                    status: filterValue(reportStatusFilter),
                }),
            ]);
            setMetrics(m);
            setUsers(u);
            setJobs(j);
            setReports(r);
            setLoading(false);
        },
        [userQuery, userRankFilter, userStateFilter, jobQuery, reportQuery, reportStatusFilter],
    );

    useEffect(
        function () {
            if (isPending) {
                return;
            }
            if (!isAdmin) {
                setLoading(false);
                return;
            }

            // Les recherches sont relancées après une courte pause de frappe.
            const timer = setTimeout(function () {
                reload();
            }, 300);

            return function () {
                clearTimeout(timer);
            };
        },
        [isPending, isAdmin, reload],
    );

    async function act(id: number, action: "suspend" | "reactivate" | "ban") {
        setBusy(id);
        await moderateUser(id, action, reason.trim());
        await reload();
        setBusy(0);
    }

    function askRankChange(user: AdminUser) {
        setRankError(null);
        setRankValue(String(user.rank));
        setRankTarget(user);
    }

    function cancelRankChange() {
        setRankTarget(null);
        setRankError(null);
    }

    async function confirmRankChange() {
        if (rankTarget === null) {
            return;
        }

        setRankSaving(true);
        const result = await setUserRank(rankTarget.id, Number(rankValue));
        setRankSaving(false);

        if (!result.ok) {
            setRankError(result.message);
            return;
        }

        setRankTarget(null);
        await reload();
    }

    async function confirmJobDelete() {
        if (jobToDelete === null) {
            return;
        }

        setJobDeleting(true);
        await adminDeleteJob(jobToDelete.id);
        setJobDeleting(false);
        setJobToDelete(null);
        await reload();
    }

    async function handleReportStatus(id: number, status: number) {
        setBusy(id);
        await setReportStatus(id, status);
        await reload();
        setBusy(0);
    }

    if (isPending || loading) {
        return (
            <div className="mx-auto max-w-6xl px-6 py-10">
                <p className="text-sm text-muted-foreground">Chargement…</p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="mx-auto max-w-6xl px-6 py-10">
                <div className="border-l-2 border-destructive bg-background p-10">
                    <h1 className="font-heading text-2xl font-bold text-primary">
                        Accès réservé
                    </h1>
                    <p className="mt-3 text-muted-foreground">
                        Cette page est réservée aux administrateurs de la plateforme.
                    </p>
                </div>
            </div>
        );
    }

    let figures = null;
    let breakdowns = null;

    if (metrics !== null) {
        figures = (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-7">
                <Figure value={metrics.users} label="comptes" />
                <Figure value={metrics.companies} label="entreprises" />
                <Figure value={metrics.jobs} label="offres" />
                <Figure value={metrics.applications} label="candidatures" />
                <Figure value={metrics.suspended} label="suspendus" />
                <Figure value={metrics.banned} label="bannis" />
                <Figure value={metrics.openReports} label="signalements ouverts" />
            </div>
        );

        breakdowns = (
            <div className="mt-6 grid gap-4 lg:grid-cols-4">
                <Breakdown
                    title="Comptes par rôle"
                    rows={metrics.byRank.map(function (row) {
                        return { label: rankLabel(row.rank), total: row.total };
                    })}
                />
                <Breakdown
                    title="Candidatures par statut"
                    rows={metrics.byApplicationStatus.map(function (row) {
                        return { label: statusLabel(row.status), total: row.total };
                    })}
                />
                <Breakdown
                    title="Communes les plus actives"
                    rows={metrics.topCities.map(function (row) {
                        return { label: row.city || "Non renseignée", total: row.total };
                    })}
                />
                <Breakdown
                    title="Secteurs les plus actifs"
                    rows={metrics.topSectors.map(function (row) {
                        return {
                            label: row.sector || "Non renseigné",
                            total: row.total,
                        };
                    })}
                />
            </div>
        );
    }

    let rankTargetName = "";
    if (rankTarget !== null) {
        rankTargetName = rankTarget.firstname + " " + rankTarget.lastname;
    }

    let jobToDeleteTitle = "";
    if (jobToDelete !== null) {
        jobToDeleteTitle = jobToDelete.title;
    }

    return (
        <div className="mx-auto max-w-6xl px-6 py-10">
            <h1 className="font-heading text-2xl font-bold text-primary">
                Tableau de bord national
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Suivi global de la plateforme, modération des comptes et traitement des
                signalements.
            </p>

            <div className="mt-6">{figures}</div>
            {breakdowns}

            <Tabs defaultValue="comptes" className="mt-10">
                <TabsList>
                    <TabsTrigger value="comptes" className="font-heading">
                        Comptes
                    </TabsTrigger>
                    <TabsTrigger value="offres" className="font-heading">
                        Offres
                    </TabsTrigger>
                    <TabsTrigger value="signalements" className="font-heading">
                        Signalements
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="comptes">
                    <section className="mt-4">
                        <div className="grid gap-3 lg:grid-cols-3">
                            <div className="flex flex-col gap-1.5">
                                <Label
                                    htmlFor="user-search"
                                    className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                                >
                                    Rechercher un compte
                                </Label>
                                <Input
                                    id="user-search"
                                    type="search"
                                    value={userQuery}
                                    onChange={function (event) {
                                        setUserQuery(event.target.value);
                                    }}
                                    placeholder="Nom, prénom ou adresse électronique"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label
                                    htmlFor="user-rank-filter"
                                    className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                                >
                                    Rôle
                                </Label>
                                <Select value={userRankFilter} onValueChange={setUserRankFilter}>
                                    <SelectTrigger id="user-rank-filter" className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tous">Tous les rôles</SelectItem>
                                        <SelectItem value="0">Administrateur</SelectItem>
                                        <SelectItem value="1">Employeur</SelectItem>
                                        <SelectItem value="2">Candidat</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label
                                    htmlFor="user-state-filter"
                                    className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                                >
                                    État
                                </Label>
                                <Select value={userStateFilter} onValueChange={setUserStateFilter}>
                                    <SelectTrigger id="user-state-filter" className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tous">Tous les états</SelectItem>
                                        <SelectItem value="active">Actif</SelectItem>
                                        <SelectItem value="suspended">Suspendu</SelectItem>
                                        <SelectItem value="banned">Banni</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-4 flex items-end justify-between gap-4">
                            <div className="flex w-full max-w-md flex-col gap-1.5">
                                <Label
                                    htmlFor="moderation-reason"
                                    className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                                >
                                    Motif appliqué à la prochaine action
                                </Label>
                                <Input
                                    id="moderation-reason"
                                    value={reason}
                                    onChange={function (event) {
                                        setReason(event.target.value);
                                    }}
                                    placeholder="Offres frauduleuses signalées, par exemple"
                                />
                            </div>
                            <ResultCount total={users.length} noun="compte(s)" />
                        </div>

                        <div className="mt-4 overflow-x-auto border border-border bg-background">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead scope="col">Nom</TableHead>
                                        <TableHead scope="col">Email</TableHead>
                                        <TableHead scope="col">Rôle</TableHead>
                                        <TableHead scope="col">Entreprise</TableHead>
                                        <TableHead scope="col">État</TableHead>
                                        <TableHead scope="col" className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {users.map(function (user) {
                                        let state = (
                                            <Badge variant="outline" className="font-heading">
                                                Actif
                                            </Badge>
                                        );
                                        if (user.suspendedAt !== null) {
                                            state = (
                                                <Badge
                                                    variant="outline"
                                                    className="border-action-text font-heading text-action-text"
                                                >
                                                    Suspendu
                                                </Badge>
                                            );
                                        }
                                        if (user.bannedAt !== null) {
                                            state = (
                                                <Badge
                                                    variant="outline"
                                                    className="border-destructive font-heading text-destructive"
                                                >
                                                    Banni
                                                </Badge>
                                            );
                                        }

                                        let companyName: React.ReactNode = "—";
                                        if (user.company !== null && user.companiesId !== null) {
                                            companyName = (
                                                <Link
                                                    href={"/entreprises/" + user.companiesId}
                                                    className="text-primary underline underline-offset-4 hover:no-underline"
                                                >
                                                    {user.company.name}
                                                </Link>
                                            );
                                        }

                                        return (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-heading font-semibold text-primary">
                                                    {user.firstname} {user.lastname}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {user.email}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {rankLabel(user.rank)}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {companyName}
                                                </TableCell>
                                                <TableCell>{state}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-wrap justify-end gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={busy === user.id}
                                                            onClick={function () {
                                                                askRankChange(user);
                                                            }}
                                                            className="font-heading text-xs font-semibold text-primary hover:bg-accent"
                                                        >
                                                            Rôle
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={busy === user.id}
                                                            onClick={function () {
                                                                act(user.id, "suspend");
                                                            }}
                                                            className="font-heading text-xs font-semibold text-action-text hover:bg-accent"
                                                        >
                                                            Suspendre
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={busy === user.id}
                                                            onClick={function () {
                                                                act(user.id, "reactivate");
                                                            }}
                                                            className="font-heading text-xs font-semibold text-primary hover:bg-accent"
                                                        >
                                                            Réactiver
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={busy === user.id}
                                                            onClick={function () {
                                                                act(user.id, "ban");
                                                            }}
                                                            className="font-heading text-xs font-semibold text-destructive hover:bg-destructive/10"
                                                        >
                                                            Bannir
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </section>
                </TabsContent>

                <TabsContent value="offres">
                    <section className="mt-4">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div className="flex w-full max-w-md flex-col gap-1.5">
                                <Label
                                    htmlFor="job-search"
                                    className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                                >
                                    Rechercher une offre
                                </Label>
                                <Input
                                    id="job-search"
                                    type="search"
                                    value={jobQuery}
                                    onChange={function (event) {
                                        setJobQuery(event.target.value);
                                    }}
                                    placeholder="Intitulé, secteur, entreprise ou commune"
                                />
                            </div>
                            <ResultCount total={jobs.length} noun="offre(s)" />
                        </div>

                        <div className="mt-4 overflow-x-auto border border-border bg-background">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead scope="col">Intitulé</TableHead>
                                        <TableHead scope="col">Entreprise</TableHead>
                                        <TableHead scope="col">Commune</TableHead>
                                        <TableHead scope="col">Contrat</TableHead>
                                        <TableHead scope="col" className="text-right">
                                            Candidatures
                                        </TableHead>
                                        <TableHead scope="col" className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {jobs.map(function (job) {
                                        let companyName: React.ReactNode = "—";
                                        if (job.company !== null) {
                                            companyName = (
                                                <Link
                                                    href={"/entreprises/" + job.companiesId}
                                                    className="text-primary underline underline-offset-4 hover:no-underline"
                                                >
                                                    {job.company.name}
                                                </Link>
                                            );
                                        }

                                        let city = "—";
                                        if (job.address !== null && job.address.city !== null) {
                                            city = job.address.city;
                                        }

                                        return (
                                            <TableRow key={job.id}>
                                                <TableCell className="font-heading font-semibold text-primary">
                                                    {job.title}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {companyName}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {city}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-heading">
                                                        {contractLabel(job.type)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right text-sm">
                                                    {job.applicantsCount}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={function () {
                                                            setJobToDelete(job);
                                                        }}
                                                        className="font-heading text-xs font-semibold text-destructive hover:bg-destructive/10"
                                                    >
                                                        Retirer
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </section>
                </TabsContent>

                <TabsContent value="signalements">
                    <section className="mt-4">
                        <div className="grid gap-3 lg:grid-cols-3">
                            <div className="flex flex-col gap-1.5 lg:col-span-2">
                                <Label
                                    htmlFor="report-search"
                                    className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                                >
                                    Rechercher un signalement
                                </Label>
                                <Input
                                    id="report-search"
                                    type="search"
                                    value={reportQuery}
                                    onChange={function (event) {
                                        setReportQuery(event.target.value);
                                    }}
                                    placeholder="Motif, offre, entreprise ou personne"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label
                                    htmlFor="report-status-filter"
                                    className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                                >
                                    Statut
                                </Label>
                                <Select
                                    value={reportStatusFilter}
                                    onValueChange={setReportStatusFilter}
                                >
                                    <SelectTrigger id="report-status-filter" className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tous">Tous les statuts</SelectItem>
                                        <SelectItem value="0">Ouvert</SelectItem>
                                        <SelectItem value="1">Traité</SelectItem>
                                        <SelectItem value="2">Rejeté</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <ResultCount total={reports.length} noun="signalement(s)" />
                        </div>

                        <div className="mt-2 overflow-x-auto border border-border bg-background">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead scope="col">Cible</TableHead>
                                        <TableHead scope="col">Motif</TableHead>
                                        <TableHead scope="col">Précisions</TableHead>
                                        <TableHead scope="col">Signalé par</TableHead>
                                        <TableHead scope="col">Statut</TableHead>
                                        <TableHead scope="col" className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {reports.map(function (report) {
                                        let target = "Cible supprimée";
                                        if (report.job !== null) {
                                            target = "Offre : " + report.job.title;
                                            if (report.job.company !== null) {
                                                target = target + " (" + report.job.company.name + ")";
                                            }
                                        } else if (report.targetUser !== null) {
                                            target =
                                                "Profil : " +
                                                report.targetUser.firstname +
                                                " " +
                                                report.targetUser.lastname;
                                        }

                                        let reporter = "Compte supprimé";
                                        if (report.reporter !== null) {
                                            reporter =
                                                report.reporter.firstname +
                                                " " +
                                                report.reporter.lastname;
                                        }

                                        let statusClass = "font-heading";
                                        if (report.status === 1) {
                                            statusClass = "border-success font-heading text-success";
                                        }
                                        if (report.status === 2) {
                                            statusClass =
                                                "border-destructive font-heading text-destructive";
                                        }

                                        return (
                                            <TableRow key={report.id}>
                                                <TableCell className="max-w-64 whitespace-normal break-words font-heading font-semibold text-primary">
                                                    {target}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {reportReasonLabel(report.reason)}
                                                </TableCell>
                                                <TableCell className="max-w-64 whitespace-normal break-words text-sm text-muted-foreground">
                                                    {report.description || "—"}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {reporter}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={statusClass}>
                                                        {reportStatusLabel(report.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex flex-wrap justify-end gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={busy === report.id}
                                                            onClick={function () {
                                                                handleReportStatus(report.id, 1);
                                                            }}
                                                            className="font-heading text-xs font-semibold text-primary hover:bg-accent"
                                                        >
                                                            Traiter
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={busy === report.id}
                                                            onClick={function () {
                                                                handleReportStatus(report.id, 2);
                                                            }}
                                                            className="font-heading text-xs font-semibold text-destructive hover:bg-destructive/10"
                                                        >
                                                            Rejeter
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </section>
                </TabsContent>
            </Tabs>

            <Dialog open={rankTarget !== null} onOpenChange={cancelRankChange}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-heading text-primary">
                            Modifier le rôle de {rankTargetName}
                        </DialogTitle>
                        <DialogDescription>
                            Le rôle détermine les droits du compte sur la plateforme. Le
                            changement prend effet à la prochaine requête de la personne
                            concernée.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="rank-select">Nouveau rôle</Label>
                        <Select value={rankValue} onValueChange={setRankValue}>
                            <SelectTrigger id="rank-select" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Administrateur</SelectItem>
                                <SelectItem value="1">Employeur</SelectItem>
                                <SelectItem value="2">Candidat</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Le rôle « Candidat » détache le compte de son entreprise. Le rôle
                            « Employeur » exige un compte déjà rattaché à une entreprise.
                        </p>
                    </div>

                    {rankError !== null && (
                        <p
                            role="alert"
                            aria-live="assertive"
                            className="border border-destructive bg-destructive/5 px-3 py-2 text-sm text-destructive"
                        >
                            {rankError}
                        </p>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={cancelRankChange}
                            className="font-heading font-semibold text-primary hover:bg-accent"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="button"
                            disabled={rankSaving}
                            onClick={confirmRankChange}
                            className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                        >
                            {rankSaving ? "Application…" : "Appliquer le rôle"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={jobToDelete !== null}
                onOpenChange={function () {
                    setJobToDelete(null);
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-heading text-destructive">
                            Retirer cette offre ?
                        </DialogTitle>
                        <DialogDescription>
                            « {jobToDeleteTitle} » sera définitivement supprimée, ainsi que
                            les candidatures reçues. Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={function () {
                                setJobToDelete(null);
                            }}
                            className="font-heading font-semibold text-primary hover:bg-accent"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="button"
                            disabled={jobDeleting}
                            onClick={confirmJobDelete}
                            className="bg-destructive font-heading font-semibold text-destructive-foreground hover:bg-destructive/90"
                        >
                            {jobDeleting ? "Suppression…" : "Supprimer l'offre"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
