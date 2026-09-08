"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { lookupSiret, postCompany, type SireneEstablishment } from "@/lib/api";
import { normalizeSiret, siretError } from "@/lib/siret";
import { companyEmailError } from "@/lib/company-email";

type Props = {
    open: boolean;
    onClose: () => void;
};

type SignupType = "individual" | "employer" | null;

function Field(props: {
    id: string;
    label: string;
    type: string;
    autoComplete: string;
    placeholder?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label
                htmlFor={props.id}
                className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
            >
                {props.label}
                <span aria-hidden="true" className="ml-0.5 text-destructive">
                    *
                </span>
            </Label>
            <Input
                id={props.id}
                type={props.type}
                autoComplete={props.autoComplete}
                placeholder={props.placeholder}
                value={props.value}
                onChange={props.onChange}
                required
            />
        </div>
    );
}

function SignupTypeChoice(props: { onChoose: (type: SignupType) => void }) {
    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
                Quel type de compte souhaitez-vous créer ?
            </p>

            <button
                type="button"
                onClick={function () {
                    props.onChoose("individual");
                }}
                className="flex items-center gap-3 border border-border p-4 text-left transition-colors hover:bg-accent"
            >
                <User className="h-5 w-5 text-primary" />
                <div>
                    <p className="font-heading text-sm font-semibold text-primary">
                        Particulier
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Vous cherchez un emploi
                    </p>
                </div>
            </button>

            <button
                type="button"
                onClick={function () {
                    props.onChoose("employer");
                }}
                className="flex items-center gap-3 border border-border p-4 text-left transition-colors hover:bg-accent"
            >
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                    <p className="font-heading text-sm font-semibold text-primary">
                        Employeur
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Vous souhaitez publier des offres
                    </p>
                </div>
            </button>
        </div>
    );
}

