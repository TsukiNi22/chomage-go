function required(name: string, value: string | undefined): string {
    if (value === undefined || value === "") {
        throw new Error(
            "Variable d'environnement manquante : " +
                name +
                ". En local, copiez apps/frontend/.env.example vers " +
                "apps/frontend/.env.local. En conteneur, definissez-la dans " +
                "la section environment du service frontend.",
        );
    }

    return value;
}

export const API_URL = required(
    "NEXT_PUBLIC_API_URL",
    process.env.NEXT_PUBLIC_API_URL,
);
