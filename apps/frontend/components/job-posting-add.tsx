"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { RequiredMark, RequiredFieldsNote } from "@/components/form-required-mark";
import type { ContractType } from "@/lib/employer-jobs";
import { postJob, postJobSkill } from "@/lib/api";

const contractTypes: ContractType[] = ["CDI", "CDD", "Alternance", "Stage", "Freelance"];

const CONTRACT_ERROR = "Sélectionnez un type de contrat pour publier l'offre.";

type Props = {
    companiesId: number;
    onCreated: () => void;
};

export default function CreateJobPostingDialog(props: Props) {
    const [open, setOpen] = useState(false);
    const [contractType, setContractType] = useState<ContractType | "">("");
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const contractRef = useRef<HTMLButtonElement>(null);

    function handleOpenChange(nextOpen: boolean) {
        setOpen(nextOpen);
        if (!nextOpen) {
            setContractType("");
            setError(null);
        }
    }

    function handleContractChange(value: string) {
        setContractType(value as ContractType);
        setError(null);
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        // Le champ est obligatoire mais n'est pas un contrôle natif : sans ce
        // traitement, le refus serait silencieux (RGAA 11.10).
        if (contractType === "") {
            setError(CONTRACT_ERROR);
            if (contractRef.current !== null) {
                contractRef.current.focus();
            }
            return;
        }

        const form = event.currentTarget;
        const formData = new FormData(form);

        const title = String(formData.get("title")).trim();
        const description = String(formData.get("description")).trim();
        const skillsRaw = String(formData.get("skills")).trim();
        const salaryMin = Number(formData.get("salaryMin"));
        const salaryMaxRaw = String(formData.get("salaryMax")).trim();
        const maxApplicantsRaw = String(formData.get("maxApplicants")).trim();

        const salaryMax = Number(salaryMaxRaw);
        if (salaryMaxRaw !== "" && salaryMax < salaryMin) {
            setError("Le salaire maximum doit être supérieur au salaire minimum.");
            return;
        }

        const input: Parameters<typeof postJob>[0] = {
            companies_id: props.companiesId,
            title: title,
            description: description,
            type: contractTypes.indexOf(contractType),
            salary_min: salaryMin,
        };
        if (salaryMaxRaw !== "") {
            input.salary_max = salaryMax;
        }
        if (maxApplicantsRaw !== "") {
            input.max_applicants = Number(maxApplicantsRaw);
        }

        setSaving(true);
        const created = await postJob(input);
        setSaving(false);

        if (created === null) {
            setError(
                "La publication a échoué. Une offre du même intitulé existe peut-être déjà.",
            );
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
            await postJobSkill(created.id, skill);
        }

        props.onCreated();
        form.reset();
        setContractType("");
        setError(null);
        setOpen(false);
    }

    // Région d'annonce permanente, masquée tant qu'aucune erreur n'est levée.
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
    if (error !== null) {
        contractInvalid = true;
        contractDescribedBy = "contractType-error";
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover">
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle offre
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg">
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
                            className={errorClass}
                        >
                            {error}
                        </p>
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

                    <DialogFooter>
                        <Button
                            type="submit"
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
