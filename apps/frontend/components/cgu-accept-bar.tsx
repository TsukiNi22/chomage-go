"use client";

import { Button } from "@/components/ui/button";
import { useCgu } from "@/components/cgu-provider";

export default function CguAcceptBar() {
    const cgu = useCgu();

    if (!cgu.ready || cgu.accepted) {
        return null;
    }

    return (
        <div className="sticky bottom-0 z-20 border-t-2 border-primary bg-background px-6 py-4">
            <div className="mx-auto flex max-w-3xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                    Vous n&apos;avez pas encore accepté ces conditions. La création de
                    compte et la publication d&apos;offres restent bloquées.
                </p>
                <Button
                    type="button"
                    onClick={cgu.accept}
                    className="shrink-0 bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                >
                    J&apos;accepte les conditions générales
                </Button>
            </div>
        </div>
    );
}
