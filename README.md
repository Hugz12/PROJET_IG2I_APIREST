# Documentation API REST - Projet IG2I

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du projet](#architecture-du-projet)
3. [Installation et configuration](#installation-et-configuration)
4. [Structure de la base de données](#structure-de-la-base-de-données)
5. [API Endpoints](#api-endpoints)
6. [Gestion des erreurs](#gestion-des-erreurs)
7. [Authentification](#authentification)
8. [Tests](#tests)
9. [Déploiement](#déploiement)

## 🎯 Vue d'ensemble

Cette API REST est développée dans le cadre d'un projet à l'IG2I. Elle permet de gérer une application de gestion financière personnelle avec les fonctionnalités suivantes :

- **Gestion des utilisateurs** : inscription, connexion, profil
- **Gestion des comptes bancaires** : création, consultation, modification
- **Gestion des mouvements** : enregistrement des transactions financières
- **Gestion des virements** : transferts entre comptes
- **Gestion des tiers** : contacts/bénéficiaires
- **Gestion des catégories** : classification des transactions

## 🏗️ Architecture du projet

### Stack technique

- **Backend** : Node.js + Express.js + TypeScript
- **Base de données** : MySQL
- **ORM** : MySQL2 (requêtes SQL natives)
- **Authentification** : JWT (JSON Web Tokens)
- **Validation** : class-validator + class-transformer
- **Tests** : Jest
- **Build** : esbuild
- **Containerisation** : Podman/Docker

### Structure des dossiers

```
src/
├── index.ts                 # Point d'entrée de l'application
├── lib/                     # Utilitaires et services
│   ├── services/            # Services métier
│   │   ├── bodyControl.ts   # Validation des corps de requête
│   │   ├── jwt.ts           # Gestion des tokens JWT
│   │   ├── mysql.ts         # Connexion à la base de données
│   │   └── paramControl.ts  # Validation des paramètres
│   └── utils/               # Utilitaires
│       ├── crypt.ts         # Chiffrement des mots de passe
│       └── validators.ts    # Validateurs personnalisés
├── middlewares/             # Middlewares Express
│   ├── auth.ts             # Middleware d'authentification
│   ├── errors.ts           # Gestionnaire d'erreurs
│   ├── json-errors.ts      # Gestion erreurs JSON
│   └── not-found.ts        # Gestion 404
├── routes/                  # Contrôleurs et routes
│   ├── auth/               # Authentification
│   ├── user/               # Gestion utilisateur
│   ├── account/            # Gestion comptes
│   │   ├── movement/       # Mouvements par compte
│   │   └── transfer/       # Virements par compte
│   ├── category/           # Catégories
│   └── third-party/        # Tiers
├── types/                  # Types et interfaces
│   ├── apiError.ts         # Classes d'erreur
│   ├── errorResponses.ts   # Messages d'erreur
│   └── successResponses.ts # Messages de succès
└── tests/                  # Tests unitaires
```

## ⚙️ Installation et configuration

### Prérequis

- Node.js 20+
- Podman ou Docker
- MySQL 8.0+

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration de l'environnement

Créer le fichier `.env` à la racine du projet :

```env
DATABASE_HOST=localhost
DATABASE_USER=IG2I
DATABASE_PASSWORD=motdepasse
DATABASE_NAME=money
DATABASE_PORT=3306
JWT_SECRET=your_secret_key_here
```

### 3. Démarrage de la base de données

```bash
podman-compose up -d
```

### 4. Génération des données de test (optionnel)

```bash
npm run data:generate
```

Cette commande crée un utilisateur de test :

- Login : `hugo.laloy@mail.com`
- Mot de passe : `password123`

### 5. Démarrage en mode développement

```bash
npm run dev
```

### 6. Build pour la production

```bash
npm run build
npm start
```

## 🗄️ Structure de la base de données

### Tables principales

#### Utilisateur

```sql
CREATE TABLE Utilisateur (
    idUtilisateur INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(100) UNIQUE NOT NULL,
    mdp VARCHAR(255) NOT NULL,
    nomUtilisateur VARCHAR(64) NOT NULL,
    prenomUtilisateur VARCHAR(64) NOT NULL,
    ville VARCHAR(128),
    codePostal CHAR(5),
    dateHeureCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateHeureMAJ TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Compte

```sql
CREATE TABLE Compte (
    idCompte INT AUTO_INCREMENT PRIMARY KEY,
    descriptionCompte VARCHAR(100) NOT NULL,
    nomBanque VARCHAR(50) NOT NULL,
    soldeInitial DECIMAL(10,2) NOT NULL,
    dernierSolde DECIMAL(10,2) DEFAULT 0,
    idUtilisateur INT NOT NULL,
    dateHeureCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateHeureMAJ TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (idUtilisateur) REFERENCES Utilisateur(idUtilisateur)
);
```

#### Mouvement

```sql
CREATE TABLE Mouvement (
    idMouvement INT AUTO_INCREMENT PRIMARY KEY,
    idCompte INT NOT NULL,
    typeMouvement CHAR(1) DEFAULT 'D' CHECK (typeMouvement IN ('D', 'C')),
    montant DECIMAL(10,2) NOT NULL,
    dateMouvement DATE NOT NULL,
    dateHeureCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateHeureMAJ TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    idTiers INT,
    idCategorie INT,
    FOREIGN KEY (idCompte) REFERENCES Compte(idCompte),
    FOREIGN KEY (idTiers) REFERENCES Tiers(idTiers),
    FOREIGN KEY (idCategorie) REFERENCES Categorie(idCategorie)
);
```

#### Virement

```sql
CREATE TABLE Virement (
    idVirement INT AUTO_INCREMENT PRIMARY KEY,
    idCompteDebit INT NOT NULL,
    idCompteCredit INT NOT NULL,
    montant DECIMAL(10,2) NOT NULL,
    dateVirement DATE NOT NULL,
    dateHeureCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateHeureMAJ TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    idTiers INT,
    idCategorie INT,
    FOREIGN KEY (idCompteDebit) REFERENCES Compte(idCompte),
    FOREIGN KEY (idCompteCredit) REFERENCES Compte(idCompte)
);
```

## 🔗 API Endpoints

### Authentification (`/auth`)

#### POST `/auth/register`

Inscription d'un nouvel utilisateur.

**Corps de la requête :**

```json
{
	"login": "email@example.com",
	"mdp": "password123",
	"nomUtilisateur": "Dupont",
	"prenomUtilisateur": "Jean",
	"ville": "Paris",
	"codePostal": 75001
}
```

**Réponse (201) :**

```json
{
	"data": {
		"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
	}
}
```

#### POST `/auth/login`

Connexion d'un utilisateur existant.

**Corps de la requête :**

```json
{
	"login": "email@example.com",
	"mdp": "password123"
}
```

**Réponse (200) :**

```json
{
	"data": {
		"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
	}
}
```

### Utilisateurs (`/user`)

_Toutes les routes nécessitent une authentification (header `Authorization: Bearer <token>`)_

#### GET `/user`

Récupère les informations de l'utilisateur connecté.

**Réponse (200) :**

```json
{
	"data": {
		"user": {
			"idUtilisateur": 1,
			"nomUtilisateur": "Dupont",
			"prenomUtilisateur": "Jean",
			"login": "email@example.com",
			"ville": "Paris",
			"codePostal": "75001",
			"dateHeureCreation": "2025-01-01T10:00:00.000Z"
		}
	}
}
```

#### PATCH `/user`

Modifie les informations de l'utilisateur connecté.

**Corps de la requête :**

```json
{
	"nomUtilisateur": "Martin",
	"ville": "Lyon"
}
```

### Comptes (`/account`)

#### GET `/account`

Récupère tous les comptes de l'utilisateur connecté.

#### POST `/account`

Crée un nouveau compte.

**Corps de la requête :**

```json
{
	"descriptionCompte": "Compte courant principal",
	"nomBanque": "BNP Paribas",
	"soldeInitial": 1500.0
}
```

#### GET `/account/:idAccount`

Récupère les détails d'un compte spécifique.

#### PATCH `/account/:idAccount`

Modifie un compte existant.

### Mouvements (`/account/:idAccount/movement`)

#### GET `/account/:idAccount/movement`

Récupère tous les mouvements d'un compte.

#### POST `/account/:idAccount/movement`

Crée un nouveau mouvement sur un compte.

**Corps de la requête :**

```json
{
	"montant": 250.0,
	"dateMouvement": "2025-01-15",
	"typeMouvement": "D",
	"idTiers": 1,
	"idCategorie": 2
}
```

#### GET `/account/:idAccount/movement/:idMovement`

Récupère les détails d'un mouvement spécifique.

### Virements (`/account/:idAccount/transfer`)

#### GET `/account/:idAccount/transfer`

Récupère tous les virements liés à un compte.

#### POST `/account/:idAccount/transfer`

Crée un virement entre deux comptes.

**Corps de la requête :**

```json
{
	"idCompteCredit": 2,
	"montant": 500.0,
	"dateVirement": "2025-01-15",
	"idCategorie": 1
}
```

### Tiers (`/third-party`)

#### GET `/third-party`

Récupère tous les tiers de l'utilisateur.

#### POST `/third-party`

Crée un nouveau tiers.

**Corps de la requête :**

```json
{
	"thirdPartyName": "Supermarché Carrefour"
}
```

#### PATCH `/third-party/:id`

Modifie un tiers existant.

### Catégories (`/category`)

#### GET `/category`

Récupère toutes les catégories et sous-catégories.

**Réponse (200) :**

```json
{
	"data": {
		"categories": [
			{
				"idCategorie": 1,
				"nomCategorie": "Alimentation",
				"dateHeureCreation": "2025-01-01T10:00:00.000Z",
				"dateHeureMAJ": "2025-01-01T10:00:00.000Z",
				"sousCategories": [
					{
						"idSousCategorie": 1,
						"nomSousCategorie": "Supermarché",
						"idCategorie": 1
					}
				]
			}
		]
	}
}
```

## ⚠️ Gestion des erreurs

### Structure d'une réponse d'erreur

```json
{
	"error": {
		"internalCode": "INVALID_CREDENTIALS",
		"message": "Invalid username or password."
	}
}
```

### Erreurs de validation de champs

```json
{
	"error": {
		"internalCode": "INVALID_BODY",
		"message": "The request body is invalid.",
		"fieldErrors": [
			{
				"property": "email",
				"constraints": {
					"isEmail": "email must be an email"
				}
			}
		]
	}
}
```

### Codes d'erreur principaux

- `400 BAD_REQUEST` : Requête invalide
- `401 UNAUTHORIZED` : Non authentifié
- `401 INVALID_TOKEN` : Token invalide ou manquant
- `404 NOT_FOUND` : Ressource non trouvée
- `409 DUPLICATE_EMAIL` : Email déjà utilisé
- `500 SERVER_ERROR` : Erreur serveur interne

## 🔐 Authentification

L'API utilise l'authentification JWT (JSON Web Tokens).

### Obtention d'un token

Utilisez les endpoints `/auth/register` ou `/auth/login` pour obtenir un token.

### Utilisation du token

Incluez le token dans l'header `Authorization` de vos requêtes :

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Structure du payload JWT

```json
{
	"idUtilisateur": 1,
	"login": "email@example.com",
	"iat": 1640995200,
	"exp": 1640998800
}
```

## 🧪 Tests

### Lancement des tests

```bash
# Tests unitaires
npm test

# Tests en mode watch
npm run test:watch
```

### Structure des tests

```
src/tests/
├── middlewares/         # Tests des middlewares
├── routes/             # Tests des routes
└── setup.ts            # Configuration des tests
```

### Coverage

Consultez le fichier `doc/tests.md` pour comprendre le rapport de couverture Jest.

## 📦 Déploiement

### Build de production

```bash
npm run build
```

Cette commande génère un bundle optimisé dans `dist/bundle.js`.

### Variables d'environnement de production

Assurez-vous de configurer les variables suivantes :

- `DATABASE_HOST`
- `DATABASE_USER`
- `DATABASE_PASSWORD`
- `DATABASE_NAME`
- `DATABASE_PORT`
- `JWT_SECRET` (utilisez une clé forte en production)

### Démarrage en production

```bash
npm start
```

## 🔧 Scripts npm disponibles

- `npm run dev` : Démarrage en mode développement avec rechargement automatique
- `npm run build` : Build de production avec esbuild
- `npm start` : Démarrage de l'application buildée
- `npm test` : Lancement des tests
- `npm run test:watch` : Tests en mode watch
- `npm run data:generate` : Génération de données de test

## 📚 Ressources supplémentaires

### Outils de développement recommandés

- **Postman/Insomnia** : Tests d'API
- **MySQL Workbench** : Administration de la base de données
- **VS Code** : Éditeur avec extensions TypeScript

### Extensions VS Code utiles

- TypeScript Hero
- REST Client
- MySQL
- Jest Runner

### Bonnes pratiques

1. Toujours valider les entrées utilisateur
2. Utiliser les types TypeScript appropriés
3. Gérer les erreurs de manière cohérente
4. Documenter les nouvelles routes
5. Écrire des tests pour les nouvelles fonctionnalités
