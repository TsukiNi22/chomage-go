import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { EmployerJobPosting } from "@/lib/employer-jobs";

type Props = {
    postings: EmployerJobPosting[];
};

export default function JobPostingsTable(props: Props) {
    if (props.postings.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 border border-border bg-background px-8 py-16 text-center">
                <p className="font-heading text-base font-semibold text-primary">
                    Aucune offre publiée pour le moment
                </p>
                <p className="max-w-xs text-sm text-muted-foreground">
                    Vos offres apparaîtront ici une fois publiées.
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
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Compétences requises</TableHead>
                        <TableHead className="text-right">Salaire min.</TableHead>
                        <TableHead className="text-right">Candidatures</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {props.postings.map(function (posting) {
                        return (
                            <TableRow key={posting.id}>
                                <TableCell className="max-w-48 whitespace-normal break-words font-heading font-semibold text-primary">
                                    {posting.title}
                                </TableCell>

                                <TableCell className="max-w-xs whitespace-normal break-words text-sm text-muted-foreground">
                                    {posting.description}
                                </TableCell>

                                <TableCell>
                                    <Badge variant="outline" className="font-heading">
                                        {posting.contractType}
                                    </Badge>
                                </TableCell>

                                <TableCell className="max-w-56 whitespace-normal">
                                    <div className="flex flex-wrap gap-1">
                                        {posting.requiredSkills.map(function (skill) {
                                            return (
                                                <Badge key={skill} variant="secondary" className="text-xs">
                                                    {skill}
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                </TableCell>

                                <TableCell className="text-right text-sm">
                                    {posting.salaryMin.toLocaleString("fr-FR")} € brut/an
                                </TableCell>

                                <TableCell className="text-right font-heading font-semibold text-primary">
                                    {posting.applicantsCount}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
