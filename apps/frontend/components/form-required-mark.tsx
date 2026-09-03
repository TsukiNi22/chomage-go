export function RequiredMark() {
    return (
        <span aria-hidden="true" className="ml-0.5 text-destructive">
            *
        </span>
    );
}

export function RequiredFieldsNote() {
    return (
        <p className="text-xs text-muted-foreground">
            Les champs marqués d&apos;un <RequiredMark /> sont obligatoires.
        </p>
    );
}
