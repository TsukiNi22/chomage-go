"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type Props = {
    error: Error & { digest?: string };
    retry: () => void;
};

export default function ErrorPage(props: Props) {
    const error = props.error;

    useEffect(
        function () {
            console.error(error);
        },
        [error],
    );

    let digestLine = null;
    if (error.digest !== undefined) {
        digestLine = (
            <p className="font-heading text-xs text-muted-foreground">
                Référence de l&apos;incident : {error.digest}
            </p>
        );
    }

    return (
        <div className="flex min-h-[60vh] items-center justify-center bg-wash px-6 py-20">
            <div className="flex max-w-lg flex-col items-start gap-5 border-l-2 border-destructive bg-background p-10">
                <p className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Erreur 500
                </p>
                <h1 className="font-heading text-3xl font-bold leading-tight text-primary">
                    Le service est momentanément indisponible
                </h1>
                <p className="text-muted-foreground">
                    Une erreur technique empêche l&apos;affichage des offres. Vos données
                    n&apos;ont pas été affectées. Vous pouvez relancer le chargement.
                </p>
                {digestLine}
                <Button
                    type="button"
                    onClick={props.retry}
                    className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                >
                    Réessayer
                </Button>
            </div>
        </div>
    );
}
