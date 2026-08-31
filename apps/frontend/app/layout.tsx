import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GeoEmploi",
  description: "Plateforme de recherche d'emploi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
