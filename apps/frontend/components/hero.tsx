export default function Hero() {
    return (
        <section className="border-b border-border bg-wash px-6 py-14">
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
                <span className="border border-primary/30 bg-background px-4 py-1.5 font-heading text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-primary">
                    Service public de l&apos;emploi géolocalisé
                </span>
                <h1 className="font-heading text-4xl font-bold leading-[1.1] text-primary sm:text-5xl">
                    Trouvez le job idéal près de chez vous
                </h1>
                <p className="max-w-xl text-lg text-muted-foreground">
                    Visualisez les offres d&apos;emploi autour de vous sur une carte
                    interactive fondée sur IGN. Moins de transport, plus de vie.
                </p>
            </div>
        </section>
    );
}
