export function normalizeSiret(value: string): string {
    return value.replace(/\s/g, "");
}

export function isValidSiret(value: string): boolean {
    const siret = normalizeSiret(value);

    if (!/^\d{14}$/.test(siret)) {
        return false;
    }

    let total = 0;
    for (let i = 0; i < 14; i++) {
        let digit = Number(siret[13 - i]);
        if (i % 2 === 1) {
            digit = digit * 2;
            if (digit > 9) {
                digit = digit - 9;
            }
        }
        total = total + digit;
    }

    return total % 10 === 0;
}

export function siretError(value: string): string | null {
    const siret = normalizeSiret(value);

    if (siret === "") {
        return "Le numéro de SIRET est obligatoire.";
    }
    if (!/^\d+$/.test(siret)) {
        return "Le numéro de SIRET ne contient que des chiffres.";
    }
    if (siret.length !== 14) {
        return "Le numéro de SIRET comporte 14 chiffres.";
    }
    if (!isValidSiret(siret)) {
        return "Ce numéro de SIRET est invalide (clé de contrôle incorrecte).";
    }

    return null;
}

export function formatSiret(value: string): string {
    const siret = normalizeSiret(value);
    if (siret.length !== 14) {
        return siret;
    }
    return (
        siret.slice(0, 3) +
        " " +
        siret.slice(3, 6) +
        " " +
        siret.slice(6, 9) +
        " " +
        siret.slice(9)
    );
}
