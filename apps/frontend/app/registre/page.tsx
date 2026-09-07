import type { Metadata } from "next";
import Link from "next/link";
import { GEO_NOTICE_SECTIONS } from "@/lib/geolocation-notice";

export const metadata: Metadata = {
    title: "Fiche de registre",
    description:
        "Registre des activités de traitement : données collectées, maille, durée de conservation, base légale et destinataires.",
};

const collected = [
    {
        group: "Compte et identité",
        rows: [
            ["Nom d'affichage", "users.name"],
            ["Prénom", "users.firstname"],
            ["Nom", "users.lastname"],
            ["Email de connexion", "users.email"],
            ["Email de contact", "users.email_contact"],
            ["Statut de vérification email", "users.email_verified"],
            ["Mot de passe (hash)", "account.password"],
            ["Rôle du compte", "users.rank"],
            ["Rattachement à une entreprise", "users.companies_id"],
            ["Date de validation employeur", "users.allowed_at"],
            ["Dates de création et mise à jour", "users.created_at, users.updated_at"],
        ],
    },
    {
        group: "Localisation",
        rows: [
            ["Adresse saisie librement", "users.address"],
            [
                "Adresse normalisée",
                "addresses.label, street, postal_code, city, country_code",
            ],
            ["Coordonnées géographiques", "addresses.latitude, addresses.longitude"],
            ["Coordonnées Lambert 93", "addresses.lambert_x, addresses.lambert_y"],
            [
                "Informations de géocodage",
                "addresses.geocoding_source, geocoding_score, geocoded_at",
            ],
            ["Indicateur de vérification", "addresses.needs_location_check"],
            ["Indicateur d'activation de la localisation", "users.localisation"],
        ],
    },
    {
        group: "Profil professionnel",
        rows: [
            ["Description libre", "users.description"],
            ["CV (encodé en base64)", "users.resume"],
            ["Compétences déclarées", "user_skills.name, user_skills.description"],
            [
                "Expériences professionnelles",
                "experience.name, description, type, part_time, start, end",
            ],
            [
                "Disponibilités déclarées",
                "availability.title, type, part_time, start, end",
            ],
        ],
    },
    {
        group: "Session et authentification",
        rows: [
            ["Session de connexion", "session.token, session.expires_at"],
            ["Adresse IP de connexion", "session.ip_address"],
            ["User-agent du navigateur", "session.user_agent"],
            [
                "Jeton de vérification",
                "verification.identifier, value, expires_at",
            ],
            [
                "Compte d'authentification",
                "account.account_id, provider_id, issuer, scope",
            ],
        ],
    },
    {
        group: "Entreprises, offres et candidatures",
        rows: [
            [
                "Données d'entreprise",
                "companies.name, siret, description, link, employee_range",
            ],
            [
                "Offres publiées",
                "jobs.title, description, type, sector, remote, salary_min, salary_max, created_at",
            ],
            ["Compétences requises par offre", "job_skills.name, job_skills.description"],
            ["Lien candidat et offre", "applications.job_id, applications.user_id"],
            ["Message de candidature", "applications.description"],
            ["Date de candidature", "applications.created_at"],
        ],
    },
];

const notCollected = [
    "Numéro de téléphone",
    "Date de naissance ou âge",
    "Numéro de sécurité sociale ou identifiant national",
    "Données bancaires ou de paiement",
    "Photo ou avatar",
    "Données biométriques",
    "Données de navigation au-delà de l'adresse IP et du user-agent liés à la session",
    "Historique des recherches ou du comportement de navigation",
];

export default function RegistrePage() {
    return (
        <div className="bg-wash px-6 py-14">
            <div className="mx-auto max-w-3xl">
                <p className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Registre des activités de traitement
                </p>

                <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-primary">
                    Quelles données sont collectées
                </h1>

                <p className="mt-3 text-muted-foreground">
                    Les{" "}
                    <Link
                        href="/risques"
                        className="font-medium text-primary underline underline-offset-4 hover:no-underline"
                    >
                        risques identifiés
                    </Link>{" "}
                    font l&apos;objet d&apos;un document distinct. Éditeur : Équipe de
                    développement.
                </p>

                <section className="mt-10 border-t border-border pt-6">
                    <h2 className="font-heading text-lg font-bold text-primary">
                        Finalité et base légale
                    </h2>
                    <div className="mt-4 flex flex-col gap-3">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Gestion des comptes utilisateurs (candidats et employeurs),
                            constitution de profils professionnels, publication
                            d&apos;offres d&apos;emploi et gestion des candidatures.
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Exécution du contrat (art. 6.1.b RGPD) : la création
                            d&apos;un compte et son usage sont nécessaires à la
                            fourniture du service demandé par l&apos;utilisateur.
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Point de vigilance : les consentements de l&apos;utilisateur
                            sont actuellement stockés dans le navigateur, associés à une
                            date de réponse et à la réponse donnée.
                        </p>
                    </div>
                </section>

                {collected.map(function (block) {
                    return (
                        <section
                            key={block.group}
                            className="mt-10 border-t border-border pt-6"
                        >
                            <h2 className="font-heading text-lg font-bold text-primary">
                                {block.group}
                            </h2>

                            <div className="mt-4 overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="py-2 pr-4 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                                Donnée
                                            </th>
                                            <th className="py-2 font-heading text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                                                Emplacement
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {block.rows.map(function (row) {
                                            return (
                                                <tr
                                                    key={row[0]}
                                                    className="border-b border-border/60"
                                                >
                                                    <td className="py-2 pr-4 align-top">
                                                        {row[0]}
                                                    </td>
                                                    <td className="py-2 align-top font-mono text-xs text-muted-foreground">
                                                        {row[1]}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    );
                })}

                <section className="mt-10 border-t border-border pt-6">
                    <h2 className="font-heading text-lg font-bold text-primary">
                        Maille, conservation, destinataires et droits
                    </h2>

                    <div className="mt-4 flex flex-col gap-6">
                        {GEO_NOTICE_SECTIONS.map(function (section) {
                            return (
                                <div key={section.title}>
                                    <h3 className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                        {section.title}
                                    </h3>
                                    <ul className="mt-2 flex flex-col gap-2">
                                        {section.items.map(function (item) {
                                            return (
                                                <li
                                                    key={item}
                                                    className="text-sm leading-relaxed text-muted-foreground"
                                                >
                                                    {item}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section className="mt-10 border-t border-border pt-6">
                    <h2 className="font-heading text-lg font-bold text-primary">
                        Ce qui n&apos;est pas collecté
                    </h2>
                    <ul className="mt-4 flex flex-col gap-2">
                        {notCollected.map(function (item) {
                            return (
                                <li
                                    key={item}
                                    className="text-sm leading-relaxed text-muted-foreground"
                                >
                                    {item}
                                </li>
                            );
                        })}
                    </ul>
                </section>
            </div>
        </div>
    );
}
