import { jobs } from "@/lib/jobs";

export default function KeyFigures() {
    const cities: string[] = [];
    const sectors: string[] = [];

    jobs.forEach(function (job) {
        if (!cities.includes(job.city)) {
            cities.push(job.city);
        }
        if (!sectors.includes(job.sector)) {
            sectors.push(job.sector);
        }
    });

    const figures = [
        { value: jobs.length.toString(), label: "offres publiées" },
        { value: cities.length.toString(), label: "communes couvertes" },
        { value: sectors.length.toString(), label: "secteurs d'activité" },
        { value: "0 €", label: "pour les candidats" },
    ];

    return (
        <section className="border-b border-border bg-background px-6 py-12">
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 lg:grid-cols-4">
                {figures.map(function (figure) {
                    return (
                        <div
                            key={figure.label}
                            className="flex flex-col items-center gap-1 text-center"
                        >
                            <span className="font-heading text-4xl font-bold tabular-nums text-primary">
                                {figure.value}
                            </span>
                            <span className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                {figure.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
