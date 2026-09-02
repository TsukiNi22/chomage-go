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

export default function Footer() {
    return (
        <footer
            id="about"
            className="border-t-2 border-primary bg-background px-8 py-10"
        >
            <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:justify-between">
                <div className="flex flex-col gap-3">
                    <span className="font-heading text-base font-bold tracking-tight text-primary">
                        GéoEmploi
                    </span>
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
