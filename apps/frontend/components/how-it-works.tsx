const steps = [
    {
        number: "1",
        title: "Ouvrez la carte",
        text: "Aucun compte n'est nécessaire pour consulter les offres. La carte s'ouvre sur toute la France.",
    },
    {
        number: "2",
        title: "Repérez ce qui est près de vous",
        text: "Activez la géolocalisation et les offres se trient par distance. Votre position reste sur votre appareil.",
    },
    {
        number: "3",
        title: "Candidatez",
        text: "Une fiche, un bouton. Votre profil est transmis directement à l'employeur.",
    },
];

export default function HowItWorks() {
    return (
        <section className="border-b border-border bg-wash px-6 py-14">
            <div className="mx-auto max-w-5xl">
                <h2 className="font-heading text-2xl font-bold text-primary">
                    Comment ça marche
                </h2>

                <div className="mt-8 grid gap-8 lg:grid-cols-3">
                    {steps.map(function (step) {
                        return (
                            <div
                                key={step.number}
                                className="flex flex-col gap-3 border-t-2 border-primary pt-5"
                            >
                                <span className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    Étape {step.number}
                                </span>
                                <h3 className="font-heading text-lg font-bold text-primary">
                                    {step.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {step.text}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
