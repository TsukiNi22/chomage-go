"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useCgu } from "@/components/cgu-provider";
import { CGU_DATE, CGU_VERSION } from "@/lib/cgu";

const EXEMPT_PATHS = ["/cgu", "/registre", "/risques"];

export default function CguGate() {
    const pathname = usePathname();
    const cgu = useCgu();
    const [acceptedCgu, setAcceptedCgu] = useState(false);
    const [acceptedData, setAcceptedData] = useState(false);

    let open = false;
    if (cgu.ready && !cgu.accepted && !EXEMPT_PATHS.includes(pathname)) {
        open = true;
    }

    function blockClose(event: Event) {
        event.preventDefault();
    }

    let title = "Conditions générales d'utilisation";
    let intro =
        "Avant d'utiliser ChômageGo, vous devez prendre connaissance des conditions générales d'utilisation et les accepter.";

    if (cgu.previousVersion !== null) {
        title = "Les conditions générales ont changé";
        intro =
            "Une nouvelle version des conditions générales d'utilisation est entrée en vigueur. Vous devez l'accepter pour continuer.";
    }

    let versionLine = "Version " + CGU_VERSION + " du " + CGU_DATE;
    if (cgu.previousVersion !== null) {
        versionLine =
            "Version " +
            CGU_VERSION +
            " du " +
            CGU_DATE +
            " · vous aviez accepté la version " +
            cgu.previousVersion;
    }

    return (
        <Dialog open={open}>
            <DialogContent
                showCloseButton={false}
                onEscapeKeyDown={blockClose}
                onInteractOutside={blockClose}
                onPointerDownOutside={blockClose}
                className="max-w-lg gap-0 p-0"
            >
                <DialogHeader className="border-b border-border p-6 text-left">
                    <p className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        {versionLine}
                    </p>
                    <DialogTitle className="mt-2 font-heading text-xl font-bold text-primary">
                        {title}
                    </DialogTitle>
                    <DialogDescription>{intro}</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 p-6 text-sm leading-relaxed text-muted-foreground">
                    <p>
                        La consultation des offres sur la carte reste libre, sans compte
                        ni authentification. La création d&apos;un compte est nécessaire
                        uniquement pour candidater ou publier une offre.
                    </p>
                    <p>
                        Les données collectées sont strictement nécessaires au service. La
                        localisation précise de votre appareil n&apos;est jamais
                        enregistrée sur nos serveurs, et son activation fait l&apos;objet
                        d&apos;un consentement distinct, que vous pouvez retirer à tout
                        moment.
                    </p>
                    <p className="flex flex-col gap-1">
                        <Link
                            href="/cgu"
                            className="font-heading font-semibold text-primary underline underline-offset-4"
                        >
                            Lire les conditions générales dans leur intégralité
                        </Link>
                        <Link
                            href="/registre"
                            className="font-heading font-semibold text-primary underline underline-offset-4"
                        >
                            Consulter la fiche de registre des données collectées
                        </Link>
                    </p>

                    <div className="flex flex-col gap-3 border-t border-border pt-4">
                        <label
                            htmlFor="cgu-accept"
                            className="flex cursor-pointer items-start gap-3"
                        >
                            <input
                                id="cgu-accept"
                                type="checkbox"
                                checked={acceptedCgu}
                                onChange={function (event) {
                                    setAcceptedCgu(event.target.checked);
                                }}
                                className="mt-0.5 size-4 shrink-0 accent-[var(--action)]"
                            />
                            <span className="text-sm text-foreground">
                                J&apos;ai lu et j&apos;accepte les conditions générales
                                d&apos;utilisation.
                            </span>
                        </label>

                        <label
                            htmlFor="data-accept"
                            className="flex cursor-pointer items-start gap-3"
                        >
                            <input
                                id="data-accept"
                                type="checkbox"
                                checked={acceptedData}
                                onChange={function (event) {
                                    setAcceptedData(event.target.checked);
                                }}
                                className="mt-0.5 size-4 shrink-0 accent-[var(--action)]"
                            />
                            <span className="text-sm text-foreground">
                                J&apos;ai pris connaissance des données utilisées et
                                stockées.
                            </span>
                        </label>
                    </div>
                </div>

                <DialogFooter className="border-t border-border bg-muted p-6">
                    <Button
                        type="button"
                        onClick={cgu.accept}
                        disabled={!acceptedCgu || !acceptedData}
                        className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-action"
                    >
                        J&apos;accepte les conditions générales
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
