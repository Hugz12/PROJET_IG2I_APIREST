// create serviceCreateMovement, serviceFetchMovementsByAccountId in service.ts
import { getConnection } from "lib/services/mysql";
import { ApiError } from "types/apiError";
import { ErrorResponses } from "types/errorResponses";
import { CreateMovementDTO, MovementResponseDTO } from "./schema";

export async function serviceCreateMovement(movement: CreateMovementDTO, idCompte: number, userId: number): Promise<{ movement: MovementResponseDTO }> {
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

		// Validate if the category or third party exists if provided
		if (movement.idCategorie) {
			const [categoryCheck]: any = await connection.query(
				`SELECT COUNT(*) as count FROM Categorie WHERE idCategorie = ?`,
				[movement.idCategorie]
			);
			if (categoryCheck[0].count === 0) {
				throw new ApiError(ErrorResponses.CATEGORY_NOT_FOUND);
			}
		}

		// Insert the movement into the database
		const [insertResult]: any = await connection.query(
			`INSERT INTO Mouvement (idCompte, montant, dateMouvement, idTiers, idCategorie, typeMouvement)
             VALUES (?, ?, ?, ?, ?, ?)`,
			[
				idCompte,
				movement.montant,
				movement.dateMouvement || new Date(),
				movement.idTiers || null,
				movement.idCategorie || null,
				movement.typeMouvement || "D" // Default to "D" for debit
			]
		);

		// Check if the insertion was successful
		if (insertResult.affectedRows === 0) {
			throw new ApiError(ErrorResponses.MOVEMENT_CREATION_FAILED);
		}

		// Get the newly created movement's ID
		const idMouvement = insertResult.insertId;

		// Fetch the complete movement details
		const [movementResult]: any = await connection.query(
			`SELECT * FROM Mouvement WHERE idMouvement = ?`,
			[idMouvement]
		);

		// Check if the movement was found
		if (movementResult.length === 0) {
			throw new ApiError(ErrorResponses.NOT_FOUND);
		}

		return {
			movement: new MovementResponseDTO(
				movementResult[0].idMouvement,
				movementResult[0].idCompte,
				movementResult[0].typeMouvement,
				movementResult[0].montant,
				new Date(movementResult[0].dateMouvement),
				new Date(movementResult[0].dateHeureCreation),
				new Date(movementResult[0].dateHeureMAJ),
				movementResult[0].idTiers || null,
				movementResult[0].idCategorie || null
			)
		};
	} finally {
		connection.release();
	}
}

export async function serviceFetchMovementsByAccountId(
	idCompte: number,
	userId: number,
	idMovement?: number
): Promise<{ movement: MovementResponseDTO | MovementResponseDTO[] }> {
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
			const [result]: any = await connection.query(`SELECT * FROM Mouvement WHERE idCompte = ? AND idMouvement = ?`, [
				idCompte,
				idMovement,
			]);

			if (result.length === 0) {
				throw new ApiError(ErrorResponses.NOT_FOUND);
			}
			
			return {
				movement: new MovementResponseDTO(
					result[0].idMouvement,
					result[0].idCompte,
					result[0].typeMouvement,
					result[0].montant,
					new Date(result[0].dateMouvement),
					new Date(result[0].dateHeureCreation),
					new Date(result[0].dateHeureMAJ),
					result[0].idTiers,
					result[0].idCategorie
				)
			};
		} else {
			// Fetch all movements for the account
			const [results]: any = await connection.query(
				`SELECT * FROM Mouvement WHERE idCompte = ? ORDER BY dateMouvement DESC`,
				[idCompte]
			);

			return {
				movement: results.map(
				(result: any) =>
					new MovementResponseDTO(
						result.idMouvement,
						result.idCompte,
						result.typeMouvement,
						result.montant,
						new Date(result.dateMouvement),
						new Date(result.dateHeureCreation),
						new Date(result.dateHeureMAJ),
						result.idTiers,
						result.idCategorie
					)
			)};
		}
	} finally {
		connection.release();
	}
}