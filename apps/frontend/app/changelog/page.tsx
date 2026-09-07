import type { Metadata } from "next";
import data from "@/lib/changelog.json";

export const metadata: Metadata = {
    title: "Journal des modifications",
    description:
        "Historique des évolutions du démonstrateur, généré à partir de l'historique du dépôt.",
};

type Entry = {
    hash: string;
    date: string;
    author: string;
    type: string;
    scope: string | null;
    title: string;
};

type Day = {
    date: string;
    entries: Entry[];
};

const TYPE_CLASSES: Record<string, string> = {
    Nouveauté: "border-primary text-primary",
    Correction: "border-action-text text-action-text",
    Documentation: "border-border text-muted-foreground",
    Maintenance: "border-border text-muted-foreground",
};

function typeClass(type: string) {
    const found = TYPE_CLASSES[type];
    if (found === undefined) {
        return "border-border text-muted-foreground";
    }
    return found;
}

function formatDay(value: string) {
    const date = new Date(value);
    return date.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export default function ChangelogPage() {
    const days = data.days as Day[];

    let total = 0;
    for (const day of days) {
        total = total + day.entries.length;
    }

    return (
        <div className="bg-wash px-6 py-14">
            <div className="mx-auto max-w-3xl">
                <p className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Journal des modifications
                </p>

                <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-primary">
                    Ce qui a changé
                </h1>

                <p className="mt-3 text-muted-foreground">
                    {total} modifications sur {days.length} jours de développement.
                    Cette page est générée à partir de l&apos;historique du dépôt : elle
                    reflète l&apos;état réel du code, pas une communication rédigée après
                    coup.
                </p>

                <div className="mt-10 flex flex-col gap-10">
                    {days.map(function (day) {
                        return (
                            <section
                                key={day.date}
                                className="border-t border-border pt-6"
                            >
                                <h2 className="font-heading text-lg font-bold text-primary">
                                    {formatDay(day.date)}
                                </h2>

                                <ul className="mt-4 flex flex-col gap-3">
                                    {day.entries.map(function (entry) {
                                        let scope = null;
                                        if (entry.scope !== null) {
                                            scope = (
                                                <span className="font-mono text-xs text-muted-foreground">
                                                    {entry.scope}
                                                </span>
                                            );
                                        }

                                        return (
                                            <li
                                                key={entry.hash}
                                                className="flex flex-col gap-1 border-l-2 border-border pl-4"
                                            >
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className={
                                                            "border px-2 py-0.5 font-heading text-[0.6rem] font-semibold uppercase tracking-[0.1em] " +
                                                            typeClass(entry.type)
                                                        }
                                                    >
                                                        {entry.type}
                                                    </span>
                                                    {scope}
                                                </div>

                                                <p className="text-sm leading-relaxed text-foreground">
                                                    {entry.title}
                                                </p>

                                                <p className="font-mono text-xs text-muted-foreground">
                                                    {entry.hash} · {entry.author}
                                                </p>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </section>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
