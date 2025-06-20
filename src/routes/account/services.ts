import { CreateAccountDTO } from "routes/account/schema";
import { getConnection } from "lib/services/mysql";
import { ApiError } from "types/apiError";
import { ErrorResponses } from "types/errorResponses";


export async function serviceCreateAccount(account: CreateAccountDTO, userId: number): Promise<{ account: any }> {
    // Start MySQL connection
    const connection = await getConnection();

    try {
        // Insert the new account into the database
        const result: any = await connection.query(
            "INSERT INTO Compte (descriptionCompte, nomBanque, soldeInitial, idUtilisateur) VALUES (?, ?, ?, ?)",
            [account.descriptionCompte, account.nomBanque, account.soldeInitial, userId]
        );

        // Check if the insertion was successful
        if (result.affectedRows === 0) { 
            throw new ApiError(ErrorResponses.ACCOUNT_CREATION_FAILED);
        }

        // Return the account's information
        const [createdAccount]: any = await connection.query(
            "SELECT * FROM Compte WHERE idCompte = ?",
            [result[0].insertId]
        );

        return {
            account: createdAccount[0]
        };


    } finally {
        // Close the connection
        connection.release();
    }
}