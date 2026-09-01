"use client";

import { useState } from "react";
import AuthModal from "./Sign";

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "15px 30px",
          backgroundColor: "#ffffff",
          borderBottom: "2px solid #1e6fd9",
        }}
      >
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: "8px 20px",
            backgroundColor: "#1e6fd9",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Connexion / Inscription
        </button>
      </header>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}