export default function AuthModal(props: Props) {
    const [tab, setTab] = useState("login");
    const [signupType, setSignupType] = useState<SignupType>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [signupLastname, setSignupLastname] = useState("");
    const [signupFirstname, setSignupFirstname] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [employerLastname, setEmployerLastname] = useState("");
    const [employerFirstname, setEmployerFirstname] = useState("");
    const [employerEmail, setEmployerEmail] = useState("");
    const [employerSiret, setEmployerSiret] = useState("");
    const [employerPassword, setEmployerPassword] = useState("");
    const [establishment, setEstablishment] = useState<SireneEstablishment | null>(null);
    const [checkingSiret, setCheckingSiret] = useState(false);

    function handleOpenChange(open: boolean) {
        if (!open) {
            props.onClose();
        }
    }

    function handleTabChange(value: string) {
        setTab(value);
        setSignupType(null);
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);
    
        const result = await authClient.signIn.email({
            email: email,
            password: password,
        });
    
        setLoading(false);
    
        if (result.error) {
            setError("Identifiants incorrects.");
        } else {
            props.onClose();
        }
    }

    async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const result = await authClient.signUp.email({
            email: signupEmail,
            password: signupPassword,
            name: signupFirstname + " " + signupLastname,
            firstname: signupFirstname,
            lastname: signupLastname,
        });

        setLoading(false);

        if (result.error) {
            setError(result.error.message || "Création du compte impossible.");
        } else {
            props.onClose();
        }
    }

    /** Confronte le SIRET saisi à l'annuaire des entreprises pour en tirer la raison sociale. */
    async function verifySiret() {
        setEstablishment(null);
        setError(null);

        const siretProblem = siretError(employerSiret);
        if (siretProblem !== null) {
            setError(siretProblem);
            return null;
        }

        setCheckingSiret(true);
        const lookup = await lookupSiret(normalizeSiret(employerSiret));
        setCheckingSiret(false);

        if (!lookup.ok || lookup.establishment === null) {
            setError(lookup.message || "Ce numéro de SIRET n'a pas pu être vérifié.");
            return null;
        }

        setEstablishment(lookup.establishment);
        return lookup.establishment;
    }

    function handleSiretChange(event: React.ChangeEvent<HTMLInputElement>) {
        setEmployerSiret(event.target.value);
        setEstablishment(null);
    }

    async function handleEmployerSignup(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        const emailProblem = companyEmailError(employerEmail);
        if (emailProblem !== null) {
            setError(emailProblem);
            return;
        }

        // Le nom de l'entreprise n'est jamais saisi : il vient de l'annuaire des entreprises.
        let found = establishment;
        if (found === null) {
            found = await verifySiret();
            if (found === null) {
                return;
            }
        }

        setLoading(true);

        const created = await authClient.signUp.email({
            email: employerEmail,
            password: employerPassword,
            name: employerFirstname + " " + employerLastname,
            firstname: employerFirstname,
            lastname: employerLastname,
        });

        if (created.error) {
            setLoading(false);
            setError(created.error.message || "Création du compte impossible.");
            return;
        }

        const result = await postCompany(normalizeSiret(employerSiret));

        if (result.company === null) {
            setLoading(false);
            setError(
                (result.message || "L'entreprise n'a pas pu être enregistrée.") +
                    " Votre compte est créé, réessayez depuis votre profil.",
            );
            return;
        }

        props.onClose();

        // Le rang vient de passer à « employeur » côté serveur : on recharge la page
        // pour repartir sur une session à jour, avec l'espace de publication d'offres.
        window.location.href = "/offres";
    }

    function backToChoice() {
        setSignupType(null);
        setError(null);
    }

    function RequiredFieldsNote() {
    return (
        <p className="text-xs text-muted-foreground">
            Les champs marqués d&apos;un{" "}
            <span aria-hidden="true" className="text-destructive">*</span>{" "}
            sont obligatoires.
        </p>
    );
}

    let establishmentBlock = (
        <p className="text-xs text-muted-foreground">
            Le nom de l&apos;entreprise, son activité et son adresse sont repris de
            l&apos;annuaire des entreprises à partir du SIRET.
        </p>
    );
    if (establishment !== null) {
        let activityLine = null;
        if (establishment.activity !== null) {
            activityLine = (
                <span className="block text-xs text-muted-foreground">
                    {establishment.activity}
                </span>
            );
        }

        let addressLine = null;
        if (establishment.address !== null) {
            addressLine = (
                <span className="block text-xs text-muted-foreground">
                    {establishment.address.label}
                </span>
            );
        }

        establishmentBlock = (
            <div
                aria-live="polite"
                className="border border-primary/40 bg-accent px-3 py-2"
            >
                <span className="block font-heading text-sm font-semibold text-primary">
                    {establishment.name}
                </span>
                {activityLine}
                {addressLine}
            </div>
        );
    }

    let submitLabel = "Se connecter";
    if (loading) {
        submitLabel = "Connexion…";
    }

    let signupLabel = "Créer mon compte";
    if (loading) {
        signupLabel = "Création…";
    }

    // Région d'annonce permanente, masquée tant qu'aucune erreur n'est levée
    // (RGAA 11.10).
    let errorClass = "sr-only";
    if (error !== null) {
        errorClass =
            "border border-destructive bg-destructive/5 px-3 py-2 text-sm text-destructive";
    }

    const errorMessage = (
        <p role="alert" aria-live="assertive" className={errorClass}>
            {error}
        </p>
    );

    return (
        <Dialog open={props.open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md gap-0 p-0">
                <DialogHeader className="border-b border-border p-6 pr-14 text-left">
                    <DialogTitle className="font-heading text-xl font-bold text-primary">
                        Accéder à votre espace
                    </DialogTitle>
                    <DialogDescription>
                        Demandeur d&apos;emploi ou employeur, un seul compte suffit.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6">
                    <Tabs value={tab} onValueChange={handleTabChange}>
                        <TabsList className="w-full">
                            <TabsTrigger value="login" className="flex-1 font-heading">
                                Connexion
                            </TabsTrigger>
                            <TabsTrigger value="signup" className="flex-1 font-heading">
                                Inscription
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <RequiredFieldsNote />
                                <Field
                                    id="login-email"
                                    label="Adresse électronique"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={function (event){
                                        setEmail(event.target.value);
                                    }}
                                />
                                <Field
                                    id="login-password"
                                    label="Mot de passe"
                                    type="password"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={function (event){
                                        setPassword(event.target.value);
                                    }}
                                />
                                {errorMessage}

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                                >
                                    {submitLabel}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup">
                            {signupType === null && ( <SignupTypeChoice onChoose={setSignupType} /> )}
                            {signupType === "individual" && (
                            <form onSubmit={handleSignup} className="flex flex-col gap-4">
                                <RequiredFieldsNote />
                                <Field
                                    id="signup-lastname"
                                    label="Nom"
                                    type="text"
                                    autoComplete="family-name"
                                    value={signupLastname}
                                    onChange={function (event) {
                                        setSignupLastname(event.target.value);
                                    }}
                                />
                                <Field
                                    id="signup-firstname"
                                    label="Prénom"
                                    type="text"
                                    autoComplete="given-name"
                                    value={signupFirstname}
                                    onChange={function (event) {
                                        setSignupFirstname(event.target.value);
                                    }}
                                />
                                <Field
                                    id="signup-email"
                                    label="Adresse électronique"
                                    type="email"
                                    autoComplete="email"
                                    value={signupEmail}
                                    onChange={function (event) {
                                        setSignupEmail(event.target.value);
                                    }}
                                />
                                <Field
                                    id="signup-password"
                                    label="Mot de passe"
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="8 caractères minimum"
                                    value={signupPassword}
                                    onChange={function (event) {
                                        setSignupPassword(event.target.value);
                                    }}
                                />

                                {errorMessage}

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={backToChoice}
                                        className="font-heading font-semibold"
                                    >
                                        Retour
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                                    >
                                        {signupLabel}
                                    </Button>
                                </div>
                            </form>
                            )}
                            {signupType === "employer" && (
                                <form onSubmit={handleEmployerSignup} className="flex flex-col gap-4">
                                    <RequiredFieldsNote />
                                    {errorMessage}
                                    <Field
                                        id="employer-lastname"
                                        label="Nom"
                                        type="text"
                                        autoComplete="family-name"
                                        value={employerLastname}
                                        onChange={function (event) {
                                            setEmployerLastname(event.target.value);
                                        }}
                                    />
                                    <Field
                                        id="employer-firstname"
                                        label="Prénom"
                                        type="text"
                                        autoComplete="given-name"
                                        value={employerFirstname}
                                        onChange={function (event) {
                                            setEmployerFirstname(event.target.value);
                                        }}
                                    />
                                    <Field
                                        id="employer-email"
                                        label="Adresse électronique professionnelle"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="prenom.nom@votre-entreprise.fr"
                                        value={employerEmail}
                                        onChange={function (event) {
                                            setEmployerEmail(event.target.value);
                                        }}
                                    />
                                    <div className="flex flex-col gap-1.5">
                                        <Label
                                            htmlFor="employer-siret"
                                            className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                                        >
                                            Numéro de SIRET
                                            <span aria-hidden="true" className="ml-0.5 text-destructive">
                                                *
                                            </span>
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="employer-siret"
                                                type="text"
                                                placeholder="14 chiffres"
                                                autoComplete="off"
                                                required
                                                value={employerSiret}
                                                onChange={handleSiretChange}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={checkingSiret}
                                                onClick={verifySiret}
                                                className="shrink-0 border-primary font-heading font-semibold text-primary"
                                            >
                                                {checkingSiret ? "Vérification…" : "Vérifier"}
                                            </Button>
                                        </div>
                                        {establishmentBlock}
                                    </div>
                                    <Field
                                        id="employer-password"
                                        label="Mot de passe"
                                        type="password"
                                        autoComplete="new-password"
                                        value={employerPassword}
                                        onChange={function (event) {
                                            setEmployerPassword(event.target.value);
                                        }}
                                    />
                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={backToChoice}
                                            className="font-heading font-semibold"
                                        >
                                            Retour
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                                        >
                                            {signupLabel}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
