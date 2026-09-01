"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
    open: boolean;
    onClose: () => void;
};

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

export default function AuthModal(props: Props) {
    const [tab, setTab] = useState("login");

    function handleOpenChange(open: boolean) {
        if (!open) {
            props.onClose();
        }
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
    }

    return (
        <Dialog open={props.open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md gap-0 p-0">

                <div className="p-6">
                    <Tabs value={tab} onValueChange={setTab}>
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
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
