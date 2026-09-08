import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
    applicationStatusLabel,
    type JobApplication,
} from "@/lib/applications-context";

type Props = {
    applications: JobApplication[];
    onSelect?: (application: JobApplication) => void;
    onDelete?: (application: JobApplication) => void;
};

function statusClass(status: number): string {
    if (status === 1) {
        return "border-success font-heading text-success";
    }
    if (status === 2) {
        return "border-destructive font-heading text-destructive";
    }
    return "font-heading";
}

export default function ApplicationsTable(props: Props) {
    if (props.applications.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 border border-border bg-background px-8 py-16 text-center">
                <p className="font-heading text-base font-semibold text-primary">
                    Aucune candidature envoyée pour le moment
                </p>
                <p className="max-w-xs text-sm text-muted-foreground">
                    Vos candidatures apparaîtront ici une fois envoyées.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto border border-border bg-background">
            <Table>
                <caption className="sr-only">
                    Candidatures envoyées : intitulé, entreprise, ville, type de contrat,
                    statut de traitement, date d&apos;envoi et retrait de la candidature.
                </caption>

                <TableHeader>
                    <TableRow>
                        <TableHead scope="col">Titre</TableHead>
                        <TableHead scope="col">Entreprise</TableHead>
                        <TableHead scope="col">Ville</TableHead>
                        <TableHead scope="col">Type</TableHead>
                        <TableHead scope="col">Statut</TableHead>
                        <TableHead scope="col" className="text-right">Date de candidature</TableHead>
                        <TableHead scope="col" className="w-px" />
                        <TableHead scope="col" className="w-px text-right">Retirer</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {props.applications.map(function (application) {
                        const appliedDate = new Date(application.appliedAt).toLocaleDateString(
                            "fr-FR",
                            { day: "numeric", month: "long", year: "numeric" },
                        );

                        return (
                            <TableRow key={application.id}>
                                <TableCell
                                    onClick={function () {
                                        if (props.onSelect) {
                                            props.onSelect(application);
                                        }
                                    }}
                                    className="cursor-pointer font-heading font-semibold text-primary"
                                >
                                    {application.title}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {application.company}
                                    {application.unavailableReason !== null && (
                                        <Badge
                                            variant="outline"
                                            className="ml-2 border-destructive font-heading text-destructive"
                                        >
                                            {application.unavailableReason}
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {application.city}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-heading">
                                        {application.contractType}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={statusClass(application.status)}
                                    >
                                        {applicationStatusLabel(application.status)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-sm text-muted-foreground">
                                    {appliedDate}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={function () {
                                            if (props.onSelect) {
                                                props.onSelect(application);
                                            }
                                        }}
                                        className="font-heading font-semibold text-primary hover:bg-accent"
                                    >
                                        Voir
                                    </Button>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={function () {
                                            if (props.onDelete) {
                                                props.onDelete(application);
                                            }
                                        }}
                                        aria-label={
                                            "Retirer ma candidature à " + application.title
                                        }
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
