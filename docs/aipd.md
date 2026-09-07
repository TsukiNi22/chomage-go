# AIPD allégée — chomage-go

Valide uniquement sur les versions se basant sur le schéma du commit [36d44e9](https://github.com/TsukiNi22/chomage-go/commit/36d44e9b630dad585cd4ae56e50691842486d9f7).
Complète la [Fiche de registre des activités de traitement](#) existante — ne la remplace pas.

---

## 1. Description du traitement

**Finalité** : gestion de comptes candidats/employeurs, constitution de profils professionnels géolocalisés, publication d'offres d'emploi et affichage sur carte interactive (`/carte`, via l'API IGN Géoplateforme), gestion des candidatures.

**Périmètre technique actuel** : environnement de développement/test en LAN. Le backend et le frontend communiquent via une IP privée en HTTP non chiffré (`cleartext: true` requis pour Capacitor), avec des identifiants de base de données non renforcés (`DB_USER=root` / `DB_PASSWORD=root`) dans la configuration observée. Ce point est traité comme un risque d'infrastructure en section 3, distinct des risques liés aux données elles-mêmes.

**Données de localisation concernées** (schema) :
- `addresses.latitude`, `addresses.longitude` — coordonnées géographiques précises
- `addresses.lambert_x`, `addresses.lambert_y` — coordonnées Lambert 93 (EPSG:2154), système de référence officiel français
- `addresses.geocoding_source`, `addresses.geocoding_score`, `addresses.geocoded_at` — traçabilité du géocodage
- `addresses.needs_location_check` — indicateur de fiabilité nécessitant vérification humaine
- `users.address` (saisie libre), `users.address_id`, `users.localisation` (booléen d'activation)
- `companies.address_id`, `jobs.address_id`

**Acteurs** : candidats (`users.rank = 2`), employeurs (`rank = 1`), administrateurs (`rank = 0`). Pas de rôle support/modération distinct. Aucun tiers externe destinataire des données hormis l'hébergeur technique et l'API de géocodage (IGN) sollicitée pour transformer une adresse saisie en coordonnées.

---

## 2. Nécessité et proportionnalité de la collecte de localisation

La finalité affichée — une carte interactive des offres et entreprises — nécessite des coordonnées géographiques exploitables, ce qu'un simple code postal ne permet pas de rendre avec la même précision visuelle. La collecte de `latitude`/`longitude` est donc justifiable **pour cette fonctionnalité précise**.

Deux points de vigilance sur la proportionnalité :

- **Niveau de précision** : le schema conserve à la fois des coordonnées WGS84 et Lambert 93, avec un score de géocodage. Cette double représentation sert la qualité technique de l'affichage cartographique, mais aucune limite de précision (arrondi, floutage) n'est appliquée avant stockage ou affichage — la position résolue est aussi précise que ce que l'API IGN retourne.
- **Granularité du consentement** : `users.localisation` est un booléen unique (activé/désactivé). Il n'existe pas de choix intermédiaire (ex. "ville uniquement" vs "position précise"), alors que la finalité carte pourrait fonctionner avec une précision réduite pour les candidats qui le souhaiteraient.

Le test de proportionnalité brut : si l'affichage carte pouvait se contenter du code postal ou de la ville pour la majorité des usages (recherche "offres près de moi"), la conservation systématique de coordonnées précises pour **tous** les utilisateurs, y compris ceux n'ayant jamais activé `localisation`, dépasserait strictement le nécessaire. Le schema ne semble pas conditionner le remplissage de `addresses.latitude/longitude` à l'activation de ce booléen — à vérifier côté code applicatif.

---

## 3. Risques pour les personnes concernées (état réel du système)

1. **Exposition du domicile d'un chercheur d'emploi.** L'adresse géocodée précise d'un candidat, une fois liée à son profil et affichée à un recruteur (via `users.address_id` → `addresses.latitude/longitude`), expose potentiellement son lieu de résidence réel. Risque de harcèlement, de discrimination géographique dans le tri des candidatures, ou de sécurité physique en cas de recruteur malveillant.

2. **CV en clair, non chiffré au repos.** `users.resume` stocke le CV en base64 dans une colonne texte standard, sans mécanisme de chiffrement distinct visible dans le schema. Une fuite de la base PostgreSQL expose l'intégralité des CV en clair — coordonnées, parcours, potentiellement des informations sensibles indirectes (âge déductible des dates, origine via le nom/parcours).

3. **Traces de connexion conservées au-delà de l'expiration fonctionnelle de la session.** La session expire fonctionnellement après 3 jours (`session.expiresIn`), mais la ligne `session` correspondante (avec `ip_address` et `user_agent`) n'est supprimée par aucun processus tant que le compte utilisateur reste actif — seule la purge globale à 2 ans d'inactivité la retire, par cascade, en même temps que le compte. Un utilisateur actif de longue date peut ainsi accumuler des années d'historique de connexions (IP, user-agent) sans nettoyage intermédiaire.

4. **Purge implémentée mais incomplète sur les données de localisation liées.** Un mécanisme de purge à 2 ans d'inactivité existe désormais (`purgeInactiveUsers`, `archiveOldJobs`, `purgeOldArchives`, orchestrés par `runDailyMaintenance`). La suppression d'un utilisateur inactif entraîne bien, par cascade FK, celle de ses sessions, comptes d'authentification, compétences, expériences et candidatures. En revanche, `addresses` est reliée aux `users`, `companies` et `jobs` via `onDelete: "set null"` — la ligne d'adresse elle-même (avec `latitude`/`longitude`) **n'est jamais supprimée**, seule la référence est mise à `null`. Une adresse géocodée précise peut donc rester en base indéfiniment après suppression du compte qui l'avait créée, orpheline mais toujours présente.

5. **Configuration d'infrastructure actuelle aggravant les risques ci-dessus.** Le trafic HTTP non chiffré en LAN et les identifiants de base de données non renforcés observés dans la configuration de test ne sont pas des risques "RGPD" au sens strict, mais s'ils atteignaient un environnement de production tel quel, ils transformeraient les risques 1 à 3 en risques d'interception ou d'accès non autorisé directement exploitables.

6. **Table d'archive sans contrainte d'intégrité référentielle.** `jobs_archive` duplique `companiesId`, `userId`, `addressId` sans clé étrangère (commentaire du schema : *"pas de FK, la ligne source n'existe plus"*). Cette absence volontaire de contrainte signifie qu'aucune vérification automatique ne garantit que les données archivées restent cohérentes avec le cycle de vie des personnes concernées (ex. un utilisateur supprimé dont les données restent identifiables dans l'archive sans mécanisme de nettoyage lié).

---

## 4. Mesures de réduction retenues

- **`onDelete: "set null"`** sur les relations d'adresse (`companies.address_id`, `users.address_id`, `jobs.address_id`) : évite une suppression en cascade destructive et limite la propagation d'effets de bord lors du retrait d'une adresse.
- **`needs_location_check` + `geocoding_score`** : mécanisme de signalement d'une géolocalisation potentiellement peu fiable, ouvrant la voie à une vérification humaine avant affichage — réduit le risque d'exposer une position incorrecte ou mal résolue.
- **`users.localisation`** : booléen d'opt-in déclaratif pour l'activation de la fonctionnalité de localisation, même si sa granularité reste limitée (cf. section 2).
- **Séparation des responsabilités d'authentification (Better Auth)** : les mots de passe ne transitent jamais en clair côté `users` ; le hash est isolé dans `account.password`, avec `users.password_hash` explicitement marqué comme legacy et non utilisé par le mécanisme actif.
- **Contraintes d'unicité** (`users.email`, `companies` sur `name`+`siret`, `jobs` sur `title`+`companiesId`) : réduisent la duplication de profils et d'entités.
- **`jobs_archive` avec `archived_at` indexé** : base technique déjà en place pour un futur cycle de purge automatisé, même si le déclenchement effectif n'est pas encore implémenté.

---

## 5. Risques résiduels non traités

*(risques identifiés en section 3 pour lesquels aucune mesure de réduction n'existe actuellement, avec la raison de cette absence)*

1. **CV non chiffré au repos (risque 2).** Non traité, car un chiffrement applicatif dédié nécessiterait une gestion de clés et potentiellement un stockage objet séparé (type S3), jugé hors du périmètre du projet actuel (contexte étudiant / MVP). Risque accepté pour la durée du projet, à réévaluer avant toute mise en production réelle.

2. **Données liées non supprimées malgré la purge du compte (risque 4).** Deux angles morts identifiés dans le mécanisme de purge existant : (a) la ligne `addresses` d'un utilisateur supprimé n'est jamais retirée — seule la référence est mise à `null` (`onDelete: "set null"`) — et peut donc persister indéfiniment, orpheline ; (b) aucun nettoyage périodique ne retire les lignes `session` expirées (>3 jours) d'un compte encore actif, elles ne disparaissent qu'au moment de la purge globale à 2 ans. Non traité à ce stade : nécessiterait soit une suppression conditionnelle de l'adresse orpheline, soit un job de nettoyage des sessions expirées indépendant de la purge de compte.

3. **Floutage ou réduction de précision de la position affichée (risque 1).** Non traité : aucun rayon d'anonymisation ni arrondi de coordonnées n'est appliqué avant affichage sur la carte, y compris pour un candidat n'ayant pas encore postulé à l'offre consultée par le recruteur. La précision brute issue du géocodage est celle exposée telle quelle.

4. **Absence de garde-fou empêchant la config de test d'atteindre la production (risque 5).** Les identifiants faibles (`root`/`root`) et le trafic HTTP non chiffré sont volontaires et acceptables dans l'environnement de développement en LAN actuel — ce n'est pas ce risque résiduel lui-même. Le risque non traité est différent : rien dans le projet (pas de séparation de secrets par environnement, pas de vérification automatisée, pas de checklist de mise en production) ne garantit aujourd'hui que cette configuration de test ne soit pas reconduite par erreur si une bascule en production a lieu. Non traité par manque de temps ; à corriger avant toute mise en production réelle (gestion de secrets dédiée, TLS obligatoire, checklist de déploiement).

