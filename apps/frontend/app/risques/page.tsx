import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Risques",
    description:
        "Analyse d'impact allégée : risques identifiés, mesures de réduction et risques résiduels du démonstrateur.",
};

const sections = [
    {
        title: "1. Description du traitement",
        blocks: [
            "Finalité : gestion de comptes candidats et employeurs, constitution de profils professionnels géolocalisés, publication d'offres d'emploi et affichage sur carte interactive, gestion des candidatures.",
            "Périmètre technique actuel : environnement de développement et de test en réseau local. Le backend et le frontend communiquent en HTTP non chiffré, avec des identifiants de base de données non renforcés. Ce point est traité comme un risque d'infrastructure, distinct des risques liés aux données elles-mêmes.",
            "Données de localisation concernées : coordonnées géographiques précises (addresses.latitude, addresses.longitude), coordonnées Lambert 93 (addresses.lambert_x, addresses.lambert_y), traçabilité du géocodage (geocoding_source, geocoding_score, geocoded_at), indicateur de fiabilité (needs_location_check), adresse saisie librement (users.address), rattachements (users.address_id, companies.address_id, jobs.address_id) et booléen d'activation (users.localisation).",
            "Acteurs : candidats, employeurs et administrateurs. Aucun rôle de support ou de modération distinct. Aucun tiers destinataire hormis l'hébergeur technique et l'API de géocodage sollicitée pour transformer une adresse saisie en coordonnées.",
        ],
    },
    {
        title: "2. Nécessité et proportionnalité de la collecte de localisation",
        blocks: [
            "Une carte interactive des offres nécessite des coordonnées géographiques exploitables, ce qu'un simple code postal ne permet pas de rendre avec la même précision visuelle. La collecte de latitude et longitude est donc justifiable pour cette fonctionnalité précise.",
            "Niveau de précision : le schéma conserve à la fois des coordonnées WGS84 et Lambert 93, avec un score de géocodage. Aucune limite de précision (arrondi, floutage) n'est appliquée avant stockage ou affichage : la position résolue est aussi précise que ce que l'API de géocodage retourne.",
            "Granularité du consentement : l'activation de la localisation est un booléen unique. Il n'existe pas de choix intermédiaire, par exemple « ville uniquement » plutôt que position précise, alors que la carte pourrait fonctionner avec une précision réduite pour les candidats qui le souhaiteraient.",
        ],
    },
    {
        title: "3. Risques pour les personnes concernées",
        blocks: [
            "Exposition du domicile d'un chercheur d'emploi. L'adresse géocodée précise d'un candidat, liée à son profil et affichée à un recruteur, expose potentiellement son lieu de résidence réel : risque de harcèlement, de discrimination géographique dans le tri des candidatures, ou de sécurité physique.",
            "CV en clair, non chiffré au repos. Le CV est stocké en base64 dans une colonne texte standard, sans mécanisme de chiffrement distinct. Une fuite de la base exposerait l'intégralité des CV en clair.",
            "Traces de connexion conservées au-delà de l'expiration fonctionnelle de la session. La session expire après 3 jours, mais la ligne correspondante (adresse IP, user-agent) n'est retirée par aucun processus tant que le compte reste actif.",
            "Purge implémentée mais incomplète sur les données de localisation liées. La suppression d'un utilisateur inactif entraîne bien celle de ses sessions, comptes, compétences, expériences et candidatures. En revanche la ligne d'adresse elle-même n'est jamais supprimée : seule la référence est mise à null. Une adresse géocodée précise peut donc rester en base indéfiniment, orpheline.",
            "Configuration d'infrastructure aggravant les risques ci-dessus. Le trafic non chiffré et les identifiants faibles observés en test ne sont pas des risques au sens strict, mais atteindraient-ils un environnement de production tels quels, ils transformeraient les risques précédents en risques d'interception directement exploitables.",
            "Table d'archive sans contrainte d'intégrité référentielle. Les offres archivées dupliquent les rattachements sans clé étrangère, donc aucune vérification automatique ne garantit leur cohérence avec le cycle de vie des personnes concernées.",
        ],
    },
    {
        title: "4. Mesures de réduction retenues",
        blocks: [
            "Suppression non destructive des adresses : le retrait d'une adresse met la référence à null au lieu de supprimer en cascade l'entreprise, le compte ou l'offre qui la portait.",
            "Indicateur de fiabilité et score de géocodage : signalement d'une géolocalisation potentiellement peu fiable, ouvrant la voie à une vérification avant affichage.",
            "Booléen d'activation de la localisation : opt-in déclaratif, même si sa granularité reste limitée.",
            "Séparation des responsabilités d'authentification : les mots de passe ne transitent jamais en clair, le hash est isolé et l'ancien champ est explicitement marqué comme abandonné.",
            "Contraintes d'unicité sur l'adresse e-mail, sur le couple nom et SIRET d'une entreprise, et sur le couple intitulé et entreprise d'une offre : elles réduisent la duplication de profils et d'entités.",
            "Archive horodatée et indexée : base technique déjà en place pour un futur cycle de purge automatisé.",
        ],
    },
    {
        title: "5. Risques résiduels non traités",
        blocks: [
            "CV non chiffré au repos. Non traité : un chiffrement applicatif dédié nécessiterait une gestion de clés et un stockage objet séparé, hors du périmètre du projet actuel. Risque accepté pour la durée du projet, à réévaluer avant toute mise en production réelle.",
            "Données liées non supprimées malgré la purge du compte. Deux angles morts : la ligne d'adresse d'un utilisateur supprimé n'est jamais retirée et peut persister indéfiniment ; aucun nettoyage périodique ne retire les sessions expirées d'un compte encore actif.",
            "Floutage ou réduction de précision de la position affichée. Non traité : aucun rayon d'anonymisation ni arrondi de coordonnées n'est appliqué avant affichage sur la carte, y compris pour un candidat n'ayant pas postulé à l'offre consultée.",
            "Absence de garde-fou empêchant la configuration de test d'atteindre la production. Rien dans le projet (séparation des secrets par environnement, vérification automatisée, checklist de mise en production) ne garantit aujourd'hui que cette configuration ne soit pas reconduite par erreur.",
        ],
    },
];

export default function RisquesPage() {
    return (
        <div className="bg-wash px-6 py-14">
            <div className="mx-auto max-w-3xl">
                <p className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Analyse d&apos;impact allégée
                </p>

                <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-primary">
                    Risques identifiés
                </h1>

                <p className="mt-3 text-muted-foreground">
                    Ce document complète la{" "}
                    <Link
                        href="/registre"
                        className="font-medium text-primary underline underline-offset-4 hover:no-underline"
                    >
                        fiche de registre des activités de traitement
                    </Link>{" "}
                    et ne la remplace pas. Éditeur : Équipe de développement.
                </p>

                <div className="mt-10 flex flex-col gap-10">
                    {sections.map(function (section) {
                        return (
                            <section
                                key={section.title}
                                className="border-t border-border pt-6"
                            >
                                <h2 className="font-heading text-lg font-bold text-primary">
                                    {section.title}
                                </h2>

                                <div className="mt-4 flex flex-col gap-3">
                                    {section.blocks.map(function (block) {
                                        return (
                                            <p
                                                key={block.slice(0, 40)}
                                                className="text-sm leading-relaxed text-muted-foreground"
                                            >
                                                {block}
                                            </p>
                                        );
                                    })}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
