"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import AddressAutocomplete from "@/components/address-autocomplete";
import { RequiredMark, RequiredFieldsNote } from "@/components/form-required-mark";
import type { Place } from "@/lib/geocoding";
import type { ContractType } from "@/lib/employer-jobs";
import { postJob, postJobSkill, type NewJobInput } from "@/lib/api";

const contractTypes: ContractType[] = ["CDI", "CDD", "Alternance", "Stage", "Freelance"];

const remoteOptions = ["Aucun", "Partiel", "Total"];

const CONTRACT_ERROR = "Sélectionnez un type de contrat pour publier l'offre.";

type Props = {
    companiesId: number;
    companyActivity?: string | null;
    companyAddress?: string | null;
    onCreated: () => void;
};

export default function CreateJobPostingDialog(props: Props) {
    const [open, setOpen] = useState(false);
    const [contractType, setContractType] = useState<ContractType | "">("");
    const [remote, setRemote] = useState("Aucun");
    const [address, setAddress] = useState("");
    const [place, setPlace] = useState<Place | null>(null);
    const [contractError, setContractError] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const contractRef = useRef<HTMLButtonElement>(null);

    function resetForm() {
        setContractType("");
        setRemote("Aucun");
        setAddress("");
        setPlace(null);
        setContractError(null);
        setError(null);
    }

    function handleOpenChange(nextOpen: boolean) {
        setOpen(nextOpen);
        if (!nextOpen) {
            resetForm();
        }
    }

    function handleContractChange(value: string) {
        setContractType(value as ContractType);
        setContractError(null);
    }

    function handleAddressChange(value: string) {
        setAddress(value);
        setPlace(null);
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        if (contractType === "") {
            setContractError(CONTRACT_ERROR);
            if (contractRef.current !== null) {
                contractRef.current.focus();
            }
            return;
        }

        const form = event.currentTarget;
        const formData = new FormData(form);

        const title = String(formData.get("title")).trim();
        const description = String(formData.get("description")).trim();
        const sector = String(formData.get("sector")).trim();
        const skillsRaw = String(formData.get("skills")).trim();
        const salaryMin = Number(formData.get("salaryMin"));
        const salaryMaxRaw = String(formData.get("salaryMax")).trim();
        const maxApplicantsRaw = String(formData.get("maxApplicants")).trim();

        const salaryMax = Number(salaryMaxRaw);
        if (salaryMaxRaw !== "" && salaryMax < salaryMin) {
            setError("Le salaire maximum doit être supérieur au salaire minimum.");
            return;
        }

        const input: NewJobInput = {
            companies_id: props.companiesId,
            title: title,
            description: description,
            type: contractTypes.indexOf(contractType),
            remote: remoteOptions.indexOf(remote),
            salary_min: salaryMin,
        };
        if (sector !== "") {
            input.sector = sector;
        }
        if (salaryMaxRaw !== "") {
            input.salary_max = salaryMax;
        }
        if (maxApplicantsRaw !== "") {
            input.max_applicants = Number(maxApplicantsRaw);
        }
        if (address.trim() !== "") {
            input.address = { label: address.trim() };
            if (place !== null) {
                input.address.latitude = place.lat;
                input.address.longitude = place.lon;
            }
        }

        setSaving(true);
        const created = await postJob(input);
        setSaving(false);

        if (created.job === null) {
            setError(created.message);
            return;
        }

        const skills = skillsRaw
            .split(",")
            .map(function (skill) {
                return skill.trim();
            })
            .filter(function (skill) {
                return skill.length > 0;
            });

        for (const skill of skills) {
            await postJobSkill(created.job.id, skill);
        }

        props.onCreated();
        form.reset();
        resetForm();
        setOpen(false);
    }

    let contractErrorClass = "sr-only";
    if (contractError !== null) {
        contractErrorClass =
            "border border-destructive bg-destructive/5 px-3 py-2 text-sm text-destructive";
    }

    let errorClass = "sr-only";
    if (error !== null) {
        errorClass =
            "border border-destructive bg-destructive/5 px-3 py-2 text-sm text-destructive";
    }

    let publishLabel = "Publier l'offre";
    if (saving) {
        publishLabel = "Publication…";
    }

    let contractInvalid: boolean | undefined = undefined;
    let contractDescribedBy: string | undefined = undefined;
    if (contractError !== null) {
        contractInvalid = true;
        contractDescribedBy = "contractType-error";
    }

    let addressHint = "Sans adresse, l'offre est localisée au siège de l'entreprise.";
    if (props.companyAddress) {
        addressHint =
            "Sans adresse, l'offre est localisée à l'adresse de l'entreprise (" +
            props.companyAddress +
            ").";
    }

    let sectorPlaceholder = "Informatique, bâtiment, santé…";
    if (props.companyActivity) {
        sectorPlaceholder = props.companyActivity;
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover">
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle offre
                </Button>
            </DialogTrigger>

            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-heading text-primary">
                        Publier une nouvelle offre
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <RequiredFieldsNote />

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="title">Titre<RequiredMark /></Label>
                        <Input id="title" name="title" required />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="description">Description<RequiredMark /></Label>
                        <Textarea id="description" name="description" required rows={3} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="contractType">Type de contrat<RequiredMark /></Label>
                        <Select value={contractType} onValueChange={handleContractChange}>
                            <SelectTrigger
                                id="contractType"
                                ref={contractRef}
                                aria-invalid={contractInvalid}
                                aria-describedby={contractDescribedBy}
                                className="w-full"
                            >
                                <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                            <SelectContent>
                                {contractTypes.map(function (type) {
                                    return (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        <p
                            id="contractType-error"
                            role="alert"
                            aria-live="assertive"
                            className={contractErrorClass}
                        >
                            {contractError}
                        </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="remote">Télétravail</Label>
                        <Select value={remote} onValueChange={setRemote}>
                            <SelectTrigger id="remote" className="w-full">
                                <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                                {remoteOptions.map(function (option) {
                                    return (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="sector">Secteur d&apos;activité</Label>
                        <Input
                            id="sector"
                            name="sector"
                            placeholder={sectorPlaceholder}
                            maxLength={100}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="jobAddress">Adresse du poste</Label>
                        <AddressAutocomplete
                            id="jobAddress"
                            value={address}
                            onChange={handleAddressChange}
                            onSelect={setPlace}
                            placeholder="12 rue de la Paix, 35000 Rennes"
                        />
                        <p className="text-xs text-muted-foreground">{addressHint}</p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="skills">
                            Compétences requises
                            <RequiredMark />
                            <span className="ml-1 font-normal text-muted-foreground">
                                (séparées par des virgules)
                            </span>
                        </Label>
                        <Input
                            id="skills"
                            name="skills"
                            placeholder="React, TypeScript, Node.js"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="salaryMin">Salaire minimum (€ brut/an)<RequiredMark /></Label>
                        <Input
                            id="salaryMin"
                            name="salaryMin"
                            type="number"
                            min={0}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="salaryMax">Salaire maximum (€ brut/an)</Label>
                        <Input
                            id="salaryMax"
                            name="salaryMax"
                            type="number"
                            min={0}
                            placeholder="Facultatif"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="maxApplicants">
                            Nombre maximum de candidatures
                        </Label>
                        <Input
                            id="maxApplicants"
                            name="maxApplicants"
                            type="number"
                            min={1}
                            placeholder="Facultatif, sans limite si vide"
                        />
                    </div>

                    <p role="alert" aria-live="assertive" className={errorClass}>
                        {error}
                    </p>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={saving}
                            className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                        >
                            {publishLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
