# Fiche de registre des activités de traitement
Valide uniquement sur les version ce basant sur le schéma du commit: [36d44e9b630dad585cd4ae56e50691842486d9f7](https://github.com/TsukiNi22/chomage-go/commit/36d44e9b630dad585cd4ae56e50691842486d9f7)

---

## 1. Finalité du traitement

Gestion des comptes utilisateurs (candidats et employeurs), constitution de profils professionnels, publication d'offres d'emploi et gestion des candidatures.

---

## 2. Base légale

**Exécution du contrat** (art. 6.1.b RGPD) : la création d'un compte et son usage (profil, candidature, publication d'offre) sont nécessaires à la fourniture du service demandé par l'utilisateur.

⚠️ **Point de vigilance** : les choix et consentements de l'utilisateur sont actuellement stockés localement dans le navigateur, notamment via le `localStorage`. Les consentements sont associés à une date de réponse ainsi qu'à la réponse donnée par l'utilisateur, permettant de conserver la trace de ses choix au niveau de sa session/navigateur.

---

## 3. Données collectées, table et colonne de stockage

| Donnée                                       | Table.colonne                                                                                                                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nom d'affichage                              | `users.name`                                                                                                                                                                                |
| Prénom                                       | `users.firstname`                                                                                                                                                                           |
| Nom                                          | `users.lastname`                                                                                                                                                                            |
| Email de connexion                           | `users.email`                                                                                                                                                                               |
| Email de contact (facultatif, distinct)      | `users.email_contact`                                                                                                                                                                       |
| Statut de vérification email                 | `users.email_verified`                                                                                                                                                                      |
| Mot de passe (hash)                          | `account.password` (mécanisme actif, Better Auth) — `users.password_hash` existe aussi en base mais est indiqué comme legacy et n'est plus le champ utilisé par l'authentification actuelle |
| Adresse postale saisie librement             | `users.address`                                                                                                                                                                             |
| Adresse postale normalisée                   | `addresses.label`, `addresses.street`, `addresses.postal_code`, `addresses.city`, `addresses.country_code`                                                                                  |
| Coordonnées géographiques de l'adresse       | `addresses.latitude`, `addresses.longitude`                                                                                                                                                 |
| Coordonnées Lambert 93                       | `addresses.lambert_x`, `addresses.lambert_y`                                                                                                                                                |
| Source et informations de géocodage          | `addresses.geocoding_source`, `addresses.geocoding_score`, `addresses.geocoded_at`                                                                                                          |
| Indicateur de vérification de localisation   | `addresses.needs_location_check`                                                                                                                                                            |
| Rattachement de l'utilisateur à une adresse  | `users.address_id`                                                                                                                                                                          |
| Description libre (bio/profil)               | `users.description`                                                                                                                                                                         |
| CV                                           | `users.resume` (fichier encodé en base64)                                                                                                                                                   |
| Indicateur de localisation                   | `users.localisation` (booléen indiquant l'activation de la fonctionnalité de localisation)                                                                                                  |
| Rôle du compte                               | `users.rank` (0 admin, 1 employeur, 2 candidat)                                                                                                                                             |
| Rattachement à une entreprise                | `users.companies_id`                                                                                                                                                                        |
| Date de validation employeur                 | `users.allowed_at`                                                                                                                                                                          |
| Date de création / mise à jour du compte     | `users.created_at`, `users.updated_at`                                                                                                                                                      |
| Session de connexion                         | `session.token`, `session.expires_at`                                                                                                                                                       |
| Adresse IP de connexion                      | `session.ip_address`                                                                                                                                                                        |
| User-agent du navigateur                     | `session.user_agent`                                                                                                                                                                        |
| Date de création / mise à jour de la session | `session.created_at`, `session.updated_at`                                                                                                                                                  |
| Jeton de vérification / réinitialisation     | `verification.identifier`, `verification.value`, `verification.expires_at`                                                                                                                  |
| Date de création du jeton de vérification    | `verification.created_at`                                                                                                                                                                   |
| Identifiant du compte d'authentification     | `account.account_id`                                                                                                                                                                        |
| Fournisseur d'authentification               | `account.provider_id`, `account.issuer`                                                                                                                                                     |
| Jetons d'accès / d'identité éventuels        | `account.access_token`, `account.refresh_token`, `account.id_token`                                                                                                                         |
| Date d'expiration des jetons                 | `account.access_token_expires_at`, `account.refresh_token_expires_at`                                                                                                                       |
| Périmètre d'accès du compte                  | `account.scope`                                                                                                                                                                             |
| Compétences déclarées                        | `user_skills.name`, `user_skills.description`                                                                                                                                               |
| Expériences professionnelles                 | `experience.name`, `experience.description`, `experience.type`, `experience.part_time`, `experience.start`, `experience.end`                                                                |
| Entreprise associée à une expérience         | `experience.companies_id`                                                                                                                                                                   |
| Disponibilités déclarées                     | `availability.title`, `availability.type`, `availability.part_time`, `availability.start`, `availability.end`                                                                               |
| Données d'entreprise                         | `companies.name`, `companies.siret`, `companies.description`, `companies.link`, `companies.employee_range`                                                                                  |
| Adresse de l'entreprise                      | `companies.address_id`                                                                                                                                                                      |
| Offres publiées                              | `jobs.title`, `jobs.description`, `jobs.type`, `jobs.salary_min`, `jobs.salary_max`, `jobs.created_at`                                                                                      |
| Auteur de l'offre                            | `jobs.user_id`                                                                                                                                                                              |
| Entreprise de l'offre                        | `jobs.companies_id`                                                                                                                                                                         |
| Adresse du lieu de l'offre                   | `jobs.address_id`                                                                                                                                                                           |
| Compétences requises par offre               | `job_skills.name`, `job_skills.description`                                                                                                                                                 |
| Lien candidat ↔ offre                        | `applications.job_id`, `applications.user_id`                                                                                                                                               |
| Message / lettre de motivation               | `applications.description`                                                                                                                                                                  |
| Identifiant de la candidature                | `applications.id`                                                                                                                                                                           |
| Identifiant de l'utilisateur                 | `users.id`                                                                                                                                                                                  |
| Identifiant de l'entreprise                  | `companies.id`                                                                                                                                                                              |
| Identifiant de l'adresse                     | `addresses.id`                                                                                                                                                                              |

---

## 4. Durée de conservation

**État réel du code** : aucune purge automatique n'est encore implémentée pour les données utilisateur.

État voulue : dans un future proche une implementation suprimant **TOUTES** les données des utilisateurs inatif pendant plus de `2 ans` sera implementer (PAS IMPLEMENTER POUR LE MOMENT!!!)

---

## 5. Destinataires

**Internes** : aucun rôle applicatif distinct de type "support" ou "modération" n'est implémenté actuellement — seul le rôle `users.rank = 0` (admin) existe comme niveau d'accès différencié côté données.

**Externes** : aucune intégration avec un service tiers (emailing, paiement, analytics, stockage externe) n'apparaît dans le schéma ou le code. Seul destinataire technique (stockage de données) : l'hébergeur de l'infrastructure (base PostgreSQL/conteneurs).

---

## 6. Ce qui n'est PAS collecté

- Numéro de téléphone
- Date de naissance / âge
- Numéro de sécurité sociale ou identifiant national
- Données bancaires ou de paiement
- Photo ou avatar
- Données biométriques
- Données de navigation/analytics au-delà de l'IP et du user-agent liés à la session de connexion (pas de tracking comportemental, pas de cookies tiers)
- Historique des recherches ou du comportement de navigation sur la plateforme
