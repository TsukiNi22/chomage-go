import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mes offres publiées",
    description:
        "Consultez, publiez et retirez les offres d'emploi de votre établissement.",
};

export default function OffresLayout(props: { children: React.ReactNode }) {
    return props.children;
}
