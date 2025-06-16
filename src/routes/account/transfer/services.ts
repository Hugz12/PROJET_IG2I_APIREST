import { getConnection } from "lib/services/mysql";
import {
	CreateTransferDTO,
	TransferResponseDTO,
} from "routes/account/transfer/schema";

export async function serviceCreateTransfer(
	transfer: CreateTransferDTO
): Promise<TransferResponseDTO> {
	// Start MySQL connection
	const connection = await getConnection();

	try {
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
