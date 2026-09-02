import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] items-center justify-center bg-wash px-6 py-20">
            <div className="flex max-w-lg flex-col items-start gap-5 border-l-2 border-primary bg-background p-10">
                <p className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Erreur 404
                </p>
                <h1 className="font-heading text-3xl font-bold leading-tight text-primary">
                    Cette page n&apos;existe pas
                </h1>
                <p className="text-muted-foreground">
                    L&apos;adresse demandée est introuvable. Elle a pu être déplacée, ou
                    l&apos;offre correspondante a été retirée par son employeur.
                </p>
                <Button
                    asChild
                    className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                >
                    <Link href="/">Revenir à la carte des offres</Link>
                </Button>
            </div>
        </div>
    );
}
