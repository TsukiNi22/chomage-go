import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { JobApplication } from "@/lib/applications-context";

type Props = {
    applications: JobApplication[];
};

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
                <TableHeader>
                    <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Entreprise</TableHead>
                        <TableHead>Ville</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Date de candidature</TableHead>
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
                                <TableCell className="font-heading font-semibold text-primary">
                                    {application.title}
                                </TableCell>
                                <TableCell className="text-sm">{application.company}</TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {application.city}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-heading">
                                        {application.contractType}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-sm text-muted-foreground">
                                    {appliedDate}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
