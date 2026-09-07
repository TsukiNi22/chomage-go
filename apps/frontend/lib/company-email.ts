const PUBLIC_DOMAINS = [
    "gmail.com",
    "googlemail.com",
    "yahoo.com",
    "yahoo.fr",
    "hotmail.com",
    "hotmail.fr",
    "outlook.com",
    "outlook.fr",
    "live.fr",
    "live.com",
    "msn.com",
    "orange.fr",
    "wanadoo.fr",
    "free.fr",
    "sfr.fr",
    "laposte.net",
    "bbox.fr",
    "aol.com",
    "icloud.com",
    "me.com",
    "protonmail.com",
    "proton.me",
    "gmx.fr",
    "gmx.com",
    "yopmail.com",
    "mailinator.com",
];

export function emailDomain(value: string): string {
    const at = value.lastIndexOf("@");
    if (at === -1) {
        return "";
    }
    return value.slice(at + 1).trim().toLowerCase();
}

export function isPublicDomain(value: string): boolean {
    return PUBLIC_DOMAINS.includes(emailDomain(value));
}

export function companyEmailError(value: string): string | null {
    const email = value.trim();

    if (email === "") {
        return "L'adresse électronique est obligatoire.";
    }

    const domain = emailDomain(email);
    if (domain === "" || !domain.includes(".")) {
        return "Cette adresse électronique est invalide.";
    }

    if (isPublicDomain(email)) {
        return "Utilisez l'adresse professionnelle de votre entreprise, pas une adresse personnelle (Gmail, Orange, Outlook…).";
    }

    return null;
}
