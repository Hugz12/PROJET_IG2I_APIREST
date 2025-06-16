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

## Test

La commande `npm run data:generate` permet de générer des données d'exemples.
Elle crée également un compte de test:
```
{
    "login":"hugo.laloy@mail.com",
    "mdp":"password123"
}
```

## ToDo

Il faut implémenter les routes suivantes :

```
/auth :
    /register - POST : Create user
    /login - POST : Connect user (give token)
    /logout - GET : Delete token
/account : 
    /:idAccount 
        / - GET : Fetch user’s account data
/movement : 
    / - GET : Fetch all user movements
    / - POST : Create a new movement
    /:idMovement - GET : Fetch movement details
        / - GET : Fetch movement details
/transfer : 
    / - GET : Fetch user related transfer infos
    / - POST : Transfer between two user account 
/third-party : 
    / - GET : Fetch all third parties associated to an user
    / - POST : Create Third Party
    / - PATCH : Update Third Party
/category : 
    / - GET : Fetch all categories and subcategories
```