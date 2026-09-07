"use client";

import { DEMO_DISCLAIMER } from "@/lib/legal-notice";

type Props = {
    error: Error & { digest?: string };
    retry: () => void;
};

// global-error remplace le layout racine : il ne reçoit ni globals.css ni les
// polices, d'où les styles inlinés. C'est aussi pour ça que la mention doit
// être répétée ici et pas seulement dans le pied de page.
export default function GlobalError(props: Props) {
    let digestLine = null;
    if (props.error.digest !== undefined) {
        digestLine = (
            <p style={{ fontSize: "0.75rem", color: "#566360", margin: 0 }}>
                Référence de l&apos;incident : {props.error.digest}
            </p>
        );
    }

    return (
        <html lang="fr">
            <body
                style={{
                    margin: 0,
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "#f2f7f6",
                    color: "#16192b",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                }}
            >
                <title>Le service est indisponible</title>

                <main
                    style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "5rem 1.5rem",
                    }}
                >
                    <div
                        style={{
                            maxWidth: "32rem",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            gap: "1.25rem",
                            borderLeft: "2px solid #c9191e",
                            backgroundColor: "#ffffff",
                            padding: "2.5rem",
                        }}
                    >
                        <p
                            style={{
                                margin: 0,
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.14em",
                                color: "#566360",
                            }}
                        >
                            Erreur 500
                        </p>
                        <h1
                            style={{
                                margin: 0,
                                fontSize: "1.875rem",
                                lineHeight: 1.2,
                                color: "#0f5f5c",
                            }}
                        >
                            Le service est momentanément indisponible
                        </h1>
                        <p style={{ margin: 0, color: "#566360" }}>
                            Une erreur technique empêche l&apos;affichage de la page.
                        </p>
                        {digestLine}
                        <button
                            type="button"
                            onClick={props.retry}
                            style={{
                                border: "none",
                                cursor: "pointer",
                                backgroundColor: "#b85433",
                                color: "#ffffff",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                padding: "0.5rem 1rem",
                                borderRadius: "0.25rem",
                            }}
                        >
                            Réessayer
                        </button>
                    </div>
                </main>

                <footer
                    style={{
                        borderTop: "2px solid #0f5f5c",
                        backgroundColor: "#ffffff",
                        padding: "1.5rem",
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "#9c4429",
                        }}
                    >
                        {DEMO_DISCLAIMER}
                    </p>
                </footer>
            </body>
        </html>
    );
}
