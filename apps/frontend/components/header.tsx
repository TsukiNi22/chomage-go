"use client";

import { useState } from "react";
import Link from "next/link";
import MinistryBrand from "@/components/ministry-brand";
import { Button } from "@/components/ui/button";
import AuthModal from "./auth-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

const links = [
    { label: "Comment ça marche", href: "/#how" },
    { label: "Carte des offres", href: "/carte" },
];

export default function Header() {
    const [modalOpen, setModalOpen] = useState(false);
    const { data: session, isPending } = authClient.useSession();

    function openModal() {
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
    }

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
                    <Button
                        asChild
                        className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                    >
                        <a href="#publish">Publier une offre</a>
                    </Button>
                </div>
            </header>

            <AuthModal open={modalOpen} onClose={closeModal} />
        </>
    );
}
