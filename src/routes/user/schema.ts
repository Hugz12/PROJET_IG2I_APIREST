import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, IsNumber } from "class-validator";
import { IsValidPostalCode } from "lib/utils/validators";

export class UpdateUserDTO {
    @IsEmail() @IsOptional()
    login?: string;

    @IsString() @IsOptional() @MinLength(8) @MaxLength(64)
    mdp?: string;

    @IsString() @IsOptional() @MaxLength(50)
    ville?: string;

    @IsNumber() @IsOptional() @IsValidPostalCode()
    codePostal?: number;

    @IsString() @IsOptional() @MaxLength(50) @IsNotEmpty()
    nomUtilisateur?: string;

    @IsString() @IsOptional() @MaxLength(50) @IsNotEmpty()
    prenomUtilisateur?: string;

    constructor(nomUtilisateur: string, prenomUtilisateur: string, login?: string, mdp?: string, ville?: string, codePostal?: number) {
    	this.login = login;
    	this.mdp = mdp;
    	this.ville = ville;
    	this.codePostal = codePostal;
    	this.nomUtilisateur = nomUtilisateur;
    	this.prenomUtilisateur = prenomUtilisateur;
    }
}

export class UserResponseDTO {
    idUtilisateur: number;
    nomUtilisateur: string;
    prenomUtilisateur: string;
    login: string;
    ville?: string;
    codePostal?: string;
    dateHeureCreation: Date;
    dateHeureMAJ?: Date;

    constructor(idUtilisateur: number, nomUtilisateur: string, prenomUtilisateur: string, login: string, ville?: string, codePostal?: string, dateHeureCreation?: Date, dateHeureMAJ?: Date) {
    	this.idUtilisateur = idUtilisateur;
    	this.nomUtilisateur = nomUtilisateur;
    	this.prenomUtilisateur = prenomUtilisateur;
    	this.login = login;
    	this.ville = ville;
    	this.codePostal = codePostal;
    	this.dateHeureCreation = dateHeureCreation || new Date();
    	this.dateHeureMAJ = dateHeureMAJ;
    }
}
