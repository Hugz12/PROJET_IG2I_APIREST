import {
	IsNotEmpty,
	IsNumber,
	IsString,
	MaxLength,
	MinLength,
	IsOptional,
	Min,
	Max,
	IsDateString,
} from "class-validator";

export class CreateMovementDTO {
	@IsNumber()
	@IsNotEmpty()
	idCompte: number;

	@IsString()
	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(100)
	description: string;

	@IsNumber()
	@IsNotEmpty()
	@Max(999999.99)
	montant: number;

	@IsDateString()
	@IsOptional()
	dateMouvement?: string;

	@IsNumber()
	@IsOptional()
	idTiers?: number;

	@IsNumber()
	@IsOptional()
	idCategorie?: number;

	constructor(
		idCompte: number,
		description: string,
		montant: number,
		dateMouvement?: string,
		idTiers?: number,
		idCategorie?: number
	) {
		this.idCompte = idCompte;
		this.description = description;
		this.montant = montant;
		this.dateMouvement = dateMouvement;
		this.idTiers = idTiers;
		this.idCategorie = idCategorie;
	}
}

export class MovementResponseDTO {
	idMouvement: number;
	idCompte: number;
	description: string;
	montant: number;
	dateMouvement: Date;
	dateHeureCreation: Date;
	dateHeureMAJ: Date;
	idTiers?: number;
	idCategorie?: number;

	constructor(
		idMouvement: number,
		idCompte: number,
		description: string,
		montant: number,
		dateMouvement: Date,
		dateHeureCreation: Date,
		dateHeureMAJ: Date,
		idTiers?: number,
		idCategorie?: number
	) {
		this.idMouvement = idMouvement;
		this.idCompte = idCompte;
		this.description = description;
		this.montant = montant;
		this.dateMouvement = dateMouvement;
		this.dateHeureCreation = dateHeureCreation;
		this.dateHeureMAJ = dateHeureMAJ;
		this.idTiers = idTiers;
		this.idCategorie = idCategorie;
	}
}

export class FetchMovementsByAccountIdResponseDTO {
	movements: MovementResponseDTO[];

	constructor(movements: MovementResponseDTO[]) {
		this.movements = movements;
	}
}
