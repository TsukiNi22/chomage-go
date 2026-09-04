import type { Metadata } from "next";
import MapExplorer from "@/components/map-explorer";

export const metadata: Metadata = {
    title: "Carte des offres",
    description:
        "Explorez les offres d'emploi sur la carte, filtrez par contrat et trouvez celles autour de vous.",
};

export default function CartePage() {
    return <MapExplorer />;
}
