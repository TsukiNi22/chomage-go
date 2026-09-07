// Source unique de la mention d'information relative à la géolocalisation.
//
// Le contenu ci-dessous DOIT rester identique à la fiche de registre des
// activités de traitement : docs/pontaillac/fiche-de-traitement.md
// (mêmes données collectées, même maille, même durée de conservation).
// Toute modification ici doit être répercutée dans la fiche, et inversement :
// c'est la divergence entre les deux qui est opposable, pas l'omission.

export const GEO_NOTICE_VERSION = "1.0";
export const GEO_NOTICE_DATE = "07/09/2026";
export const GEO_NOTICE_REGISTER = "docs/pontaillac/fiche-de-traitement.md";

const STORAGE_KEY = "geoemploi.geolocation.notice.seen";

export type NoticeSection = {
    title: string;
    items: string[];
};

export const GEO_NOTICE_INTRO =
    "Avant d'activer la géolocalisation, voici précisément ce qui est collecté, à quelle précision et pendant combien de temps. Cette mention reprend à l'identique la fiche de registre des activités de traitement du service.";

export const GEO_NOTICE_SECTIONS: NoticeSection[] = [
    {
        title: "Données collectées",
        items: [
            "Un indicateur d'activation de la fonctionnalité (users.localisation). C'est la seule donnée liée à la géolocalisation enregistrée sur nos serveurs.",
            "La position de votre appareil est calculée par votre navigateur et reste sur votre appareil. Elle n'est ni transmise à nos serveurs, ni enregistrée.",
            "Distinctement, l'adresse postale que vous saisissez dans votre profil est enregistrée (users.address) puis normalisée (addresses.label, street, postal_code, city, country_code), avec ses coordonnées (addresses.latitude, addresses.longitude), leur équivalent Lambert 93 (addresses.lambert_x, addresses.lambert_y) et les informations de géocodage (addresses.geocoding_source, geocoding_score, geocoded_at).",
        ],
    },
    {
        title: "Maille (précision)",
        items: [
            "La position de l'appareil est demandée en précision réduite (haute précision désactivée) et une position déjà en cache jusqu'à 60 secondes est acceptée.",
            "Elle sert uniquement à trier et filtrer les offres par distance à l'écran. Le rayon de recherche appliqué à l'activation est de 50 km.",
            "L'adresse que vous saisissez est, elle, géocodée à la maille du point adresse (latitude/longitude et Lambert 93), et non à la maille de la commune.",
        ],
    },
    {
        title: "Durée de conservation",
        items: [
            "La position de l'appareil n'est pas conservée : elle disparaît dès que vous quittez ou rechargez la page.",
            "L'indicateur d'activation et l'adresse enregistrée sont conservés tant que votre compte existe.",
            "Aucune purge automatique n'est à ce jour implémentée. La suppression des données des comptes inactifs depuis plus de 2 ans est prévue mais n'est pas encore en place.",
        ],
    },
    {
        title: "Base légale",
        items: [
            "Exécution du contrat (art. 6.1.b RGPD) pour la fourniture du service.",
            "L'activation de la géolocalisation est libre, spécifique et révocable à tout moment, sans perte de votre compte, de votre profil ni de vos candidatures engagées.",
        ],
    },
    {
        title: "Destinataires",
        items: [
            "Aucun service tiers de mesure d'audience, de publicité ou de revente de données.",
            "Seul destinataire technique : l'hébergeur de l'infrastructure (base PostgreSQL et conteneurs).",
            "Lorsque vous recherchez une commune, le texte que vous saisissez est envoyé à l'API Adresse de l'État (api-adresse.data.gouv.fr) pour le géocodage. La position de votre appareil ne lui est jamais envoyée.",
        ],
    },
    {
        title: "Vos droits",
        items: [
            "Vous pouvez désactiver la géolocalisation à tout moment depuis vos réglages de compte ou directement depuis la carte.",
            "Vous pouvez consulter cette mention à tout moment depuis vos réglages de compte.",
        ],
    },
];

export function hasSeenNotice(): boolean {
    try {
        return window.localStorage.getItem(STORAGE_KEY) === GEO_NOTICE_VERSION;
    } catch {
        return false;
    }
}

export function saveNoticeSeen() {
    try {
        window.localStorage.setItem(STORAGE_KEY, GEO_NOTICE_VERSION);
    } catch {
        return;
    }
}
