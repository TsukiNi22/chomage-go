"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { fetchAccountState, type AccountModeration } from "@/lib/api";

export function moderationTitle(moderation: AccountModeration): string {
    if (moderation.source === "company") {
        if (moderation.state === "banned") {
            return "Votre entreprise a été bannie";
        }
        return "Votre entreprise est suspendue";
    }

    if (moderation.state === "banned") {
        return "Votre compte a été banni";
    }
    return "Votre compte est suspendu";
}

export function moderationBody(moderation: AccountModeration): string {
    if (moderation.source === "company") {
        let name = "L'entreprise rattachée à votre compte";
        if (moderation.companyName) {
            name = moderation.companyName;
        }

        if (moderation.state === "banned") {
            return (
                name +
                " a été bannie de la plateforme. Votre compte n'est pas banni, mais il perd les mêmes accès : ses offres et sa fiche sont retirées de la diffusion publique et vous ne pouvez plus publier ni gérer de candidatures."
            );
        }

        return (
            name +
            " est suspendue. Votre compte n'est pas suspendu, mais il perd les mêmes accès tant que la suspension est en vigueur : ses offres et sa fiche sont retirées de la diffusion publique et vous ne pouvez plus publier ni gérer de candidatures."
        );
    }

    if (moderation.state === "banned") {
        return "L'accès à la plateforme vous a été définitivement retiré par un administrateur. Vous ne pouvez plus candidater, publier d'offre ni modifier votre profil.";
    }
    return "Un administrateur a suspendu votre compte. Vous ne pouvez plus candidater, publier d'offre ni modifier votre profil tant que la suspension est en vigueur.";
}

export function moderationReasonText(reason: string | null): string {
    if (reason === null || reason.trim() === "") {
        return "Aucun motif n'a été précisé par la modération.";
    }
    return reason;
}

/**
 * Avertit l'utilisateur dès sa connexion lorsque son compte est suspendu ou banni,
 * en reprenant le motif saisi par la modération.
 */
export default function AccountModerationDialog() {
    const { data: session } = authClient.useSession();
    const [moderation, setModeration] = useState<AccountModeration | null>(null);
    const [open, setOpen] = useState(false);

    const userId = session?.user?.id;

    useEffect(
        function () {
            if (userId === undefined) {
                setModeration(null);
                setOpen(false);
                return;
            }

            let cancelled = false;

            fetchAccountState().then(function (state) {
                if (cancelled) {
                    return;
                }
                setModeration(state.moderation);
                setOpen(state.moderation !== null);
            });

            return function () {
                cancelled = true;
            };
        },
        [userId],
    );

    if (moderation === null) {
        return null;
    }

    async function handleSignOut() {
        setOpen(false);
        await authClient.signOut();
        window.location.href = "/";
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-heading text-destructive">
                        {moderationTitle(moderation)}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                        {moderationBody(moderation)}
                    </p>

                    <div className="flex flex-col gap-1 border-l-2 border-destructive bg-destructive/5 p-4">
                        <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                            Motif
                        </span>
                        <p className="text-sm">{moderationReasonText(moderation.reason)}</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={function () {
                            setOpen(false);
                        }}
                        className="font-heading font-semibold text-primary hover:bg-accent"
                    >
                        Fermer
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSignOut}
                        className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                    >
                        Se déconnecter
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
