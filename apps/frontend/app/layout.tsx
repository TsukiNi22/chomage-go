import type { Metadata } from "next";
import { Archivo, Spectral } from "next/font/google";
import "./globals.css";

const titre = Archivo({
    subsets: ["latin"],
    variable: "--police-titre",
    display: "swap",
});

const corps = Spectral({
    subsets: ["latin"],
    weight: ["300", "400", "600", "700"],
    variable: "--police-corps",
    display: "swap",
});

export const metadata: Metadata = {
    title: "GéoEmploi",
    description:
        "Trouvez les offres d'emploi autour de vous sur une carte. Ministère du Job et Bonheur.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr" className={`${titre.variable} ${corps.variable}`}>
            <body>{children}</body>
        </html>
    );
}
