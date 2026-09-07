"use client";

import { useCallback, useEffect, useState } from "react";
import JobPostingsTable from "@/components/job-posting-table";
import CreateJobPostingDialog from "@/components/job-posting-add";
import JobApplicants from "@/components/job-applicants";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import {
    deleteJob,
    fetchCompanyJobs,
    fetchJobApplicants,
    fetchMyProfile,
    type EmployerJob,
} from "@/lib/api";
import type { EmployerJobPosting } from "@/lib/employer-jobs";

const CONTRACTS = ["CDI", "CDD", "Alternance", "Stage", "Freelance"];

function toPosting(job: EmployerJob, applicants: number): EmployerJobPosting {
    let contract = CONTRACTS[job.type];
    if (contract === undefined) {
        contract = "CDI";
    }

    return {
        id: job.id,
        title: job.title,
        description: job.description || "",
        contractType: contract as EmployerJobPosting["contractType"],
        requiredSkills: (job.skills || []).map(function (skill) {
            return skill.name;
        }),
        salaryMin: job.salaryMin || 0,
        applicantsCount: applicants,
    };
}

export default function EmployerJobsPage() {
    const { data: session } = authClient.useSession();
    const [companiesId, setCompaniesId] = useState<number | null>(null);
    const [jobs, setJobs] = useState<EmployerJob[]>([]);
    const [counts, setCounts] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);

    const [toDelete, setToDelete] = useState<EmployerJob | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [applicantsJob, setApplicantsJob] = useState<EmployerJob | null>(null);
    const [applicantsOpen, setApplicantsOpen] = useState(false);

    const reload = useCallback(async function (id: number) {
        const rows = await fetchCompanyJobs(id);
        setJobs(rows);

        const next: Record<number, number> = {};
        for (const row of rows) {
            const applicants = await fetchJobApplicants(row.id);
            next[row.id] = applicants.length;
        }
        setCounts(next);

        setLoading(false);
    }, []);

    useEffect(
        function () {
            if (!session) {
                setLoading(false);
                return;
            }

            let cancelled = false;

            fetchMyProfile().then(function (profile) {
                if (cancelled || profile === null) {
                    setLoading(false);
                    return;
                }
                setCompaniesId(profile.companiesId);
                if (profile.companiesId !== null) {
                    reload(profile.companiesId);
                } else {
                    setLoading(false);
                }
            });

            return function () {
                cancelled = true;
            };
        },
        [session, reload],
    );

    function askDelete(id: number) {
        const job = jobs.find(function (item) {
            return item.id === id;
        });
        if (job !== undefined) {
            setToDelete(job);
        }
    }

    function cancelDelete() {
        setToDelete(null);
    }

    async function confirmDelete() {
        if (toDelete === null) {
            return;
        }

        setDeleting(true);
        const ok = await deleteJob(toDelete.id);
        setDeleting(false);

        if (ok && companiesId !== null) {
            await reload(companiesId);
        }
        setToDelete(null);
    }

    function openApplicants(id: number) {
        const job = jobs.find(function (item) {
            return item.id === id;
        });
        if (job !== undefined) {
            setApplicantsJob(job);
            setApplicantsOpen(true);
        }
    }

    async function handleCreated() {
        if (companiesId !== null) {
            await reload(companiesId);
        }
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-6xl px-6 py-10">
                <p className="text-sm text-muted-foreground">Chargement des offres…</p>
            </div>
        );
    }

    if (companiesId === null) {
        return (
            <div className="mx-auto max-w-6xl px-6 py-10">
                <div className="border-l-2 border-primary bg-background p-10">
                    <h1 className="font-heading text-2xl font-bold text-primary">
                        Aucune entreprise rattachée
                    </h1>
                    <p className="mt-3 text-muted-foreground">
                        Votre compte n&apos;est rattaché à aucune entreprise. Créez un
                        compte employeur pour publier des offres.
                    </p>
                </div>
            </div>
        );
    }

    const postings = jobs.map(function (job) {
        let applicants = counts[job.id];
        if (applicants === undefined) {
            applicants = 0;
        }
        return toPosting(job, applicants);
    });

    let applicantsTitle = "";
    let applicantsId: number | null = null;
    if (applicantsJob !== null) {
        applicantsTitle = applicantsJob.title;
        applicantsId = applicantsJob.id;
    }

    let deleteTitle = "";
    if (toDelete !== null) {
        deleteTitle = toDelete.title;
    }

    let deleteLabel = "Supprimer définitivement";
    if (deleting) {
        deleteLabel = "Suppression…";
    }

    return (
        <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="font-heading text-2xl font-bold text-primary">
                    Mes offres publiées
                </h1>
                <p className="text-sm text-muted-foreground">
                    {postings.length} offre(s)
                </p>
            </div>

            <JobPostingsTable
                postings={postings}
                onDelete={askDelete}
                onShowApplicants={openApplicants}
            />

            <div className="mt-6 flex justify-end">
                <CreateJobPostingDialog
                    companiesId={companiesId}
                    onCreated={handleCreated}
                />
            </div>

            <Dialog open={toDelete !== null} onOpenChange={cancelDelete}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-heading text-destructive">
                            Supprimer cette offre ?
                        </DialogTitle>
                        <DialogDescription>
                            « {deleteTitle} » sera définitivement supprimée, ainsi que
                            les candidatures reçues. Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={cancelDelete}
                            className="font-heading font-semibold text-primary hover:bg-accent"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="button"
                            disabled={deleting}
                            onClick={confirmDelete}
                            className="bg-destructive font-heading font-semibold text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteLabel}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <JobApplicants
                jobId={applicantsId}
                jobTitle={applicantsTitle}
                open={applicantsOpen}
                onClose={function () {
                    setApplicantsOpen(false);
                }}
            />
        </div>
    );
}
