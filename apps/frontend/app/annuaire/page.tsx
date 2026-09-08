import type { Metadata } from "next";
import DirectoryTable from "@/components/directory-table";
import { fetchCompanies, fetchJobs } from "@/lib/api";
import { toCompanyPin } from "@/lib/companies";

export const metadata: Metadata = {
    title: "Annuaire",
    description:
        "Toutes les offres et toutes les entreprises en tableau, filtrables par nom, localisation, domaine, compétence ou nombre d'offres.",
};

export default async function DirectoryPage() {
    const [jobs, companies] = await Promise.all([fetchJobs(), fetchCompanies()]);

    return (
        <DirectoryTable jobs={jobs} companies={companies.map(toCompanyPin)} />
    );
}
