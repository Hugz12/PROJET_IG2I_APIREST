import { IsEmail, IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from "class-validator";
import { IsValidPostalCode } from "lib/utils/validators";

export class RegisterDTO {
    @IsEmail() @IsNotEmpty()
    login: string;

    @IsString() @IsNotEmpty() @MinLength(8) @MaxLength(64)
    mdp: string;

    @IsString() @IsNotEmpty() @MaxLength(64)
    nomUtilisateur: string;

    @IsString() @IsNotEmpty() @MaxLength(64)
    prenomUtilisateur: string;

    @IsString() @IsNotEmpty() @MaxLength(128)
    ville: string;

    @IsNumber() @IsNotEmpty() @IsValidPostalCode()
    codePostal: number;


    constructor(login: string, mdp: string, nomUtilisateur: string, prenomUtilisateur: string, ville: string, codePostal: number) {
    	this.login = login;
    	this.mdp = mdp;
    	this.nomUtilisateur = nomUtilisateur;
    	this.prenomUtilisateur = prenomUtilisateur;
    	this.ville = ville;
    	this.codePostal = codePostal;
    }
}

export class LoginDTO {
    @IsEmail() @IsNotEmpty()
    login: string;

    @IsString() @IsNotEmpty() @MinLength(8) @MaxLength(64)
    mdp: string;

    constructor(login: string, mdp: string) {
    	this.login = login;
    	this.mdp = mdp;
    }
}

export class LoginResponseDTO {
    token: string;
    user: {
        idUtilisateur: number;
        nomUtilisateur: string;
        prenomUtilisateur: string;
        login: string;
        ville?: string;
        codePostal?: string;
    };

    constructor(
    	token: string,
    	idUtilisateur: number,
    	nomUtilisateur: string,
    	prenomUtilisateur: string,
    	login: string,
    	ville?: string,
    	codePostal?: string
    ) {
    	this.token = token;
    	this.user = {
    		idUtilisateur,
    		nomUtilisateur,
    		prenomUtilisateur,
    		login,
    		ville,
    		codePostal
    	};
    }
}

export class RegisterResponseDTO {
    message: string;
    user: {
        idUtilisateur: number;
        nomUtilisateur: string;
        prenomUtilisateur: string;
        login: string;
        ville?: string;
        codePostal?: string;
    };

    constructor(
    	message: string,
    	idUtilisateur: number,
    	nomUtilisateur: string,
    	prenomUtilisateur: string,
    	login: string,
    	ville?: string,
    	codePostal?: string
    ) {
    	this.message = message;
    	this.user = {
    		idUtilisateur,
    		nomUtilisateur,
    		prenomUtilisateur,
    		login,
    		ville,
    		codePostal
    	};
    }
}

export class LogoutResponseDTO {
    message: string;

    constructor(message: string) {
    	this.message = message;
    }
}
