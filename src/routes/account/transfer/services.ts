import { getConnection } from "lib/services/mysql";
import { ApiError } from "types/apiError";
import { ErrorResponses } from "types/errorResponses";
import { CreateTransferDTO, TransferResponseDTO } from "routes/account/transfer/schema";

export async function serviceCreateTransfer(transfer: CreateTransferDTO, userId: number): Promise<TransferResponseDTO> {
	// Start MySQL connection
	const connection = await getConnection();

	try {
		// Verify that both accounts belong to the user
		const [accountCheck]: any = await connection.query(
			`SELECT COUNT(*) as count FROM Compte 
			 WHERE (idCompte = ? OR idCompte = ?) AND idUtilisateur = ?`,
			[transfer.idCompteDebit, transfer.idCompteCredit, userId]
		);

		if (accountCheck[0].count < 2) {
			throw new ApiError(ErrorResponses.UNAUTHORIZED);
		}

		// Insert the transfer into the database
		const result: any = await connection.query(
			`INSERT INTO Virement (idCompteDebit, idCompteCredit, montant, dateVirement, idTiers, idCategorie)
             VALUES (?, ?, ?, ?, ?, ?)`,
			[
				transfer.idCompteDebit,
				transfer.idCompteCredit,
				transfer.montant,
				transfer.dateVirement || new Date(),
				transfer.idTiers || null,
				transfer.idCategorie || null,
			]
		);

		const idVirement = result.insertId;

		return new TransferResponseDTO(
			idVirement,
			transfer.idCompteDebit,
			transfer.idCompteCredit,
			transfer.montant,
			new Date(transfer.dateVirement || new Date()),
			new Date(),
			new Date()
		);
	} finally {
		connection.release();
	}
}

export async function serviceFetchTransfersByAccountId(
	idCompte: number,
	userId: number
): Promise<TransferResponseDTO[]> {
	// Start MySQL connection
	const connection = await getConnection();

	try {
		// Verify that the account belongs to the user
		const [accountCheck]: any = await connection.query(
			`SELECT COUNT(*) as count FROM Compte WHERE idCompte = ? AND idUtilisateur = ?`,
			[idCompte, userId]
		);

		if (accountCheck[0].count === 0) {
			throw new ApiError(ErrorResponses.UNAUTHORIZED);
		}

		// Fetch transfers for the given account ID
		const [results]: any = await connection.query(
			`SELECT * FROM Virement WHERE idCompteDebit = ? OR idCompteCredit = ?`,
			[idCompte, idCompte]
		);

		return results.map(
			(result: any) =>
				new TransferResponseDTO(
					result.idVirement,
					result.idCompteDebit,
					result.idCompteCredit,
					result.montant,
					new Date(result.dateVirement),
					new Date(result.dateHeureCreation),
					new Date(result.dateHeureMAJ),
					result.idTiers,
					result.idCategorie
				)
		);
	} finally {
		connection.release();
	}
}
