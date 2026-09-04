"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { RequiredMark, RequiredFieldsNote } from "@/components/form-required-mark";
import type { ContractType, EmployerJobPosting } from "@/lib/employer-jobs";

const contractTypes: ContractType[] = ["CDI", "CDD", "Alternance", "Stage", "Freelance"];

type Props = {
    onCreate: (posting: EmployerJobPosting) => void;
};

export default function CreateJobPostingDialog(props: Props) {
    const [open, setOpen] = useState(false);
    const [contractType, setContractType] = useState<ContractType | "">("");

    function handleOpenChange(nextOpen: boolean) {
        setOpen(nextOpen);
        if (!nextOpen) {
            setContractType("");
        }
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        const title = String(formData.get("title")).trim();
        const description = String(formData.get("description")).trim();
        const skillsRaw = String(formData.get("skills")).trim();
        const salaryMin = Number(formData.get("salaryMin"));

        if (contractType === "") {
            return;
        }
        const requiredSkills = skillsRaw
            .split(",")
            .map(function (skill) {
                return skill.trim();
            })
            .filter(function (skill) {
                return skill.length > 0;
            });

        const newPosting: EmployerJobPosting = {
            id: Date.now(),
            title,
            description,
            contractType,
            requiredSkills,
            salaryMin,
            applicantsCount: 0,
        };
        props.onCreate(newPosting);
        event.currentTarget.reset();
        setContractType("");
        setOpen(false);
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
                        <Select
                            value={contractType}
                            onValueChange={function (value) {
                                setContractType(value as ContractType);
                            }}
                            required
                        >
                            <SelectTrigger id="contractType">
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

                    <DialogFooter>
                        <Button
                            type="submit"
                            className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                        >
                            Publier l&apos;offre
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
