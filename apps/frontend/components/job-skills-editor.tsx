"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    deleteJobSkill,
    fetchJobSkills,
    patchJobSkill,
    postJobSkill,
} from "@/lib/api";

type Skill = { id: number; name: string };

type Props = {
    jobId: number | null;
    jobTitle: string;
    open: boolean;
    onClose: () => void;
    onChanged?: () => void;
};

export default function JobSkillsEditor(props: Props) {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [newSkill, setNewSkill] = useState("");
    const [editingId, setEditingId] = useState(0);
    const [editingName, setEditingName] = useState("");
    const [busy, setBusy] = useState(false);

    const jobId = props.jobId;
    const isOpen = props.open;

    useEffect(
        function () {
            if (!isOpen || jobId === null) {
                return;
            }

            let cancelled = false;
            setLoading(true);

            fetchJobSkills(jobId).then(function (rows) {
                if (cancelled) {
                    return;
                }
                setSkills(rows);
                setLoading(false);
            });

            return function () {
                cancelled = true;
            };
        },
        [isOpen, jobId],
    );

    async function reload() {
        if (jobId === null) {
            return;
        }
        const rows = await fetchJobSkills(jobId);
        setSkills(rows);
        if (props.onChanged) {
            props.onChanged();
        }
    }

    function handleOpenChange(open: boolean) {
        if (!open) {
            props.onClose();
        }
    }

    async function addSkill(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const name = newSkill.trim();
        if (name === "" || jobId === null) {
            return;
        }

        setBusy(true);
        await postJobSkill(jobId, name);
        setNewSkill("");
        await reload();
        setBusy(false);
    }

    function startEditing(skill: Skill) {
        setEditingId(skill.id);
        setEditingName(skill.name);
    }

    function cancelEditing() {
        setEditingId(0);
        setEditingName("");
    }

    async function saveEditing() {
        const name = editingName.trim();
        if (name === "" || jobId === null) {
            return;
        }

        setBusy(true);
        await patchJobSkill(jobId, editingId, name);
        cancelEditing();
        await reload();
        setBusy(false);
    }

    async function removeSkill(skillId: number) {
        if (jobId === null) {
            return;
        }

        setBusy(true);
        await deleteJobSkill(jobId, skillId);
        await reload();
        setBusy(false);
    }

    let list = <p className="text-sm text-muted-foreground">Chargement…</p>;

    if (!loading && skills.length === 0) {
        list = (
            <p className="text-sm text-muted-foreground">
                Aucune compétence requise pour cette offre.
            </p>
        );
    }

    if (!loading && skills.length > 0) {
        list = (
            <ul className="flex flex-col gap-2">
                {skills.map(function (skill) {
                    if (skill.id === editingId) {
                        return (
                            <li
                                key={skill.id}
                                className="flex flex-wrap items-center gap-2 border border-border p-2"
                            >
                                <Input
                                    value={editingName}
                                    onChange={function (event) {
                                        setEditingName(event.target.value);
                                    }}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    disabled={busy}
                                    onClick={saveEditing}
                                    className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                                >
                                    Enregistrer
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={cancelEditing}
                                    className="font-heading font-semibold"
                                >
                                    Annuler
                                </Button>
                            </li>
                        );
                    }

                    return (
                        <li
                            key={skill.id}
                            className="flex flex-wrap items-center justify-between gap-2 border border-border p-2"
                        >
                            <Badge variant="secondary" className="font-heading">
                                {skill.name}
                            </Badge>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    disabled={busy}
                                    onClick={function () {
                                        startEditing(skill);
                                    }}
                                    className="font-heading font-semibold text-primary hover:bg-accent"
                                >
                                    Modifier
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    disabled={busy}
                                    onClick={function () {
                                        removeSkill(skill.id);
                                    }}
                                    className="font-heading font-semibold text-destructive hover:bg-destructive/10"
                                >
                                    Retirer
                                </Button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    }

    return (
        <Dialog open={props.open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-heading text-primary">
                        Compétences requises
                    </DialogTitle>
                    <DialogDescription>{props.jobTitle}</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-5">
                    {list}

                    <form
                        onSubmit={addSkill}
                        className="flex flex-col gap-2 border-t border-border pt-4"
                    >
                        <Label htmlFor="new-skill">Ajouter une compétence</Label>
                        <div className="flex gap-2">
                            <Input
                                id="new-skill"
                                value={newSkill}
                                onChange={function (event) {
                                    setNewSkill(event.target.value);
                                }}
                                placeholder="PostgreSQL"
                            />
                            <Button
                                type="submit"
                                disabled={busy}
                                className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                            >
                                Ajouter
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
