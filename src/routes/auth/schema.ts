import { IsEmail, IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';

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

    @IsNumber() @IsNotEmpty()
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