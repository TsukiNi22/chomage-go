import Link from "next/link";
import Wordmark from "@/components/wordmark";
import { DEMO_DISCLAIMER } from "@/lib/legal-notice";

const legalLinks = [
    { label: "Conditions générales d'utilisation", href: "/cgu" },
    { label: "Fiche de registre", href: "/registre" },
    { label: "Risques", href: "/risques" },
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
                <Wordmark compact />

                {legalLinks.map(function (link) {
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="font-heading text-xs font-medium text-primary underline-offset-4 hover:underline"
                        >
                            {link.label}
                        </Link>
                    );
                })}

                <p className="w-full font-heading text-[0.7rem] font-semibold text-action-text">
                    {DEMO_DISCLAIMER}
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
                <Wordmark compact />

                <nav aria-label="Informations légales">
                    <ul className="flex flex-col gap-2 lg:flex-row lg:gap-8">
                        {legalLinks.map(function (link) {
                            return (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="font-heading text-sm font-medium text-primary underline-offset-4 hover:underline"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>

            <p className="mx-auto mt-8 max-w-6xl border-t border-border pt-6 font-heading text-sm font-semibold text-action-text">
                {DEMO_DISCLAIMER}
            </p>
        </footer>
    );
}
