import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2 } from "lucide-react";
import type { EmployerJobPosting } from "@/lib/employer-jobs";

type Props = {
    postings: EmployerJobPosting[];
    onDelete: (id: number) => void;
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
        <TooltipProvider delayDuration={200}>
        <div className="overflow-x-auto border border-border bg-background">
            <Table>
                <caption className="sr-only">
                    Offres publiées par votre établissement : titre, description, type de
                    contrat, compétences requises, salaire minimum, nombre de candidatures
                    et action de suppression.
                </caption>

                <TableHeader>
                    <TableRow>
                        <TableHead scope="col">Titre</TableHead>
                        <TableHead scope="col">Description</TableHead>
                        <TableHead scope="col">Type</TableHead>
                        <TableHead scope="col">Compétences requises</TableHead>
                        <TableHead scope="col" className="text-right">Salaire min.</TableHead>
                        <TableHead scope="col" className="text-right">Candidatures</TableHead>
                        <TableHead scope="col" className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {props.postings.map(function (posting) {
                        return (
                            <TableRow key={posting.id}>
                                <TableCell className="max-w-48 whitespace-normal break-words font-heading font-semibold text-primary">
                                    {posting.title}
                                </TableCell>

                                {/* L'infobulle doit rester dans une cellule : hors du
                                    td, l'analyseur HTML l'extrait du tableau et décale
                                    toutes les colonnes. Le déclencheur est un bouton
                                    pour rester atteignable au clavier. */}
                                <TableCell className="max-w-64">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                className="block w-full cursor-default truncate text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                                            >
                                                {posting.description}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                            <p>{posting.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
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

                                <TableCell className="text-right">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={function () {
                                            props.onDelete(posting.id);
                                        }}
                                        aria-label={`Supprimer l'offre ${posting.title}`}
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
        </TooltipProvider>
    );
}
