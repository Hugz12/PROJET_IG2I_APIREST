// create serviceCreateMovement, serviceFetchMovementsByAccountId in service.ts
import { getConnection } from "lib/services/mysql";
import { ApiError } from "types/apiError";
import { ErrorResponses } from "types/errorResponses";
import { CreateMovementDTO, MovementResponseDTO } from "./schema";

export async function serviceCreateMovement(movement: CreateMovementDTO, userId: number): Promise<MovementResponseDTO> {
	// Start MySQL connection
	const connection = await getConnection();

	try {
		// Verify that the account belongs to the user
		const [accountCheck]: any = await connection.query(
			`SELECT COUNT(*) as count FROM Compte WHERE idCompte = ? AND idUtilisateur = ?`,
			[movement.idCompte, userId]
		);

		if (accountCheck[0].count === 0) {
			throw new ApiError(ErrorResponses.UNAUTHORIZED);
		}

		// Insert the movement into the database
		const result: any = await connection.query(
			`INSERT INTO Mouvement (idCompte, description, montant, dateMouvement, idTiers, idCategorie)
             VALUES (?, ?, ?, ?, ?, ?)`,
			[
				movement.idCompte,
				movement.description,
				movement.montant,
				movement.dateMouvement || new Date(),
				movement.idTiers || null,
				movement.idCategorie || null,
			]
		);

		const idMouvement = result.insertId;

		return new MovementResponseDTO(
			idMouvement,
			movement.idCompte,
			movement.description,
			movement.montant,
			new Date(movement.dateMouvement || new Date()),
			new Date(),
			new Date(),
			movement.idTiers,
			movement.idCategorie
		);
	} finally {
		connection.release();
	}
}

export async function serviceFetchMovementsByAccountId(
	idCompte: number,
	userId: number,
	idMovement?: number
): Promise<MovementResponseDTO[] | MovementResponseDTO> {
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

		if (idMovement) {
			// Fetch specific movement
			const [results]: any = await connection.query(`SELECT * FROM Mouvement WHERE idCompte = ? AND idMouvement = ?`, [
				idCompte,
				idMovement,
			]);

			if (results.length === 0) {
				throw new ApiError(ErrorResponses.NOT_FOUND);
			}

			const result = results[0];
			return new MovementResponseDTO(
				result.idMouvement,
				result.idCompte,
				result.description,
				result.montant,
				new Date(result.dateMouvement),
				new Date(result.dateHeureCreation),
				new Date(result.dateHeureMAJ),
				result.idTiers,
				result.idCategorie
			);
		} else {
			// Fetch all movements for the account
			const [results]: any = await connection.query(
				`SELECT * FROM Mouvement WHERE idCompte = ? ORDER BY dateMouvement DESC`,
				[idCompte]
			);

			return results.map(
				(result: any) =>
					new MovementResponseDTO(
						result.idMouvement,
						result.idCompte,
						result.description,
						result.montant,
						new Date(result.dateMouvement),
						new Date(result.dateHeureCreation),
						new Date(result.dateHeureMAJ),
						result.idTiers,
						result.idCategorie
					)
			);
		}
	} finally {
		connection.release();
	}
}
