import { getConnection } from "lib/services/mysql";
import { ApiError } from "types/apiError";
import { ErrorResponses } from "types/errorResponses";
import { hashPassword } from "lib/utils/crypt";
import { UpdateUserDTO, UserResponseDTO } from "routes/user/schema";

export async function serviceGetUser(userId: number): Promise<UserResponseDTO> {
	const connection = await getConnection();

	try {
		const [rows]: any = await connection.query(
			"SELECT idUtilisateur, nomUtilisateur, prenomUtilisateur, login, ville, codePostal, dateHeureCreation, dateHeureMAJ FROM Utilisateur WHERE idUtilisateur = ?",
			[userId]
		);

		if (rows.length === 0) {
			throw new ApiError(ErrorResponses.USER_NOT_FOUND);
		}

		const user = rows[0];
		return new UserResponseDTO(
			user.idUtilisateur,
			user.nomUtilisateur,
			user.prenomUtilisateur,
			user.login,
			user.ville,
			user.codePostal,
			user.dateHeureCreation,
			user.dateHeureMAJ
		);
	} finally {
		connection.release();
	}
}

export async function serviceUpdateUser(userId: number, userData: UpdateUserDTO): Promise<UserResponseDTO> {
	const connection = await getConnection();

	try {
		// Check if user exists
		const [existingUser]: any = await connection.query(
			"SELECT idUtilisateur FROM Utilisateur WHERE idUtilisateur = ?",
			[userId]
		);

		if (existingUser.length === 0) {
			throw new ApiError(ErrorResponses.USER_NOT_FOUND);
		}

		// Check if email is already taken by another user
		if (userData.login) {
			const [emailCheck]: any = await connection.query(
				"SELECT idUtilisateur FROM Utilisateur WHERE login = ? AND idUtilisateur != ?",
				[userData.login, userId]
			);

			if (emailCheck.length > 0) {
				throw new ApiError(ErrorResponses.DUPLICATE_EMAIL);
			}
		}

		// Prepare fields to update
		const fields = [
			["login", userData.login],
			["mdp", userData.mdp ? await hashPassword(userData.mdp) : undefined],
			["ville", userData.ville],
			["codePostal", userData.codePostal],
			["nomUtilisateur", userData.nomUtilisateur],
			["prenomUtilisateur", userData.prenomUtilisateur]
		].filter(([_, value]) => value !== undefined);

		if (fields.length === 0) {
			throw new ApiError(ErrorResponses.NO_FIELDS_TO_UPDATE);
		}

		const setClause = fields.map(([key]) => `${key} = ?`).join(", ");
		const values = fields.map(([_, value]) => value);

		await connection.query(
			`UPDATE Utilisateur SET ${setClause} WHERE idUtilisateur = ?`,
			[...values, userId]
		);

		// Return updated user
		return await serviceGetUser(userId);
	} finally {
		connection.release();
	}
}
