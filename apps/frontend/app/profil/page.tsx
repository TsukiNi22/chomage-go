"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { fetchMyProfile, fetchUserDataExport } from "@/lib/api";
import type { UserProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import GeolocationNoticeDialog from "@/components/geolocation-notice-dialog";
import { hasSeenNotice, saveNoticeSeen } from "@/lib/geolocation-notice";
import { formatSiret } from "@/lib/siret";
import { safeResume } from "@/lib/resume";
import AddressAutocomplete from "@/components/address-autocomplete";

function Shell(props: { children: React.ReactNode }) {
    return (
        <div className="bg-wash px-6 py-14">
            <div className="mx-auto max-w-2xl">{props.children}</div>
        </div>
    );
}

export default function ProfilPage() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [address, setAddress] = useState("");
    const [description, setDescription] = useState("");
    const [localisation, setLocalisation] = useState(false);
    const [emailContact, setEmailContact] = useState("");
    const [resume, setResume] = useState("");
    const [resumeError, setResumeError] = useState<string | null>(null);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);
    const [passwordFailed, setPasswordFailed] = useState(false);
    const [noticeOpen, setNoticeOpen] = useState(false);
    const [noticeAsksConsent, setNoticeAsksConsent] = useState(false);

    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

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
                    setEmailContact(data.emailContact || "");
                    setResume(data.resume || "");
                }
                setLoadingProfile(false);
            });

            return function () {
                cancelled = true;
            };
        },
        [session],
    );

    const MAX_RESUME_BYTES = 2 * 1024 * 1024;

    function handleResumeChange(event: React.ChangeEvent<HTMLInputElement>) {
        setResumeError(null);

        const files = event.target.files;
        if (files === null || files.length === 0) {
            return;
        }

        const file = files[0];
        if (file.size > MAX_RESUME_BYTES) {
            setResumeError("Le fichier dépasse 2 Mo.");
            event.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = function () {
            setResume(String(reader.result));
        };
        reader.onerror = function () {
            setResumeError("La lecture du fichier a échoué.");
        };
        reader.readAsDataURL(file);
    }

    function removeResume() {
        setResume("");
        setResumeError(null);
    }

    async function handleChangePassword(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setChangingPassword(true);
        setPasswordFeedback(null);
        setPasswordFailed(false);

        const result = await authClient.changePassword({
            currentPassword: currentPassword,
            newPassword: newPassword,
            revokeOtherSessions: true,
        });

        setChangingPassword(false);

        if (result.error) {
            setPasswordFailed(true);
            setPasswordFeedback(
                "Le mot de passe actuel est incorrect, ou le nouveau ne respecte pas les règles.",
            );
            return;
        }

        setCurrentPassword("");
        setNewPassword("");
        setPasswordFeedback("Mot de passe modifié. Vos autres sessions ont été déconnectées.");
    }

    function handleLocalisationChange(checked: boolean) {
        if (!checked) {
            setLocalisation(false);
            return;
        }

        if (hasSeenNotice()) {
            setLocalisation(true);
            return;
        }

        setNoticeAsksConsent(true);
        setNoticeOpen(true);
    }

    function openNoticeForReading() {
        setNoticeAsksConsent(false);
        setNoticeOpen(true);
    }

    function acceptNotice() {
        saveNoticeSeen();
        setLocalisation(true);
        setNoticeOpen(false);
    }

    let passwordFeedbackClass =
        "border border-success/40 bg-success/5 px-3 py-2 text-sm text-success";
    if (passwordFailed) {
        passwordFeedbackClass =
            "border border-destructive bg-destructive/5 px-3 py-2 text-sm text-destructive";
    }

    let passwordLabel = "Modifier le mot de passe";
    if (changingPassword) {
        passwordLabel = "Modification…";
    }

    let resumeBlock = (
        <p className="text-sm text-muted-foreground">Aucun CV enregistré.</p>
    );
    const resumeHref = safeResume(resume);
    if (resumeHref !== null) {
        resumeBlock = (
            <div className="flex flex-wrap items-center gap-3">
                <span className="font-heading text-sm font-semibold text-primary">
                    CV enregistré
                </span>
                <a
                    href={resumeHref}
                    download="cv.pdf"
                    className="font-heading text-sm font-medium text-primary underline underline-offset-4 hover:no-underline"
                >
                    Télécharger
                </a>
                <button
                    type="button"
                    onClick={removeResume}
                    className="font-heading text-sm font-medium text-destructive underline underline-offset-4 hover:no-underline"
                >
                    Retirer
                </button>
            </div>
        );
    }

    let companyBlock = null;
    if (profile !== null && profile.company) {
        const company = profile.company;
        companyBlock = (
            <div className="flex flex-col gap-4 border-t border-border pt-6">
                <div className="flex flex-col gap-1.5">
                    <Label
                        htmlFor="profil-company"
                        className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                    >
                        Entreprise
                    </Label>
                    <Input id="profil-company" value={company.name} disabled />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label
                        htmlFor="profil-siret"
                        className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                    >
                        Numéro de SIRET
                    </Label>
                    <Input
                        id="profil-siret"
                        value={formatSiret(company.siret)}
                        disabled
                    />
                    <p className="text-xs text-muted-foreground">
                        Le SIRET identifie légalement votre établissement et ne peut pas
                        être modifié depuis le profil. Contactez l&apos;assistance en cas
                        d&apos;erreur.
                    </p>
                </div>
            </div>
        );
    }

    let noticeAcceptHandler: (() => void) | undefined = undefined;
    if (noticeAsksConsent) {
        noticeAcceptHandler = acceptNotice;
    }

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
            emailContact: emailContact,
            resume: resume,
        });

        setSaving(false);

        if (result.error) {
            setFailed(true);
            setFeedback("L'enregistrement a échoué. Réessayez.");
        } else {
            setFeedback("Profil enregistré.");
        }
    }

    async function handleExportData() {
        setExporting(true);
        setExportError(null);

        try {
            const data = await fetchUserDataExport();
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json",
            });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = "export-geo-emploi.json";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch {
            setExportError("L'export a échoué. Réessayez dans un instant.");
        } finally {
            setExporting(false);
        }
    }

    function handleDeleteOpenChange(nextOpen: boolean) {
        setDeleteOpen(nextOpen);
        if (!nextOpen) {
            setDeletePassword("");
            setDeleteError(null);
        }
    }

    async function handleDeleteAccount(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setDeleting(true);
        setDeleteError(null);

        const result = await authClient.deleteUser({
            password: deletePassword,
        });

        setDeleting(false);

        if (result.error) {
            setDeleteError(
                "Mot de passe incorrect ou suppression impossible. Réessayez.",
            );
            return;
        }

        setDeleteOpen(false);
        await authClient.signOut();
        router.push("/");
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

                {companyBlock}

                <div className="flex flex-col gap-1.5">
                    <Label
                        htmlFor="profil-address"
                        className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                    >
                        Adresse postale
                    </Label>
                    <AddressAutocomplete
                        id="profil-address"
                        value={address}
                        onChange={setAddress}
                        placeholder="12 rue de la Paix, 35000 Rennes"
                    />
                    <p className="text-xs text-muted-foreground">
                        Commencez à saisir votre adresse, puis choisissez une proposition
                        pour qu&apos;elle soit correctement localisée.
                    </p>
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

                <div className="flex flex-col gap-1.5">
                    <Label
                        htmlFor="profil-email-contact"
                        className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                    >
                        Adresse électronique de contact
                    </Label>
                    <Input
                        id="profil-email-contact"
                        type="email"
                        value={emailContact}
                        onChange={function (event) {
                            setEmailContact(event.target.value);
                        }}
                        placeholder="Laissez vide pour utiliser votre adresse de connexion"
                    />
                    <p className="text-xs text-muted-foreground">
                        Adresse communiquée aux employeurs, si vous souhaitez qu&apos;elle
                        diffère de votre adresse de connexion.
                    </p>
                </div>

                <div className="flex flex-col gap-2 border-t border-border pt-6">
                    <Label
                        htmlFor="profil-resume"
                        className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                    >
                        CV (PDF)
                    </Label>

                    {resumeBlock}

                    <input
                        id="profil-resume"
                        type="file"
                        accept="application/pdf"
                        onChange={handleResumeChange}
                        className="text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border file:border-input file:bg-transparent file:px-3 file:py-1.5 file:font-heading file:text-sm file:font-semibold file:text-primary"
                    />

                    <p className="text-xs leading-relaxed text-muted-foreground">
                        Transmis à l&apos;employeur avec vos candidatures. 2 Mo maximum.
                    </p>

                    {resumeError !== null && (
                        <p
                            role="status"
                            aria-live="polite"
                            className="border border-destructive bg-destructive/5 px-3 py-2 text-sm text-destructive"
                        >
                            {resumeError}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-2 border-t border-border pt-6">
                    <div className="flex items-center gap-3">
                        <Switch
                            id="profil-localisation"
                            checked={localisation}
                            onCheckedChange={handleLocalisationChange}
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
                        sur nos serveurs. GéoEmploi reste pleinement utilisable sans
                        cette option.
                    </p>
                    <button
                        type="button"
                        onClick={openNoticeForReading}
                        className="self-start font-heading text-xs font-medium text-primary underline underline-offset-4 hover:no-underline"
                    >
                        Consulter la mention d&apos;information sur la géolocalisation
                    </button>
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

            <div className="mt-8 border border-border bg-background p-8">
                <h2 className="font-heading text-lg font-bold text-primary">
                    Mot de passe
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    La modification déconnecte vos autres sessions.
                </p>

                <form
                    onSubmit={handleChangePassword}
                    className="mt-4 flex flex-col gap-4"
                >
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="profil-current-password">
                            Mot de passe actuel
                        </Label>
                        <Input
                            id="profil-current-password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={currentPassword}
                            onChange={function (event) {
                                setCurrentPassword(event.target.value);
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="profil-new-password">Nouveau mot de passe</Label>
                        <Input
                            id="profil-new-password"
                            type="password"
                            autoComplete="new-password"
                            required
                            minLength={8}
                            value={newPassword}
                            onChange={function (event) {
                                setNewPassword(event.target.value);
                            }}
                        />
                    </div>

                    {passwordFeedback !== null && (
                        <p
                            role="status"
                            aria-live="polite"
                            className={passwordFeedbackClass}
                        >
                            {passwordFeedback}
                        </p>
                    )}

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={changingPassword}
                            className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                        >
                            {passwordLabel}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="mt-8 border border-border bg-background p-8">
                <h2 className="font-heading text-lg font-bold text-primary">
                    Mes données
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Téléchargez une copie complète de vos données personnelles
                    (profil, candidatures, historique) au format JSON.
                </p>

                <Button
                    type="button"
                    onClick={handleExportData}
                    disabled={exporting}
                    className="mt-4 bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                >
                    {exporting ? "Extraction…" : "Extraire mes données"}
                </Button>

                {exportError !== null && (
                    <p
                        role="status"
                        aria-live="polite"
                        className="mt-3 border border-destructive bg-destructive/5 px-3 py-2 text-sm text-destructive"
                    >
                        {exportError}
                    </p>
                )}
            </div>

            <div className="mt-8 border border-destructive/40 bg-background p-8">
                <h2 className="font-heading text-lg font-bold text-destructive">
                    Zone dangereuse
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    La suppression de votre compte est définitive et supprime
                    l&apos;ensemble de vos données (candidatures, profil, préférences).
                </p>

                <Dialog open={deleteOpen} onOpenChange={handleDeleteOpenChange}>
                    <DialogTrigger asChild>
                        <Button
                            type="button"
                            className="mt-4 border border-destructive bg-transparent font-heading font-semibold text-destructive hover:bg-destructive/10"
                        >
                            Supprimer mon compte
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="font-heading text-destructive">
                                Supprimer définitivement votre compte ?
                            </DialogTitle>
                        </DialogHeader>

                        <form
                            onSubmit={handleDeleteAccount}
                            className="flex flex-col gap-4"
                        >
                            <p className="text-sm text-muted-foreground">
                                Cette action est irréversible. Saisissez votre mot de
                                passe pour confirmer.
                            </p>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="delete-password">Mot de passe</Label>
                                <Input
                                    id="delete-password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={deletePassword}
                                    onChange={function (event) {
                                        setDeletePassword(event.target.value);
                                    }}
                                />
                            </div>

                            {deleteError !== null && (
                                <p
                                    role="status"
                                    aria-live="polite"
                                    className="border border-destructive bg-destructive/5 px-3 py-2 text-sm text-destructive"
                                >
                                    {deleteError}
                                </p>
                            )}

                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={deleting}
                                    className="bg-destructive font-heading font-semibold text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {deleting
                                        ? "Suppression…"
                                        : "Supprimer définitivement"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <GeolocationNoticeDialog
                open={noticeOpen}
                onOpenChange={setNoticeOpen}
                onAccept={noticeAcceptHandler}
            />
        </Shell>
    );
}