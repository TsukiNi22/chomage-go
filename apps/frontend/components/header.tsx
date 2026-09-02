"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import MinistryBrand from "@/components/ministry-brand";
import { Button } from "@/components/ui/button";
import AuthModal from "./auth-modal";
import Link from "next/link";

const links = [
    { label: "Home", href: "/" },
    { label: "À propos", href: "#about" },
];

const PUBLISH_JOB_ROUTE = "/offres";

export default function Header() {
    const pathname = usePathname();
    const [modalOpen, setModalOpen] = useState(false);

    function openModal() {
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
    }

    const isOnPublishPage = pathname === PUBLISH_JOB_ROUTE;

    return (
        <>
            <header className="flex items-center justify-between gap-6 border-b-2 border-primary bg-background px-8 py-4">
                <MinistryBrand />

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
                    <Button
                        variant="ghost"
                        onClick={openModal}
                        className="font-heading font-semibold text-primary hover:bg-accent"
                    >
                        Se connecter/S'inscrire
                    </Button>
                    {!isOnPublishPage && (
                        <Button
                            asChild
                            className="bg-action font-heading font-semibold text-action-foreground hover:bg-action-hover"
                        >
                            <Link href="/offres">Publier une offre</Link>
                        </Button>
                    )}
                </div>
            </header>

            <AuthModal open={modalOpen} onClose={closeModal} />
        </>
    );
}
