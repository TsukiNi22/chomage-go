"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { employeeRangeLabel } from "@/lib/api";
import type { CompanyPin } from "@/lib/companies";
import { normalize } from "@/lib/geocoding";
import type { Job } from "@/lib/jobs";
import { cn } from "@/lib/utils";

type Props = {
    jobs: Job[];
    companies: CompanyPin[];
};

const ANY = "tous";

type JobSort = "title" | "company" | "city" | "salary" | "date";
type CompanySort = "name" | "city" | "jobs" | "employees";

function formatSalary(job: Job): string {
    const low = job.salaryMin.toLocaleString("fr-FR");
    if (job.salaryMax === null) {
        return "à partir de " + low + " €";
    }
    return low + " – " + job.salaryMax.toLocaleString("fr-FR") + " €";
}

function formatDate(value: string): string {
    if (value === "") {
        return "—";
    }
    return new Date(value).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function SortButton(props: {
    label: string;
    active: boolean;
    ascending: boolean;
    onClick: () => void;
}) {
    let icon = null;
    if (props.active) {
        icon = props.ascending ? (
            <ArrowUp className="ml-1 inline h-3 w-3" />
        ) : (
            <ArrowDown className="ml-1 inline h-3 w-3" />
        );
    }

    return (
        <button
            type="button"
            onClick={props.onClick}
            className="font-heading font-semibold text-primary underline-offset-4 hover:underline"
        >
            {props.label}
            {icon}
        </button>
    );
}

export default function DirectoryTable(props: Props) {
    const [mode, setMode] = useState("offres");
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    const [domain, setDomain] = useState(ANY);
    const [skill, setSkill] = useState("");
    const [minJobs, setMinJobs] = useState("");

    const [jobSort, setJobSort] = useState<JobSort>("date");
    const [jobAscending, setJobAscending] = useState(false);
    const [companySort, setCompanySort] = useState<CompanySort>("jobs");
    const [companyAscending, setCompanyAscending] = useState(false);

    const sectors: string[] = [];
    props.jobs.forEach(function (job) {
        if (job.sector !== "" && !sectors.includes(job.sector)) {
            sectors.push(job.sector);
        }
    });
    sectors.sort();

    const activities: string[] = [];
    props.companies.forEach(function (company) {
        if (company.activity !== "" && !activities.includes(company.activity)) {
            activities.push(company.activity);
        }
    });
    activities.sort();

    function matchesLocation(city: string, postalCode: string): boolean {
        if (location.trim() === "") {
            return true;
        }
        return normalize(city + " " + postalCode).includes(normalize(location));
    }

    const filteredJobs = props.jobs.filter(function (job) {
        if (name.trim() !== "") {
            const target = normalize(job.title + " " + job.company);
            if (!target.includes(normalize(name))) {
                return false;
            }
        }

        if (!matchesLocation(job.city, job.postalCode)) {
            return false;
        }

        if (domain !== ANY && job.sector !== domain) {
            return false;
        }

        if (skill.trim() !== "") {
            const wanted = normalize(skill);
            const found = job.skills.some(function (item) {
                return normalize(item).includes(wanted);
            });
            if (!found) {
                return false;
            }
        }

        return true;
    });

    const filteredCompanies = props.companies.filter(function (company) {
        if (name.trim() !== "") {
            const target = normalize(company.name + " " + company.siret);
            if (!target.includes(normalize(name))) {
                return false;
            }
        }

        if (!matchesLocation(company.city, company.postalCode)) {
            return false;
        }

        if (domain !== ANY && company.activity !== domain) {
            return false;
        }

        if (minJobs.trim() !== "") {
            const wanted = Number(minJobs);
            if (!isNaN(wanted) && company.jobsCount < wanted) {
                return false;
            }
        }

        return true;
    });

    const sortedJobs = [...filteredJobs].sort(function (a, b) {
        let result = 0;
        if (jobSort === "title") {
            result = a.title.localeCompare(b.title, "fr");
        } else if (jobSort === "company") {
            result = a.company.localeCompare(b.company, "fr");
        } else if (jobSort === "city") {
            result = a.city.localeCompare(b.city, "fr");
        } else if (jobSort === "salary") {
            result = a.salaryMin - b.salaryMin;
        } else {
            result = a.publishedAt.localeCompare(b.publishedAt);
        }

        if (jobAscending) {
            return result;
        }
        return -result;
    });

    const sortedCompanies = [...filteredCompanies].sort(function (a, b) {
        let result = 0;
        if (companySort === "name") {
            result = a.name.localeCompare(b.name, "fr");
        } else if (companySort === "city") {
            result = a.city.localeCompare(b.city, "fr");
        } else if (companySort === "employees") {
            result = a.employeeRange - b.employeeRange;
        } else {
            result = a.jobsCount - b.jobsCount;
        }

        if (companyAscending) {
            return result;
        }
        return -result;
    });

    function toggleJobSort(column: JobSort) {
        if (jobSort === column) {
            setJobAscending(!jobAscending);
            return;
        }
        setJobSort(column);
        setJobAscending(true);
    }

    function toggleCompanySort(column: CompanySort) {
        if (companySort === column) {
            setCompanyAscending(!companyAscending);
            return;
        }
        setCompanySort(column);
        setCompanyAscending(true);
    }

    function resetFilters() {
        setName("");
        setLocation("");
        setDomain(ANY);
        setSkill("");
        setMinJobs("");
    }

    function handleModeChange(value: string) {
        setMode(value);
        // Les listes de domaines diffèrent d'un onglet à l'autre.
        setDomain(ANY);
    }

    const isJobs = mode === "offres";
    const domainOptions = isJobs ? sectors : activities;
    const total = isJobs ? sortedJobs.length : sortedCompanies.length;

    let table = (
        <Table>
            <caption className="sr-only">
                Offres d&apos;emploi publiées : intitulé, entreprise, secteur, type de
                contrat, télétravail, commune, rémunération, compétences et date de
                publication.
            </caption>

            <TableHeader>
                <TableRow>
                    <TableHead scope="col">
                        <SortButton
                            label="Intitulé"
                            active={jobSort === "title"}
                            ascending={jobAscending}
                            onClick={function () {
                                toggleJobSort("title");
                            }}
                        />
                    </TableHead>
                    <TableHead scope="col">
                        <SortButton
                            label="Entreprise"
                            active={jobSort === "company"}
                            ascending={jobAscending}
                            onClick={function () {
                                toggleJobSort("company");
                            }}
                        />
                    </TableHead>
                    <TableHead scope="col">Secteur</TableHead>
                    <TableHead scope="col">Contrat</TableHead>
                    <TableHead scope="col">Télétravail</TableHead>
                    <TableHead scope="col">
                        <SortButton
                            label="Commune"
                            active={jobSort === "city"}
                            ascending={jobAscending}
                            onClick={function () {
                                toggleJobSort("city");
                            }}
                        />
                    </TableHead>
                    <TableHead scope="col" className="text-right">
                        <SortButton
                            label="Rémunération"
                            active={jobSort === "salary"}
                            ascending={jobAscending}
                            onClick={function () {
                                toggleJobSort("salary");
                            }}
                        />
                    </TableHead>
                    <TableHead scope="col">Compétences</TableHead>
                    <TableHead scope="col" className="text-right">
                        <SortButton
                            label="Publiée le"
                            active={jobSort === "date"}
                            ascending={jobAscending}
                            onClick={function () {
                                toggleJobSort("date");
                            }}
                        />
                    </TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {sortedJobs.map(function (job) {
                    let companyCell: React.ReactNode = job.company;
                    if (job.companyId !== null) {
                        companyCell = (
                            <Link
                                href={"/entreprises/" + job.companyId}
                                className="text-primary underline underline-offset-4 hover:no-underline"
                            >
                                {job.company}
                            </Link>
                        );
                    }

                    let place = "—";
                    if (job.city !== "") {
                        place = job.city + " (" + job.postalCode + ")";
                    }

                    return (
                        <TableRow key={job.id}>
                            <TableCell className="max-w-56 whitespace-normal break-words font-heading font-semibold text-primary">
                                {job.title}
                            </TableCell>
                            <TableCell className="text-sm">{companyCell}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {job.sector}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="font-heading">
                                    {job.contract}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {job.remote}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {place}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                                {formatSalary(job)}
                            </TableCell>
                            <TableCell className="max-w-56 whitespace-normal">
                                <div className="flex flex-wrap gap-1">
                                    {job.skills.map(function (item) {
                                        return (
                                            <Badge
                                                key={item}
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                {item}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">
                                {formatDate(job.publishedAt)}
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );

    if (!isJobs) {
        table = (
            <Table>
                <caption className="sr-only">
                    Entreprises référencées : nom, SIRET, activité, effectif, commune,
                    nombre d&apos;offres en ligne et site internet.
                </caption>

                <TableHeader>
                    <TableRow>
                        <TableHead scope="col">
                            <SortButton
                                label="Entreprise"
                                active={companySort === "name"}
                                ascending={companyAscending}
                                onClick={function () {
                                    toggleCompanySort("name");
                                }}
                            />
                        </TableHead>
                        <TableHead scope="col">SIRET</TableHead>
                        <TableHead scope="col">Activité</TableHead>
                        <TableHead scope="col">
                            <SortButton
                                label="Effectif"
                                active={companySort === "employees"}
                                ascending={companyAscending}
                                onClick={function () {
                                    toggleCompanySort("employees");
                                }}
                            />
                        </TableHead>
                        <TableHead scope="col">
                            <SortButton
                                label="Commune"
                                active={companySort === "city"}
                                ascending={companyAscending}
                                onClick={function () {
                                    toggleCompanySort("city");
                                }}
                            />
                        </TableHead>
                        <TableHead scope="col" className="text-right">
                            <SortButton
                                label="Offres en ligne"
                                active={companySort === "jobs"}
                                ascending={companyAscending}
                                onClick={function () {
                                    toggleCompanySort("jobs");
                                }}
                            />
                        </TableHead>
                        <TableHead scope="col">Site</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {sortedCompanies.map(function (company) {
                        let place = "—";
                        if (company.city !== "") {
                            place = company.city + " (" + company.postalCode + ")";
                        }

                        let site: React.ReactNode = "—";
                        if (company.link) {
                            site = (
                                <a
                                    href={company.link}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="text-primary underline underline-offset-4 hover:no-underline"
                                >
                                    Ouvrir
                                </a>
                            );
                        }

                        return (
                            <TableRow key={company.id}>
                                <TableCell className="max-w-56 whitespace-normal break-words font-heading font-semibold text-primary">
                                    <Link
                                        href={"/entreprises/" + company.id}
                                        className="underline underline-offset-4 hover:no-underline"
                                    >
                                        {company.name}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-sm tabular-nums text-muted-foreground">
                                    {company.siret}
                                </TableCell>
                                <TableCell className="max-w-64 whitespace-normal break-words text-sm text-muted-foreground">
                                    {company.activity}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {employeeRangeLabel(company.employeeRange)}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {place}
                                </TableCell>
                                <TableCell className="text-right text-sm tabular-nums">
                                    {company.jobsCount}
                                </TableCell>
                                <TableCell className="text-sm">{site}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-6 py-10">
            <h1 className="font-heading text-2xl font-bold text-primary">
                Annuaire des offres et des entreprises
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
                La même donnée que la carte, présentée en tableau et triable colonne par
                colonne.
            </p>

            <Tabs value={mode} onValueChange={handleModeChange} className="mt-6">
                <TabsList>
                    <TabsTrigger value="offres" className="font-heading">
                        Offres
                    </TabsTrigger>
                    <TabsTrigger value="entreprises" className="font-heading">
                        Entreprises
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="mt-6 grid gap-3 lg:grid-cols-4">
                <div className="flex flex-col gap-1.5">
                    <Label
                        htmlFor="directory-name"
                        className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                    >
                        Nom
                    </Label>
                    <Input
                        id="directory-name"
                        type="search"
                        value={name}
                        onChange={function (event) {
                            setName(event.target.value);
                        }}
                        placeholder={
                            isJobs ? "Intitulé ou entreprise" : "Nom ou SIRET"
                        }
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label
                        htmlFor="directory-location"
                        className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                    >
                        Localisation
                    </Label>
                    <Input
                        id="directory-location"
                        type="search"
                        value={location}
                        onChange={function (event) {
                            setLocation(event.target.value);
                        }}
                        placeholder="Commune ou code postal"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label
                        htmlFor="directory-domain"
                        className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                    >
                        Domaine
                    </Label>
                    <Select value={domain} onValueChange={setDomain}>
                        <SelectTrigger id="directory-domain" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ANY}>Tous les domaines</SelectItem>
                            {domainOptions.map(function (option) {
                                return (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>

                {isJobs ? (
                    <div className="flex flex-col gap-1.5">
                        <Label
                            htmlFor="directory-skill"
                            className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                        >
                            Compétence
                        </Label>
                        <Input
                            id="directory-skill"
                            type="search"
                            value={skill}
                            onChange={function (event) {
                                setSkill(event.target.value);
                            }}
                            placeholder="React, soudure, comptabilité…"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col gap-1.5">
                        <Label
                            htmlFor="directory-min-jobs"
                            className="font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                        >
                            Offres en ligne (minimum)
                        </Label>
                        <Input
                            id="directory-min-jobs"
                            type="number"
                            min={0}
                            value={minJobs}
                            onChange={function (event) {
                                setMinJobs(event.target.value);
                            }}
                            placeholder="0"
                        />
                    </div>
                )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p aria-live="polite" className="text-sm text-muted-foreground">
                    {total.toLocaleString("fr-FR")}{" "}
                    {isJobs ? "offre(s)" : "entreprise(s)"}
                </p>

                <Button
                    type="button"
                    variant="ghost"
                    onClick={resetFilters}
                    className="font-heading font-semibold text-primary hover:bg-accent"
                >
                    <X className="mr-2 h-4 w-4" />
                    Tout effacer
                </Button>
            </div>

            <div className={cn("mt-2 overflow-x-auto border border-border bg-background")}>
                {table}
            </div>
        </div>
    );
}
