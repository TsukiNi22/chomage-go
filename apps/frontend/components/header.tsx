"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import MinistryBrand from "@/components/ministry-brand";
import { Button } from "@/components/ui/button";
import AuthModal from "./auth-modal";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
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
    const [menuOpen, setMenuOpen] = useState(false);
    const { data: session, isPending } = authClient.useSession();
    const cgu = useCgu();

    function openModal() {
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
    }

    function closeMenu() {
        setMenuOpen(false);
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
            <header className="flex items-center justify-between gap-4 border-b-2 border-primary bg-background px-4 py-4 sm:px-6 lg:gap-6 lg:px-8">
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

                <div className="hidden items-center gap-3 lg:flex">
                    {accountArea}
                    {publishButton}
                </div>

                <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Ouvrir le menu de navigation"
                            className="lg:hidden"
                        >
                            <Menu className="size-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:max-w-sm">
                        <SheetHeader>
                            <SheetTitle className="font-heading text-primary">
                                Menu
                            </SheetTitle>
                        </SheetHeader>

                        <div
                            onClick={closeMenu}
                            className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-6"
                        >
                            <nav aria-label="Navigation principale du menu">
                                <ul className="flex flex-col gap-4">
                                    {links.map(function (link) {
                                        return (
                                            <li key={link.href}>
                                                <a
                                                    href={link.href}
                                                    className="font-heading text-base font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                                                >
                                                    {link.label}
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>

                            <div className="flex flex-col gap-3 border-t border-border pt-6">
                                {accountArea}
                                {publishButton}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </header>

            <AuthModal open={modalOpen} onClose={closeModal} />
        </>
    );
}
