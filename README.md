# Projet

Projet IG2I ApiREST

## Installation

Créer le fichier .env avec ces informations :
```sh
DATABASE_HOST=localhost
DATABASE_USER=IG2I
DATABASE_PASSWORD=motdepasse
DATABASE_NAME=money
DATABASE_PORT=3306
JWT_TOKEN=key
```

Executer ces commandes :
```sh
podman-compose up -d
npm install
npm run dev
```