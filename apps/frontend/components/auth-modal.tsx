"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";

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
            </Label>
            <Input
                id={props.id}
                type={props.type}
                autoComplete={props.autoComplete}
                placeholder={props.placeholder}
                value={props.value}
                onChange={props.onChange}
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

    function backToChoice() {
        setSignupType(null);
        setError(null);
    }

    let submitLabel = "Se connecter";
    if (loading) {
        submitLabel = "Connexion…";
    }

    let signupLabel = "Créer mon compte";
    if (loading) {
        signupLabel = "Création…";
    }

    let errorMessage = null;
    if (error !== null) {
        errorMessage = (
            <p
                aria-live="polite"
                className="border border-destructive bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
                {error}
            </p>
        );
    }

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
                                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                    <Field
                                        id="employer-lastname"
                                        label="Nom"
                                        type="text"
                                        autoComplete="family-name"
                                    />
                                    <Field
                                        id="employer-firstname"
                                        label="Prénom"
                                        type="text"
                                        autoComplete="given-name"
                                    />
                                    <Field
                                        id="employer-email"
                                        label="Adresse électronique"
                                        type="email"
                                        autoComplete="email"
                                    />
                                    <Field
                                        id="employer-siret"
                                        label="Numéro de SIRET"
                                        type="text"
                                        placeholder="14 chiffres"
                                        autoComplete="off"
                                    />
                                    <Field
                                        id="employer-password"
                                        label="Mot de passe"
                                        type="password"
                                        autoComplete="new-password"
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
                                            className="flex-1 bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                                        >
                                            Créer mon compte employeur
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
