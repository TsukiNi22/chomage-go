import type { Metadata } from "next";
import CguAcceptBar from "@/components/cgu-accept-bar";
import { CGU_DATE, CGU_VERSION } from "@/lib/cgu";

export const metadata: Metadata = {
    description:
        "Conditions générales d'utilisation du service public de l'emploi géolocalisé.",
};

const articles = [
    {
        title: "Article 1. Objet et champ d'application",
        blocks: [
            "Les présentes Conditions Générales d'Utilisation régissent l'accès et l'utilisation de l'application mobile et du site web, mis à disposition par l'Équipe de développement.",
            "L'Application a pour objectif de faciliter la mise en relation entre les demandeurs d'emploi et les employeurs via un service de géolocalisation des offres d'emploi.",
            "Toute utilisation de l'Application est soumise à l'acceptation préalable et sans réserve des présentes conditions par l'utilisateur.",
        ],
    },
    {
        title: "Article 2. Accès à l'application",
        blocks: [
            "2.1 Consultation libre. La consultation des offres d'emploi sur la carte interactive est accessible à tout utilisateur, sans création de compte ni authentification préalable.",
            "2.2 Création de compte. Pour déposer une candidature ou publier une offre, l'utilisateur doit créer un compte selon l'un des rôles suivants : demandeur d'emploi, employeur (soumis à une vérification), administrateur (soumis à des limitations).",
            "L'utilisateur s'engage à fournir des informations exactes, complètes et à jour lors de la création de son compte.",
        ],
    },
    {
        title: "Article 3. Fonctionnalités",
        blocks: [
            "3.1 Pour les demandeurs d'emploi : création et gestion d'un profil professionnel, recherche et visualisation d'offres géolocalisées, candidature directe avec transmission du profil, suivi des candidatures.",
            "3.2 Pour les employeurs : publication d'offres avec localisation, réception et gestion des candidatures, tableau de bord statistique.",
            "3.3 Pour l'administration : modération des offres publiées, gestion des comptes, tableau de bord de suivi national.",
        ],
    },
    {
        title: "Article 4. Géolocalisation et données cartographiques",
        blocks: [
            "L'Application utilise une solution cartographique open source et des données issues de la Géoplateforme. La localisation des offres est indicative et repose sur le niveau de précision de l'adresse fournie par l'employeur.",
            "L'utilisateur peut consulter la carte sans activer la géolocalisation de son propre appareil. En cas d'activation, ses données de localisation ne sont utilisées qu'à des fins d'affichage et ne sont pas stockées.",
        ],
    },
    {
        title: "Article 5. Données personnelles et consentement",
        blocks: [
            "5.1 Collecte et finalité. Les données personnelles collectées (nom, adresse électronique, compétences, expériences, disponibilité) sont strictement nécessaires à la fourniture des services. La localisation précise de l'utilisateur n'est jamais stockée.",
            "5.2 Consentement. Le consentement à la géolocalisation est recueilli par une case non pré-cochée, libre, spécifique, éclairé et univoque. L'utilisateur peut à tout moment donner ou retirer son consentement, y compris en cours de session, sans perte de son compte, de son profil ni de ses candidatures engagées.",
            "5.3 Durée de conservation. Les données sont conservées pendant la durée d'utilisation active du compte. En cas d'inactivité prolongée de plus de vingt-quatre mois, ou à la demande de l'utilisateur, elles sont supprimées dans un délai raisonnable.",
            "5.4 Suppression de compte. L'utilisateur peut à tout moment demander la suppression de son compte et de ses données via l'interface dédiée ou par contact avec le support.",
            "5.5 Sécurité. L'Éditeur met en œuvre les mesures techniques et organisationnelles appropriées pour garantir la sécurité des données et empêcher tout accès non autorisé.",
        ],
    },
    {
        title: "Article 6. Responsabilités",
        blocks: [
            "6.1 Responsabilité de l'Éditeur. L'Éditeur s'engage à fournir l'Application avec la diligence requise, mais ne peut garantir une disponibilité ininterrompue ou une absence totale d'erreurs.",
            "6.2 Responsabilité de l'employeur. L'employeur est seul responsable du contenu des offres publiées : exactitude, conformité légale, non-discrimination. L'Éditeur n'est pas responsable du contenu des annonces, sous réserve de son obligation de modération a posteriori.",
            "6.3 Signalement. Un système de signalement permet aux utilisateurs de notifier toute offre frauduleuse, abusive ou non conforme. L'Éditeur s'engage à examiner ces signalements dans les meilleurs délais.",
        ],
    },
    {
        title: "Article 7. Propriété intellectuelle",
        blocks: [
            "L'Application, son code source, son design, ses marques et ses contenus, hors offres d'emploi, sont la propriété exclusive de l'Équipe de développement jusqu'à la finalisation du contrat.",
            "À la finalisation du contrat, la propriété intellectuelle de l'Application sera transférée au Ministère du Job et Bonheur. Toute reproduction, modification ou distribution non autorisée est interdite.",
        ],
    },
    {
        title: "Article 8. Modification des conditions",
        blocks: [
            "Les présentes conditions sont modifiées et publiées par le Ministère du Job et Bonheur.",
            "Toute nouvelle version devra être présentée et validée par l'utilisateur avant son entrée en vigueur, comme lors de la première utilisation de l'Application. Les utilisateurs sont informés des modifications notables par une notification dans l'Application. L'utilisation de l'Application après validation vaut acceptation des nouvelles conditions.",
        ],
    },
    {
        title: "Article 9. Loi applicable et juridiction",
        blocks: [
            "Les présentes conditions sont régies par le droit français. Tout litige relatif à l'utilisation de l'Application sera soumis aux tribunaux compétents de Bordeaux.",
        ],
    },
    {
        title: "Article 10. Contact",
        blocks: [
            "Pour toute question relative aux présentes conditions, à la protection des données ou à l'utilisation de l'Application, vous pouvez contacter l'Équipe de développement à equipedev@chomagego.fr. Ce contact est valable jusqu'à la finalisation du contrat et au transfert de la propriété intellectuelle.",
            "Après la finalisation du contrat et le transfert de la propriété intellectuelle, le contact est celui du Ministère du Job et Bonheur, à contact@ministere-job-bonheur.fr.",
        ],
    },
];

export default function CguPage() {
    return (
        <div className="bg-wash px-6 py-14">
            <div className="mx-auto max-w-3xl">
                <p className="font-heading text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Version {CGU_VERSION} du {CGU_DATE}
                </p>

                <h1 className="mt-3 font-heading text-3xl font-bold leading-tight text-primary">
                    Conditions générales d&apos;utilisation
                </h1>

                <p className="mt-3 text-muted-foreground">
                    Document soumis à la validation du cabinet du Ministre. Éditeur :
                    Équipe de développement.
                </p>

                <div className="mt-10 flex flex-col gap-10">
                    {articles.map(function (article) {
                        return (
                            <section
                                key={article.title}
                                className="border-t border-border pt-6"
                            >
                                <h2 className="font-heading text-lg font-bold text-primary">
                                    {article.title}
                                </h2>

                                <div className="mt-4 flex flex-col gap-3">
                                    {article.blocks.map(function (block) {
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

            <CguAcceptBar />
        </div>
    );
}
