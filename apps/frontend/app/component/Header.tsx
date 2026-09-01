"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import AuthModal from "./Sign";

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between border-b-2 border-primary bg-background px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="border-r border-border pr-4">
            <p className="font-titre text-[0.6rem] font-bold uppercase leading-[1.15] tracking-[0.14em] text-primary">
              Ministère
              <br />
              du Job
              <br />
              et Bonheur
            </p>
            <p className="mt-1 text-[0.55rem] italic leading-[1.15] text-muted-foreground">
              Liberté
              <br />
              Égalité
              <br />
              Fraternité
            </p>
          </div>
          <span className="font-titre text-xl font-bold tracking-tight text-primary">
            GéoEmploi
          </span>
        </div>

        <Button
          variant="outline"
          onClick={() => setIsModalOpen(true)}
          className="border-primary font-titre font-semibold text-primary"
        >
          Connexion / Inscription
        </Button>
      </header>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
