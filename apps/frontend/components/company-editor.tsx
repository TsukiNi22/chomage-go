"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import { UserRank } from "@/lib/user-rank";
import { patchCompany, refreshCompanyFromSirene } from "@/lib/api";

type Props = {
    companyId: number;
    description: string;
    link: string;
};

/**
 * Édition des seules données que l'annuaire des entreprises ne fournit pas.
 * Le nom, l'activité, la tranche d'effectifs et l'adresse restent pilotés par le SIRET.
 */
export default function CompanyEditor(props: Props) {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();
    const [description, setDescription] = useState(props.description);
    const [link, setLink] = useState(props.link);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);

    if (isPending || !session) {
        return null;
    }

    const isAdmin = session.user.rank === UserRank.ADMIN;
    const belongsToCompany = session.user.companiesId === props.companyId;

    if (!isAdmin && !belongsToCompany) {
        return null;
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setFeedback(null);
        setFailed(false);

        const updated = await patchCompany(props.companyId, {
            description: description,
            link: link,
        });

        setSaving(false);

        if (updated === null) {
            setFailed(true);
            setFeedback("L'enregistrement a échoué. Réessayez.");
            return;
        }

        setFeedback("Fiche mise à jour.");
        router.refresh();
    }

    async function handleRefresh() {
        setRefreshing(true);
        setFeedback(null);
        setFailed(false);

        const updated = await refreshCompanyFromSirene(props.companyId);

        setRefreshing(false);

        if (updated === null) {
            setFailed(true);
            setFeedback(
                "La resynchronisation a échoué. L'annuaire des entreprises est peut-être indisponible.",
            );
            return;
        }

        setFeedback("Données légales resynchronisées depuis l'annuaire des entreprises.");
        router.refresh();
    }

    let feedbackClass = "sr-only";
    if (feedback !== null) {
        let tone = "border-primary bg-accent text-accent-foreground";
        if (failed) {
            tone = "border-destructive bg-destructive/5 text-destructive";
        }
        feedbackClass = "border px-3 py-2 text-sm " + tone;
    }

    return (
        <section className="mt-10 border border-border bg-background p-8">
            <h2 className="font-heading text-lg font-bold text-primary">
                Compléter la fiche
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
                Le nom, l&apos;activité, la tranche d&apos;effectifs et l&apos;adresse
                proviennent de l&apos;annuaire des entreprises et ne se modifient pas ici.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                    <Label
                        htmlFor="company-description"
                        className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                    >
                        Présentation de l&apos;entreprise
                    </Label>
                    <Textarea
                        id="company-description"
                        rows={5}
                        maxLength={2000}
                        value={description}
                        onChange={function (event) {
                            setDescription(event.target.value);
                        }}
                        placeholder="Votre activité, vos métiers, votre organisation."
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label
                        htmlFor="company-link"
                        className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                    >
                        Site internet
                    </Label>
                    <Input
                        id="company-link"
                        type="url"
                        value={link}
                        onChange={function (event) {
                            setLink(event.target.value);
                        }}
                        placeholder="https://www.exemple.fr"
                    />
                </div>

                <p role="status" aria-live="polite" className={feedbackClass}>
                    {feedback}
                </p>

                <div className="flex flex-wrap justify-end gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        disabled={refreshing}
                        onClick={handleRefresh}
                        className="font-heading font-semibold text-primary hover:bg-accent"
                    >
                        {refreshing ? "Resynchronisation…" : "Resynchroniser depuis le SIRET"}
                    </Button>
                    <Button
                        type="submit"
                        disabled={saving}
                        className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                    >
                        {saving ? "Enregistrement…" : "Enregistrer"}
                    </Button>
                </div>
            </form>
        </section>
    );
}
