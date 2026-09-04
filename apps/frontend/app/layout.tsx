import type { Metadata } from "next";
import localFont from "next/font/local";
import { Spectral } from "next/font/google";
import AppFrame from "@/components/app-frame";
import CguGate from "@/components/cgu-gate";
import CguProvider from "@/components/cgu-provider";
import { ApplicationsProvider } from "@/lib/applications-context";
import "./globals.css";

const heading = localFont({
    src: [
        { path: "./fonts/Marianne-Regular.woff2", weight: "400", style: "normal" },
        { path: "./fonts/Marianne-Medium.woff2", weight: "500", style: "normal" },
        { path: "./fonts/Marianne-Bold.woff2", weight: "700", style: "normal" },
    ],
    variable: "--heading-font",
    display: "swap",
});

const body = Spectral({
    subsets: ["latin"],
    weight: ["300", "400", "600", "700"],
    variable: "--body-font",
    display: "swap",
});

export const metadata: Metadata = {
    title: "ChômageGo",
    description:
        "Trouvez les offres d'emploi autour de vous sur une carte. Ministère du Job et Bonheur.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr" className={`${heading.variable} ${body.variable}`}>
            <body>
                <a
                    href="#jobs"
                    className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-primary focus:bg-background focus:px-4 focus:py-2 focus:font-heading focus:text-sm focus:text-primary"
                >
                    Aller au contenu principal
                </a>
                <CguProvider>
                    <ApplicationsProvider>
                        <AppFrame>{children}</AppFrame>
                    </ApplicationsProvider>
                    <CguGate />
                </CguProvider>
            </body>
        </html>
    );
}
