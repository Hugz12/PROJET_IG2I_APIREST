import {
	IsNotEmpty,
	IsNumber,
	IsOptional,
	Max,
	IsDateString,
} from "class-validator";
import { IsLetterDOrC } from "lib/utils/validators";

export class CreateMovementDTO {
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

	@IsOptional()
	@IsLetterDOrC()
		typeMouvement?: string;

	constructor(
		montant: number,
		dateMouvement?: string,
		idTiers?: number,
		idCategorie?: number,
		typeMouvement?: string
	) {
		this.montant = montant;
		this.dateMouvement = dateMouvement;
		this.idTiers = idTiers;
		this.idCategorie = idCategorie;
		this.typeMouvement = typeMouvement;
	}
}

export class MovementResponseDTO {
	idMouvement: number;
	idCompte: number;
	typeMouvement: string;
	montant: number;
	dateMouvement: Date;
	dateHeureCreation: Date;
	dateHeureMAJ: Date;
	idTiers?: number;
	idCategorie?: number;

	constructor(
		idMouvement: number,
		idCompte: number,
		typeMouvement: string,
		montant: number,
		dateMouvement: Date,
		dateHeureCreation: Date,
		dateHeureMAJ: Date,
		idTiers?: number,
		idCategorie?: number
	) {
		this.idMouvement = idMouvement;
		this.idCompte = idCompte;
		this.typeMouvement = typeMouvement;
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
