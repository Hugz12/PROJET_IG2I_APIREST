import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, IsNumber } from 'class-validator';
import { IsValidPostalCode } from '../common/validators';

export class UpdateUserDTO {
    @IsString() @IsNotEmpty() @MaxLength(50)
    nomUtilisateur: string;

    @IsString() @IsNotEmpty() @MaxLength(50)
    prenomUtilisateur: string;

    @IsEmail() @IsOptional()
    login?: string;

    @IsString() @IsOptional() @MinLength(8) @MaxLength(64)
    mdp?: string;

    @IsString() @IsOptional() @MaxLength(50)
    ville?: string;

    @IsNumber() @IsOptional() @IsValidPostalCode()
    codePostal?: number;

    constructor(nomUtilisateur: string, prenomUtilisateur: string, login?: string, mdp?: string, ville?: string, codePostal?: number) {
        this.nomUtilisateur = nomUtilisateur;
        this.prenomUtilisateur = prenomUtilisateur;
        this.login = login;
        this.mdp = mdp;
        this.ville = ville;
        this.codePostal = codePostal;
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
