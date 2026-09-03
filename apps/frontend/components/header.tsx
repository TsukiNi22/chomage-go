"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MinistryBrand from "@/components/ministry-brand";
import { Button } from "@/components/ui/button";
import AuthModal from "./auth-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useCgu } from "@/components/cgu-provider";

const links = [
    { label: "Carte des offres", href: "/carte" },
    { label: "Publier une offre", href: "/offres" },
    { label: "Comment ça marche", href: "/#how" },
];

const PUBLISH_JOB_ROUTE = "/offres";

export default function Header() {
    const pathname = usePathname();
    const [modalOpen, setModalOpen] = useState(false);
    const { data: session, isPending } = authClient.useSession();
    const cgu = useCgu();

    function openModal() {
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
    }

    const isOnPublishPage = pathname === PUBLISH_JOB_ROUTE;
    async function handleSignOut() {
        await authClient.signOut();
    }

    let accountArea = (
    <Button
        variant="ghost"
        onClick={openModal}
        className="font-heading font-semibold text-primary hover:bg-accent"
    >
        Se connecter/S&apos;inscrire
    </Button>
    );
    
    if (isPending) {
        accountArea = <Skeleton className="h-9 w-32" />;
    } else if (session) {
        accountArea = (
            <div className="flex items-center gap-3">
                <Link
                    href="/profil"
                    className="font-heading text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                    {session.user.name}
                </Link>
                <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="font-heading font-semibold text-primary hover:bg-accent"
                >
                    Se déconnecter
                </Button>
            </div>
        );
    }

    let publishButton: React.ReactNode = (
        <Button
            asChild
            className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
        >
            <Link href={PUBLISH_JOB_ROUTE}>Publier une offre</Link>
        </Button>
    );

    if (isOnPublishPage) {
        publishButton = null;
    }

    if (cgu.ready && !cgu.accepted) {
        accountArea = (
            <Button
                variant="ghost"
                disabled
                title="Acceptez les conditions générales pour continuer"
                className="font-heading font-semibold text-primary"
            >
                Se connecter/S&apos;inscrire
            </Button>
        );

        publishButton = (
            <Button
                disabled
                title="Acceptez les conditions générales pour continuer"
                className="bg-action font-heading font-semibold text-action-foreground"
            >
                Publier une offre
            </Button>
        );
    }

    return (
        <>
            <header className="flex items-center justify-between gap-6 border-b-2 border-primary bg-background px-8 py-4">
                <Link href="/" aria-label="Retour à l'accueil">
                    <MinistryBrand />
                </Link>

                <nav aria-label="Navigation principale" className="hidden lg:block">
                    <ul className="flex items-center gap-8">
                        {links.map(function (link) {
                            return (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className="font-heading text-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="flex items-center gap-3">
                    {accountArea}
                    {publishButton}
                </div>
            </header>

            <AuthModal open={modalOpen} onClose={closeModal} />
        </>
    );
}
