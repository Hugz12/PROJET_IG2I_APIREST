import { CreateAccountDTO, UpdateAccountDTO, AccountResponseDTO } from "routes/account/schema";
import { getConnection } from "lib/services/mysql";
import { ApiError } from "types/apiError";
import { ErrorResponses } from "types/errorResponses";

export async function serviceCreateAccount(account: CreateAccountDTO, userId: number): Promise<{ account: any }> {
	// Start MySQL connection
	const connection = await getConnection();

	try {
		// Insert the new account into the database
		const [insertResult]: any = await connection.query(
			"INSERT INTO Compte (descriptionCompte, nomBanque, soldeInitial, idUtilisateur) VALUES (?, ?, ?, ?)",
			[account.descriptionCompte, account.nomBanque, account.soldeInitial, userId]
		);

		// Check if the insertion was successful
		if (insertResult.affectedRows === 0) {
			throw new ApiError(ErrorResponses.ACCOUNT_CREATION_FAILED);
		}

		// Return the account's information
		const [createdAccount]: any = await connection.query("SELECT * FROM Compte WHERE idCompte = ?", [
			insertResult.insertId,
		]);

		return {
			account: createdAccount[0],
		};
	} finally {
		// Close the connection
		connection.release();
	}
}

export async function serviceGetUserAccounts(userId: number): Promise<{ accounts: AccountResponseDTO[] }> {
	// Start MySQL connection
	const connection = await getConnection();

	try {
		// Fetch all accounts for the user
		const [accounts]: any = await connection.query(
			"SELECT * FROM Compte WHERE idUtilisateur = ? ORDER BY dateHeureCreation DESC",
			[userId]
		);

		return {
			accounts: accounts.map(
				(account: any) =>
					new AccountResponseDTO(
						account.idCompte,
						account.descriptionCompte,
						account.nomBanque,
						account.soldeInitial,
						account.dernierSolde,
						account.idUtilisateur,
						new Date(account.dateHeureCreation),
						new Date(account.dateHeureMAJ)
					)
			)
		};
	} finally {
		connection.release();
	}
}

export async function serviceGetAccountById(accountId: number, userId: number): Promise<{ account: AccountResponseDTO }> {
	// Start MySQL connection
	const connection = await getConnection();

	try {
		// Fetch specific account
		const [accounts]: any = await connection.query("SELECT * FROM Compte WHERE idCompte = ?", [
			accountId,
			userId,
		]);

		if (accounts.length === 0) {
			throw new ApiError(ErrorResponses.NOT_FOUND);
		}
		if (accounts[0].idUtilisateur !== userId) {
			throw new ApiError(ErrorResponses.UNAUTHORIZED);
		}

		const account = accounts[0];
		return {
			account: new AccountResponseDTO(
				account.idCompte,
				account.descriptionCompte,
				account.nomBanque,
				account.soldeInitial,
				account.dernierSolde,
				account.idUtilisateur,
				new Date(account.dateHeureCreation),
				new Date(account.dateHeureMAJ)
			)
		};
	} finally {
		connection.release();
	}
}

export async function serviceUpdateAccount(
	accountId: number,
	updateData: UpdateAccountDTO,
	userId: number
): Promise<{ account: AccountResponseDTO }> {
	// Start MySQL connection
	const connection = await getConnection();

	try {
		// Check if account exists and belongs to user
		const [existingAccount]: any = await connection.query(
			"SELECT * FROM Compte WHERE idCompte = ?",
			[accountId, userId]
		);

		if (existingAccount.length === 0) {
			throw new ApiError(ErrorResponses.NOT_FOUND);
		}
		if (existingAccount[0].idUtilisateur !== userId) {
			throw new ApiError(ErrorResponses.UNAUTHORIZED);
		}

		// Prepare fields to update
		const fields = [
			["descriptionCompte", updateData.descriptionCompte],
			["nomBanque", updateData.nomBanque],
		].filter(([_, value]) => value !== undefined);

		if (fields.length === 0) {
			throw new ApiError(ErrorResponses.BAD_REQUEST);
		}

		const setClause = fields.map(([key]) => `${key} = ?`).join(", ");
		const values = fields.map(([_, value]) => value);

		// Update the account
		await connection.query(
			`UPDATE Compte SET ${setClause}, dateHeureMAJ = NOW() WHERE idCompte = ? AND idUtilisateur = ?`,
			[...values, accountId, userId]
		);

		// Return updated account
		return {
			account: (await serviceGetAccountById(accountId, userId)).account,
		};
	} finally {
		connection.release();
	}
}
