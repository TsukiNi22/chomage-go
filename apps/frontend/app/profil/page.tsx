"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { fetchMyProfile } from "@/lib/api";
import type { UserProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

function Shell(props: { children: React.ReactNode }) {
    return (
        <div className="bg-wash px-6 py-14">
            <div className="mx-auto max-w-2xl">{props.children}</div>
        </div>
    );
}

export default function ProfilPage() {
    const { data: session, isPending } = authClient.useSession();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [address, setAddress] = useState("");
    const [description, setDescription] = useState("");
    const [localisation, setLocalisation] = useState(false);

    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(
        function () {
            if (!session) {
                setLoadingProfile(false);
                return;
            }

            let cancelled = false;

            fetchMyProfile().then(function (data) {
                if (cancelled) {
                    return;
                }
                setProfile(data);
                if (data !== null) {
                    setFirstname(data.firstname || "");
                    setLastname(data.lastname || "");
                    setAddress(data.address || "");
                    setDescription(data.description || "");
                    setLocalisation(data.localisation || false);
                }
                setLoadingProfile(false);
            });

            return function () {
                cancelled = true;
            };
        },
        [session],
    );

    async function handleSave(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setFeedback(null);
        setFailed(false);

        const result = await authClient.updateUser({
            name: firstname + " " + lastname,
            firstname: firstname,
            lastname: lastname,
            address: address,
            description: description,
            localisation: localisation,
        });

        setSaving(false);

        if (result.error) {
            setFailed(true);
            setFeedback("L'enregistrement a échoué. Réessayez.");
        } else {
            setFeedback("Profil enregistré.");
        }
    }

    if (isPending || loadingProfile) {
        return (
            <Shell>
                <Skeleton className="h-96 w-full rounded-none" />
            </Shell>
        );
    }

    if (!session) {
        return (
            <Shell>
                <div className="border-l-2 border-primary bg-background p-10">
                    <h1 className="font-heading text-2xl font-bold text-primary">
                        Connexion requise
                    </h1>
                    <p className="mt-3 text-muted-foreground">
                        Connectez-vous pour consulter et modifier votre profil.
                    </p>
                </div>
            </Shell>
        );
    }

    if (profile === null) {
        return (
            <Shell>
                <div className="border-l-2 border-destructive bg-background p-10">
                    <h1 className="font-heading text-2xl font-bold text-primary">
                        Profil indisponible
                    </h1>
                    <p className="mt-3 text-muted-foreground">
                        Le service ne répond pas. Réessayez dans un instant.
                    </p>
                </div>
            </Shell>
        );
    }

    // Région d'annonce présente en permanence dans le document, masquée tant
    // qu'elle est vide : une région live créée avec son message n'est pas
    // restituée de façon fiable (RGAA 11.10).
    let feedbackClass = "sr-only";
    if (feedback !== null) {
        let tone = "border-primary bg-accent text-accent-foreground";
        if (failed) {
            tone = "border-destructive bg-destructive/5 text-destructive";
        }
        feedbackClass = "border px-3 py-2 text-sm " + tone;
    }

    const feedbackBlock = (
        <p role="status" aria-live="polite" className={feedbackClass}>
            {feedback}
        </p>
    );

    let saveLabel = "Enregistrer";
    if (saving) {
        saveLabel = "Enregistrement…";
    }

    return (
        <Shell>
            <h1 className="font-heading text-3xl font-bold text-primary">
                Mon profil
            </h1>
            <p className="mt-2 text-muted-foreground">
                Ces informations sont transmises aux employeurs lorsque vous
                candidatez.
            </p>

            <form
                onSubmit={handleSave}
                className="mt-8 flex flex-col gap-6 border border-border bg-background p-8"
            >
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                        <Label
                            htmlFor="profil-lastname"
                            className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                        >
                            Nom
                        </Label>
                        <Input
                            id="profil-lastname"
                            value={lastname}
                            onChange={function (event) {
                                setLastname(event.target.value);
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label
                            htmlFor="profil-firstname"
                            className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                        >
                            Prénom
                        </Label>
                        <Input
                            id="profil-firstname"
                            value={firstname}
                            onChange={function (event) {
                                setFirstname(event.target.value);
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label
                        htmlFor="profil-email"
                        className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                    >
                        Adresse électronique
                    </Label>
                    <Input id="profil-email" value={session.user.email} disabled />
                    <p className="text-xs text-muted-foreground">
                        La modification de l&apos;adresse électronique nécessite une
                        vérification. Contactez l&apos;assistance.
                    </p>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label
                        htmlFor="profil-address"
                        className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                    >
                        Adresse postale
                    </Label>
                    <Input
                        id="profil-address"
                        value={address}
                        onChange={function (event) {
                            setAddress(event.target.value);
                        }}
                        placeholder="12 rue de la Paix, 35000 Rennes"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label
                        htmlFor="profil-description"
                        className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                    >
                        Présentation
                    </Label>
                    <textarea
                        id="profil-description"
                        value={description}
                        onChange={function (event) {
                            setDescription(event.target.value);
                        }}
                        placeholder="Votre parcours, vos compétences, ce que vous recherchez."
                        className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring"
                    />
                </div>

                <div className="flex flex-col gap-2 border-t border-border pt-6">
                    <div className="flex items-center gap-3">
                        <Switch
                            id="profil-localisation"
                            checked={localisation}
                            onCheckedChange={setLocalisation}
                        />
                        <Label
                            htmlFor="profil-localisation"
                            className="font-heading text-sm font-medium"
                        >
                            Autoriser la géolocalisation
                        </Label>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        Votre position est calculée sur votre appareil pour trier les
                        offres par proximité. Elle n&apos;est ni transmise ni conservée
                        sur nos serveurs. ChômageGo reste pleinement utilisable sans
                        cette option.
                    </p>
                </div>

                {feedbackBlock}

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={saving}
                        className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                    >
                        {saveLabel}
                    </Button>
                </div>
            </form>
        </Shell>
    );
}
