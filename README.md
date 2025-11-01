DEXCHANGE – Mini API de gestion de transferts (NestJS)
Objectif
Ce projet est une mini-API développée avec NestJS pour gérer des transferts financiers, incluant :

Authentification par API Key

Règles métier (frais, statuts, transitions)

Simulation de traitement

CRUD partiel

Pagination & filtres

Logs d’audit

Documentation Swagger

Tests unitaires

Durée cible : 6–8h Stack : NestJS + TypeScript + base de données in-memory

Installation & Setup
bash
# Cloner le repo
git clone https://github.com/iboupapi/dexchange-backend.git
cd dexchange-backend

# Installer les dépendances
npm install

# Lancer l'application
npm run start:dev
Authentification
Tous les endpoints sont protégés par une API Key :

Header requis : x-api-key: <clé>

Clé stockée en mémoire (dans le code ou via variable d’environnement)

Réponses :

401 Unauthorized → clé absente

403 Forbidden → clé invalide

Endpoints principaux
1. Créer un transfert
POST /transfers

Payload :

json
{
  "amount": 12500,
  "currency": "XOF",
  "channel": "WAVE",
  "recipient": { "phone": "+221770000000", "name": "Jane Doe" },
  "metadata": { "orderId": "ABC-123" }
}
Statut initial : PENDING

Référence générée : TRF-YYYYMMDD-XXXX

Frais : 0.8% arrondi au supérieur, min 100, max 1500

Audit : TRANSFER_CREATED

2. Lister les transferts
GET /transfers

Filtres :

status, channel

minAmount, maxAmount

q (recherche dans reference ou recipient.name)

Pagination : cursor-based Query : limit, cursor

3. Récupérer un transfert
GET /transfers/:id → 404 si non trouvé

4. Simuler le traitement
POST /transfers/:id/process

Transitions :

PENDING → PROCESSING → SUCCESS | FAILED

Simulation :

70% → SUCCESS + provider_ref

30% → FAILED + error_code

Erreurs :

Si statut final → 409 Conflict

Audit :

TRANSFER_PROCESSING, TRANSFER_SUCCESS, TRANSFER_FAILED

5. Annuler un transfert
POST /transfers/:id/cancel

Seul PENDING peut être annulé

Sinon → 409 Conflict

Audit : TRANSFER_CANCELED

Tests unitaires
Calcul des frais

Transition d’état (PENDING → PROCESSING → SUCCESS/FAILED)

bash
npm run test
Swagger
Accessible à : http://localhost:3000/docs

Documente :

Tous les endpoints

Headers requis (x-api-key)

Payloads d’exemple

Structure du projet
Code
src/
  common/
    guards/api-key.guard.ts
  transfers/
    dto/
    entities/
    transfers.controller.ts
    transfers.service.ts
    transfers.repository.ts  ← stockage in-memory
    provider.simulator.ts
  audit/
    audit.service.ts
main.ts
Fichiers utiles
.env.example : variables d’environnement (clé API, port, etc.)

Choix techniques
Stockage en mémoire via tableau local (transfers: Transfer[])

Architecture modulaire NestJS

Validation avec class-validator

Simulation via setTimeout pour rendre le traitement réaliste

Audit centralisé via AuditService

Pagination cursor-based pour scalabilité

Ce que je ferais avec plus de temps
Persistance réelle avec MongoDB ou Postgres

Intégration d’un vrai provider externe (Wave, Orange Money)

Séparation des adapters par canal

Authentification OAuth ou JWT

Tests e2e

Interface admin pour visualiser les transferts