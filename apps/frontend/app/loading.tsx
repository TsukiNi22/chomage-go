import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="bg-wash px-6 py-14">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-5">
                <p
                    aria-live="polite"
                    className="font-heading text-sm font-semibold uppercase tracking-[0.12em] text-primary"
                >
                    Chargement des offres
                </p>
                <Skeleton className="h-12 w-full max-w-3xl rounded-none" />
                <Skeleton className="h-8 w-72 rounded-none" />
                <Skeleton className="h-[34rem] w-full rounded-none" />
            </div>
        </div>
    );
}
