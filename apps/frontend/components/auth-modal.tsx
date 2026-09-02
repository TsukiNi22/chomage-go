"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, User } from "lucide-react";

type Props = {
    open: boolean;
    onClose: () => void;
};

type SignupType = "individual" | "employer" | null;

function Field(props: {
    id: string;
    label: string;
    type: string;
    placeholder: string;
    autoComplete: string;
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
                placeholder={props.placeholder}
                autoComplete={props.autoComplete}
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

    function handleOpenChange(open: boolean) {
        if (!open) {
            props.onClose();
        }
    }

    function handleTabChange(value: string) {
        setTab(value);
        setSignupType(null);
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
    }

    function backToChoice() {
        setSignupType(null);
    }

    return (
        <Dialog open={props.open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md gap-0 p-0">

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
                                />
                                <Field
                                    id="login-password"
                                    label="Mot de passe"
                                    type="password"
                                    autoComplete="current-password"
                                />
                                <Button
                                    type="submit"
                                    className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                                >
                                    Se connecter
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup">
                            {signupType === null && ( <SignupTypeChoice onChoose={setSignupType} /> )}
                            {signupType === "individual" && (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <Field
                                    id="signup-name"
                                    label="Nom et prénom"
                                    type="text"
                                    autoComplete="name"
                                />
                                <Field
                                    id="signup-email"
                                    label="Adresse électronique"
                                    type="email"
                                    autoComplete="email"
                                />
                                <Field
                                    id="signup-password"
                                    label="Mot de passe"
                                    type="password"
                                    autoComplete="new-password"
                                />
                                <Button
                                    type="submit"
                                    className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                                >
                                    Créer mon compte
                                </Button>
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
