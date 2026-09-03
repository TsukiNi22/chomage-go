import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
    return (
        <section className="border-b border-border bg-wash px-6 py-16">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
                <span className="border border-primary/30 bg-background px-4 py-1.5 font-heading text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-primary">
                    Service public de l&apos;emploi géolocalisé
                </span>

                <h1 className="font-heading text-4xl font-bold leading-[1.1] text-primary sm:text-5xl">
                    Trouvez le job idéal près de chez vous
                </h1>

                <p className="max-w-xl text-lg text-muted-foreground">
                    Visualisez les offres d&apos;emploi autour de vous sur une carte
                    interactive fondée sur les données de l&apos;IGN. Moins de transport,
                    plus de vie.
                </p>

                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                    <Button
                        asChild
                        size="lg"
                        className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                    >
                        <Link href="/carte">
                            <MapPin className="h-4 w-4" />
                            Explorer la carte
                        </Link>
                    </Button>
                    <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="border-primary font-heading font-semibold text-primary"
                    >
                        <Link href="#how">Comment ça marche</Link>
                    </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                    Consultation libre, sans compte et sans frais.
                </p>
            </div>
        </section>
    );
}
