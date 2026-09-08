"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import Wordmark from "@/components/wordmark";
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
import { fetchReceivedCount } from "@/lib/api";
import { useCgu } from "@/components/cgu-provider";
import { UserRank } from "@/lib/user-rank";
import { useRouter } from "next/navigation";

const links = [
    { label: "Comment ça marche", href: "/#how" },
    { label: "Carte des offres", href: "/carte" },
    { label: "Carte des entreprises", href: "/entreprises" },
    { label: "Annuaire", href: "/annuaire" },
];

const PUBLISH_JOB_ROUTE = "/offres";
const MY_APPLICATIONS_ROUTE = "/candidatures";
const ADMIN_ROUTE = "/admin";

export default function Header() {
    const pathname = usePathname();
    const [modalOpen, setModalOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const { data: session, isPending: sessionPending } = authClient.useSession();
    // Le rendu serveur ignore la session : on attend l'hydratation avant de dépendre
    // d'elle, sinon les deux rendus divergent.
    const [hydrated, setHydrated] = useState(false);
    const isPending = sessionPending || !hydrated;
    const cgu = useCgu();
    const router = useRouter();

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
    const rank = isPending ? undefined : session?.user?.rank;
    const isJobSeeker = rank === UserRank.JOB_SEEKER;
    const isEmployer = rank === UserRank.EMPLOYER;
    const isAdmin = rank === UserRank.ADMIN;
    const [pending, setPending] = useState(0);

    useEffect(function () {
        setHydrated(true);
    }, []);

    useEffect(
        function () {
            if (!isEmployer) {
                setPending(0);
                return;
            }

            let cancelled = false;

            fetchReceivedCount().then(function (result) {
                if (!cancelled) {
                    setPending(result.pending);
                }
            });

            return function () {
                cancelled = true;
            };
        },
        [isEmployer],
    );

    let pendingBadge = null;
    if (pending > 0) {
        pendingBadge = (
            <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-action px-1.5 py-0.5 font-heading text-[0.65rem] font-bold text-action-foreground">
                {pending}
            </span>
        );
    }

    // Entrées de navigation propres au rôle, partagées par le menu large et le menu glissant.
    const roleLinks: { label: string; href: string; badge?: React.ReactNode }[] = [];
    if (isJobSeeker) {
        roleLinks.push({ label: "Mes candidatures", href: MY_APPLICATIONS_ROUTE });
    }
    if (isEmployer) {
        roleLinks.push({
            label: "Publier une offre",
            href: PUBLISH_JOB_ROUTE,
            badge: pendingBadge,
        });
    }
    if (isAdmin) {
        roleLinks.push({ label: "Administration", href: ADMIN_ROUTE });
    }

    async function handleSignOut() {
        await authClient.signOut();
        router.push("/");
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

    let publishButton: React.ReactNode = null;

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

        if (isEmployer && !isOnPublishPage) {
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
    }

    return (
        <>
            <header className="grid grid-cols-[1fr_auto] items-center gap-4 border-b-2 border-primary bg-background px-4 py-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-6 lg:px-8">
                <Link href="/" aria-label="Retour à l'accueil" className="justify-self-start">
                    <Wordmark />
                </Link>

                <nav
                    aria-label="Navigation principale"
                    className="hidden justify-self-center lg:block"
                >
                    <ul className="flex items-center gap-6">
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

                        {roleLinks.map(function (link) {
                            return (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className="font-heading text-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                                    >
                                        {link.label}
                                        {link.badge}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="hidden items-center justify-self-end gap-3 lg:flex">
                    {accountArea}
                    {publishButton}
                </div>

                <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Ouvrir le menu de navigation"
                            className="col-start-2 justify-self-end lg:hidden"
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

                                    {roleLinks.map(function (link) {
                                        return (
                                            <li key={link.href}>
                                                <a
                                                    href={link.href}
                                                    className="font-heading text-base font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                                                >
                                                    {link.label}
                                                    {link.badge}
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
