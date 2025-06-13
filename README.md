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

## ToDo

Il faut implémenter les routes suivantes :

```
/user : 
    / - GET : Fetch user data
    / - PUT : Edit user data
    / - DELETE : Delete user data
/auth :
    /register - POST : Create user
    /login - POST : Connect user (give token)
    /logout - GET : Delete token
/account : 
    /:idAccount 
        / - GET : Fetch user’s account data
/movement : 
    / - GET : Fetch all user movements
    /:idMovement - GET : Fetch movement details
        / - POST : Create a new movement
        / - GET : Search user’s accounts
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