import type { Metadata } from "next";
import CompanyMapExplorer from "@/components/company-map-explorer";
import { fetchCompanies } from "@/lib/api";
import { toCompanyPin } from "@/lib/companies";

export const metadata: Metadata = {
    title: "Carte des entreprises",
    description:
        "Situez les entreprises qui recrutent, leur activité, leur effectif et le nombre d'offres en ligne.",
};

export default async function CompaniesPage() {
    const companies = await fetchCompanies();

    return <CompanyMapExplorer companies={companies.map(toCompanyPin)} />;
}
