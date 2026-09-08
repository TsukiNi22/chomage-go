import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import CompanyEditor from "@/components/company-editor";
import CompanyReportButton from "@/components/company-report-button";
import { formatSiret } from "@/lib/siret";
import { employeeRangeLabel, fetchCompany, toJob } from "@/lib/api";

const CONTRACTS = ["CDI", "CDD", "Alternance", "Stage", "Freelance"];

type Props = {
    params: Promise<{ id: string }>;
};

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

    let moderationBanner = null;
    if (company.suspendedAt || company.bannedAt) {
        let title = "Entreprise suspendue";
        let body =
            "Cette fiche et les offres de l'entreprise sont retirées de la diffusion publique tant que la suspension est en vigueur.";
        if (company.bannedAt) {
            title = "Entreprise bannie";
            body =
                "Cette fiche et les offres de l'entreprise sont définitivement retirées de la diffusion publique.";
        }

        let reason = "Aucun motif n'a été précisé par la modération.";
        if (company.moderationReason) {
            reason = company.moderationReason;
        }

        moderationBanner = (
            <div className="mt-6 border-l-2 border-destructive bg-destructive/5 p-5">
                <h2 className="font-heading text-base font-bold text-destructive">
                    {title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                <p className="mt-3 text-sm">
                    <span className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        Motif —{" "}
                    </span>
                    {reason}
                </p>
            </div>
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

                {moderationBanner}

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

                <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                    <CompanyReportButton
                        companyId={company.id}
                        companyName={company.name}
                    />
                </div>

                <p className="mt-6 text-sm text-muted-foreground">
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
