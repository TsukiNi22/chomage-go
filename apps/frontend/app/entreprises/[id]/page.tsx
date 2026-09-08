import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import CompanyEditor from "@/components/company-editor";
import { formatSiret } from "@/lib/siret";
import { fetchCompany, toJob } from "@/lib/api";

const EMPLOYEE_RANGES = [
    "0 à 10 salariés",
    "11 à 100 salariés",
    "101 à 500 salariés",
    "Plus de 500 salariés",
];

const CONTRACTS = ["CDI", "CDD", "Alternance", "Stage", "Freelance"];

type Props = {
    params: Promise<{ id: string }>;
};

function employeeRangeLabel(range: number): string {
    const label = EMPLOYEE_RANGES[range];
    if (label === undefined) {
        return "Effectif non renseigné";
    }
    return label;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const { id } = await props.params;
    const company = await fetchCompany(Number(id));

    if (company === null) {
        return { title: "Entreprise introuvable" };
    }

    return {
        title: company.name,
        description:
            "Fiche de " +
            company.name +
            " : activité, effectif, localisation et offres publiées.",
    };
}

function Field(props: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1 border-l-2 border-primary pl-4">
            <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {props.label}
            </span>
            <span className="text-sm">{props.children}</span>
        </div>
    );
}

export default async function CompanyPage(props: Props) {
    const { id } = await props.params;
    const companyId = Number(id);

    if (isNaN(companyId)) {
        notFound();
    }

    const company = await fetchCompany(companyId);

    if (company === null) {
        notFound();
    }

    const jobs = (company.jobs || []).map(toJob);

    let addressValue = "Adresse non renseignée";
    if (company.address && company.address.label) {
        addressValue = company.address.label;
    }

    let activityValue = "Activité non renseignée";
    if (company.activity) {
        activityValue = company.activity;
    }

    let legalNameBlock = null;
    if (company.legalName !== null && company.legalName !== company.name) {
        legalNameBlock = (
            <Field label="Dénomination légale">{company.legalName}</Field>
        );
    }

    let linkBlock = null;
    if (company.link) {
        linkBlock = (
            <Field label="Site internet">
                <a
                    href={company.link}
                    rel="noreferrer noopener"
                    target="_blank"
                    className="font-heading font-semibold text-primary underline underline-offset-4 hover:no-underline"
                >
                    {company.link}
                </a>
            </Field>
        );
    }

    let descriptionBlock = (
        <p className="mt-6 text-sm italic text-muted-foreground">
            Cette entreprise n&apos;a pas encore rédigé de présentation.
        </p>
    );
    if (company.description) {
        descriptionBlock = (
            <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {company.description}
            </p>
        );
    }

    let jobsBlock = (
        <p className="mt-4 text-sm text-muted-foreground">
            Aucune offre en ligne pour cette entreprise.
        </p>
    );
    if (jobs.length > 0) {
        jobsBlock = (
            <ul className="mt-4 flex flex-col gap-3">
                {jobs.map(function (job) {
                    let contract = CONTRACTS[0];
                    if (job.contract) {
                        contract = job.contract;
                    }

                    let place = job.city;
                    if (job.postalCode !== "") {
                        place = job.city + " (" + job.postalCode + ")";
                    }

                    return (
                        <li
                            key={job.id}
                            className="flex flex-wrap items-center justify-between gap-3 border border-border bg-background px-5 py-4"
                        >
                            <div>
                                <p className="font-heading text-base font-semibold text-primary">
                                    {job.title}
                                </p>
                                <p className="text-sm text-muted-foreground">{place}</p>
                            </div>
                            <Badge variant="outline" className="font-heading">
                                {contract}
                            </Badge>
                        </li>
                    );
                })}
            </ul>
        );
    }

    return (
        <div className="bg-wash px-6 py-14">
            <div className="mx-auto max-w-3xl">
                <p className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Fiche entreprise
                </p>

                <h1 className="mt-3 font-heading text-3xl font-bold leading-tight text-primary">
                    {company.name}
                </h1>

                {descriptionBlock}

                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                    <Field label="Numéro de SIRET">{formatSiret(company.siret)}</Field>
                    {legalNameBlock}
                    <Field label="Activité principale">{activityValue}</Field>
                    <Field label="Effectif">
                        {employeeRangeLabel(company.employeeRange)}
                    </Field>
                    <Field label="Adresse">{addressValue}</Field>
                    {linkBlock}
                </div>

                <section className="mt-12">
                    <h2 className="font-heading text-lg font-bold text-primary">
                        Offres publiées ({jobs.length})
                    </h2>
                    {jobsBlock}
                </section>

                <CompanyEditor
                    companyId={company.id}
                    description={company.description || ""}
                    link={company.link || ""}
                />

                <p className="mt-10 text-sm text-muted-foreground">
                    <Link
                        href="/carte"
                        className="font-heading font-semibold text-primary underline underline-offset-4 hover:no-underline"
                    >
                        Retour à la carte des offres
                    </Link>
                </p>
            </div>
        </div>
    );
}
