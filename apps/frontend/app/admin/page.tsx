"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    fetchAdminMetrics,
    fetchAdminUsers,
    moderateUser,
    type AdminMetrics,
    type AdminUser,
} from "@/lib/api";

const RANK_LABELS = ["Administrateur", "Employeur", "Candidat"];
const STATUS_LABELS = ["En attente", "Acceptée", "Refusée"];

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

export default function AdminPage() {
    const { data: session, isPending } = authClient.useSession();
    const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(0);
    const [reason, setReason] = useState("");
    const [jobId, setJobId] = useState("");
    const [jobFeedback, setJobFeedback] = useState<string | null>(null);

    const isAdmin = session?.user?.rank === UserRank.ADMIN;

    const reload = useCallback(async function () {
        const [m, u] = await Promise.all([fetchAdminMetrics(), fetchAdminUsers()]);
        setMetrics(m);
        setUsers(u);
        setLoading(false);
    }, []);

    useEffect(
        function () {
            if (isPending) {
                return;
            }
            if (!isAdmin) {
                setLoading(false);
                return;
            }
            reload();
        },
        [isPending, isAdmin, reload],
    );

    async function act(
        id: number,
        action: "suspend" | "reactivate" | "ban",
    ) {
        setBusy(id);
        await moderateUser(id, action, reason.trim());
        await reload();
        setBusy(0);
    }

    async function removeJob() {
        const id = Number(jobId);
        if (isNaN(id) || jobId.trim() === "") {
            setJobFeedback("Saisissez un identifiant d'offre valide.");
            return;
        }

        const ok = await adminDeleteJob(id);
        if (ok) {
            setJobFeedback("Offre " + id + " supprimée.");
            setJobId("");
            await reload();
            return;
        }
        setJobFeedback("Suppression impossible : offre introuvable.");
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
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
                <Figure value={metrics.users} label="comptes" />
                <Figure value={metrics.companies} label="entreprises" />
                <Figure value={metrics.jobs} label="offres" />
                <Figure value={metrics.applications} label="candidatures" />
                <Figure value={metrics.suspended} label="suspendus" />
                <Figure value={metrics.banned} label="bannis" />
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

    return (
        <div className="mx-auto max-w-6xl px-6 py-10">
            <h1 className="font-heading text-2xl font-bold text-primary">
                Tableau de bord national
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Suivi global de la plateforme et modération des comptes.
            </p>

            <div className="mt-6">{figures}</div>
            {breakdowns}

            <section className="mt-10">
                <h2 className="font-heading text-lg font-bold text-primary">
                    Retirer une offre
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Suppression administrative, quelle que soit l&apos;entreprise
                    propriétaire.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Input
                        value={jobId}
                        onChange={function (event) {
                            setJobId(event.target.value);
                        }}
                        placeholder="Identifiant de l'offre"
                        className="max-w-56"
                    />
                    <Button
                        type="button"
                        onClick={removeJob}
                        className="bg-destructive font-heading font-semibold text-destructive-foreground hover:bg-destructive/90"
                    >
                        Supprimer l&apos;offre
                    </Button>
                    {jobFeedback !== null && (
                        <span
                            role="status"
                            aria-live="polite"
                            className="text-sm text-muted-foreground"
                        >
                            {jobFeedback}
                        </span>
                    )}
                </div>
            </section>

            <section className="mt-10">
                <h2 className="font-heading text-lg font-bold text-primary">
                    Comptes ({users.length})
                </h2>

                <div className="mt-3 flex flex-col gap-1.5">
                    <label
                        htmlFor="moderation-reason"
                        className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                    >
                        Motif appliqué à la prochaine action
                    </label>
                    <Input
                        id="moderation-reason"
                        value={reason}
                        onChange={function (event) {
                            setReason(event.target.value);
                        }}
                        placeholder="Offres frauduleuses signalées, par exemple"
                    />
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

                                let companyName = "—";
                                if (user.company !== null) {
                                    companyName = user.company.name;
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
                                            <div className="flex justify-end gap-1">
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
        </div>
    );
}
