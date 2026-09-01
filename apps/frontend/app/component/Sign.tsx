"use client";

import { useState } from "react";

interface SignProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "login" | "signup";

export default function AuthModal({ isOpen, onClose }: SignProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#ffffff",
          padding: "20px",
          borderRadius: "12px",
          width: "350px",
          border: "2px solid #1e6fd9",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ color: "#1e6fd9", marginBottom: "20px" }}>
          {mode === "login" ? "Connexion" : "Inscription"}
        </h2>

        <input
          type="email"
          placeholder="Email"
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "12px",
            border: "1px solid #cce0ff",
            borderRadius: "6px",
          }}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "20px",
            border: "1px solid #cce0ff",
            borderRadius: "6px",
          }}
        />

        <button
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#1e6fd9",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          {mode === "login" ? "Se connecter" : "S'inscrire"}
        </button>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#f5f5f5",
            color: "#333",
            border: "1px solid #ddd",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Fermer
        </button>

        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          style={{
            width: "100%",
            padding: "10px",
            background: "none",
            color: "#1e6fd9",
            textDecoration: "underline",
            textAlign: "right",
            border: "none",
            fontSize: "14px",
            cursor: "pointer",
            marginBottom: "10px",
            display: "block",
          }}
        >
          {mode === "login" ? "Inscription" : "Connexion"}
        </button>
      </div>
    </div>
  );
}
