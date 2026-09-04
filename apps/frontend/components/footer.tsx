import Link from "next/link";

const sections = [
    {
        title: "Données personnelles",
    },
    {
        title: "Accessibilité",
    },
    {
        title: "Cartographie",
    },
];

type Props = {
    compact?: boolean;
};

export default function Footer(props: Props) {
    if (props.compact === true) {
        return (
            <footer
                id="about"
                className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-1 border-t-2 border-primary bg-background px-6 py-2.5"
            >
                <span className="font-heading text-sm font-bold tracking-tight text-primary">
                    ChômageGo
                </span>
                <Link
                    href="/cgu"
                    className="font-heading text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                    Conditions générales d&apos;utilisation
                </Link>
                <p className="font-heading text-[0.7rem] uppercase tracking-[0.1em] text-muted-foreground">
                    {sections
                        .map(function (section) {
                            return section.title;
                        })
                        .join(" · ")}
                </p>
            </footer>
        );
    }

    return (
        <footer
            id="about"
            className="border-t-2 border-primary bg-background px-8 py-10"
        >
            <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:justify-between">
                <div className="flex flex-col gap-3">
                    <span className="font-heading text-base font-bold tracking-tight text-primary">
                        ChômageGo
                    </span>
                    <Link
                        href="/cgu"
                        className="font-heading text-sm font-medium text-primary underline-offset-4 hover:underline"
                    >
                        Conditions générales d&apos;utilisation
                    </Link>
                </div>

                {sections.map(function (section) {
                    return (
                        <div key={section.title} className="flex flex-col gap-2">
                            <h2 className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-primary">
                                {section.title}
                            </h2>
                        </div>
                    );
                })}
            </div>
        </footer>
    );
}
