"use client";

import { authClient } from "@/lib/auth-client";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilPage() {
    const { data: session, isPending } = authClient.useSession();
    
    if (isPending) {
        return (
            <div className="bg-wash px->6 py-14">
                <div className="mx-auto max-w-2xl">
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    if (!session) {
        return(
            <div className="bg-wash px-6 py-14">
                <div className="mx-auto max-w-2xl border-l-2 border-primary bg-background p-10">
                    <h1 className="font-heading text-2xl font-bold text-primary">
                        Connexion requise
                    </h1>
                    <p className="mt-3 text-muted-foreground">
                        Connectez-vous pour accéder à votre profil.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-wash px-6 py-14">
            <div className="mx-auto max-w-2xl">
                <h1 className="font-heading text-3xl font-bold text-primary">
                    Mon Profil
                </h1>
            </div>
        </div>
    );
}
