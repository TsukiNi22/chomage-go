"use client";

import { useState } from "react";
import ApplicationsTable from "@/components/applications-table";
import ApplicationDetails from "@/components/application-details";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    useApplications,
    type JobApplication,
} from "@/lib/applications-context";

export default function MyApplicationsPage() {
    const { applications, removeApplication } = useApplications();
    const [selected, setSelected] = useState<JobApplication | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [toDelete, setToDelete] = useState<JobApplication | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    function openDetails(application: JobApplication) {
        setSelected(application);
        setDetailsOpen(true);
    }

    function closeDetails() {
        setDetailsOpen(false);
    }

    function askDelete(application: JobApplication) {
        setDeleteError(null);
        setToDelete(application);
    }

    function cancelDelete() {
        setToDelete(null);
    }

    async function confirmDelete() {
        if (toDelete === null) {
            return;
        }

        setDeleting(true);
        const ok = await removeApplication(toDelete.id);
        setDeleting(false);

        if (!ok) {
            setDeleteError("Le retrait a échoué. Réessayez dans un instant.");
            return;
        }

        setDetailsOpen(false);
        setToDelete(null);
    }

    let deleteTitle = "";
    if (toDelete !== null) {
        deleteTitle = toDelete.title;
    }

    return (
        <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="font-heading text-2xl font-bold text-primary">
                    Mes candidatures
                </h1>
                <p className="text-sm text-muted-foreground">
                    {applications.length} candidature(s)
                </p>
            </div>

            <ApplicationsTable
                applications={applications}
                onSelect={openDetails}
                onDelete={askDelete}
            />

            <ApplicationDetails
                application={selected}
                open={detailsOpen}
                onClose={closeDetails}
                onDelete={askDelete}
            />

            <Dialog open={toDelete !== null} onOpenChange={cancelDelete}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-heading text-destructive">
                            Retirer cette candidature ?
                        </DialogTitle>
                        <DialogDescription>
                            Votre candidature à « {deleteTitle} » sera définitivement
                            retirée et l&apos;employeur n&apos;y aura plus accès.
                        </DialogDescription>
                    </DialogHeader>

                    {deleteError !== null && (
                        <p
                            role="alert"
                            aria-live="assertive"
                            className="border border-destructive bg-destructive/5 px-3 py-2 text-sm text-destructive"
                        >
                            {deleteError}
                        </p>
                    )}

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
                            {deleting ? "Retrait…" : "Retirer ma candidature"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
