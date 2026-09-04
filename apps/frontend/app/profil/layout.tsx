import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mon profil",
    description:
        "Renseignez les informations transmises aux employeurs lorsque vous candidatez.",
};

export default function ProfilLayout(props: { children: React.ReactNode }) {
    return props.children;
}
