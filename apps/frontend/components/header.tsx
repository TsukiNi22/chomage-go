"use client";

import { useState } from "react";
import MinistryBrand from "@/components/ministry-brand";
import { Button } from "@/components/ui/button";
import AuthModal from "./auth-modal";

const links = [
    { label: "Offres", href: "#jobs" },
    { label: "À propos", href: "#about" },
];

export default function Header() {
    const [modalOpen, setModalOpen] = useState(false);

    function openModal() {
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
    }

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
                        Se connecter
                    </Button>
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
