import { IsDateString, IsNotEmpty, IsNumber, IsOptional, Max } from "class-validator";
import { IsPositiveAmount } from "lib/utils/validators";

export class CreateTransferDTO {
	@IsNumber()
	@IsNotEmpty()
	idCompteDebit: number;

	@IsNumber()
	@IsNotEmpty()
	idCompteCredit: number;

	@IsNumber()
	@IsNotEmpty()
	@IsPositiveAmount()
	@Max(999999.99)
	montant: number;

	@IsDateString()
	@IsOptional()
	dateVirement?: string;

	@IsNumber()
	@IsOptional()
	idTiers?: number;

	@IsNumber()
	@IsOptional()
	idCategorie?: number;

	constructor(
		idCompteDebit: number,
		idCompteCredit: number,
		montant: number,
		dateVirement?: string,
		idTiers?: number,
		idCategorie?: number
	) {
		this.idCompteDebit = idCompteDebit;
		this.idCompteCredit = idCompteCredit;
		this.montant = montant;
		this.dateVirement = dateVirement;
		this.idTiers = idTiers;
		this.idCategorie = idCategorie;
	}
}

export class TransferResponseDTO {
	idVirement: number;
	idCompteDebit: number;
	idCompteCredit: number;
	montant: number;
	dateVirement: Date;
	dateHeureCreation: Date;
	dateHeureMAJ: Date;
	idTiers?: number;
	idCategorie?: number;

	constructor(
		idVirement: number,
		idCompteDebit: number,
		idCompteCredit: number,
		montant: number,
		dateVirement: Date,
		dateHeureCreation: Date,
		dateHeureMAJ: Date,
		idTiers?: number,
		idCategorie?: number
	) {
		this.idVirement = idVirement;
		this.idCompteDebit = idCompteDebit;
		this.idCompteCredit = idCompteCredit;
		this.montant = montant;
		this.dateVirement = dateVirement;
		this.dateHeureCreation = dateHeureCreation;
		this.dateHeureMAJ = dateHeureMAJ;
		this.idTiers = idTiers;
		this.idCategorie = idCategorie;
	}
}

export class FetchTransfersByAccountIdDTO {
	idCompte: number;

	constructor(idCompte: number) {
		this.idCompte = idCompte;
	}
}

export class FetchTransfersByAccountIdResponseDTO {
	transfers: TransferResponseDTO[];

	constructor(transfers: TransferResponseDTO[]) {
		this.transfers = transfers;
	}
}
