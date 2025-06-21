import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength, IsOptional, Min } from "class-validator";

export class CreateAccountDTO {
	@IsString()
	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(100)
	descriptionCompte: string;

	@IsString()
	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(50)
	nomBanque: string;

	@IsNumber()
	@IsNotEmpty()
	@Min(0)
	soldeInitial: number;

	constructor(descriptionCompte: string, nomBanque: string, soldeInitial: number) {
		this.descriptionCompte = descriptionCompte;
		this.nomBanque = nomBanque;
		this.soldeInitial = soldeInitial;
	}
}

export class UpdateAccountDTO {
	@IsString()
	@IsOptional()
	@MinLength(3)
	@MaxLength(100)
	descriptionCompte?: string;

	@IsString()
	@IsOptional()
	@MinLength(3)
	@MaxLength(50)
	nomBanque?: string;

	constructor(descriptionCompte?: string, nomBanque?: string) {
		this.descriptionCompte = descriptionCompte;
		this.nomBanque = nomBanque;
	}
}

export class AccountResponseDTO {
	idCompte: number;
	descriptionCompte: string;
	nomBanque: string;
	soldeInitial: number;
	soldeActuel: number;
	idUtilisateur: number;
	dateHeureCreation: Date;
	dateHeureMAJ: Date;

	constructor(
		idCompte: number,
		descriptionCompte: string,
		nomBanque: string,
		soldeInitial: number,
		soldeActuel: number,
		idUtilisateur: number,
		dateHeureCreation: Date,
		dateHeureMAJ: Date
	) {
		this.idCompte = idCompte;
		this.descriptionCompte = descriptionCompte;
		this.nomBanque = nomBanque;
		this.soldeInitial = soldeInitial;
		this.soldeActuel = soldeActuel;
		this.idUtilisateur = idUtilisateur;
		this.dateHeureCreation = dateHeureCreation;
		this.dateHeureMAJ = dateHeureMAJ;
	}
}
