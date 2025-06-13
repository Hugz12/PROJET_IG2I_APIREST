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

        // Build update query dynamically
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (userData.nomUtilisateur) {
            updateFields.push("nomUtilisateur = ?");
            updateValues.push(userData.nomUtilisateur);
        }

        if (userData.prenomUtilisateur) {
            updateFields.push("prenomUtilisateur = ?");
            updateValues.push(userData.prenomUtilisateur);
        }

        if (userData.login) {
            updateFields.push("login = ?");
            updateValues.push(userData.login);
        }

        if (userData.mdp) {
            const hashedPassword = await hashPassword(userData.mdp);
            updateFields.push("mdp = ?");
            updateValues.push(hashedPassword);
        }

        if (userData.ville) {
            updateFields.push("ville = ?");
            updateValues.push(userData.ville);
        }

        if (userData.codePostal) {
            updateFields.push("codePostal = ?");
            updateValues.push(userData.codePostal);
        }

        if (updateFields.length === 0) {
            throw new ApiError({
                internalCode: "NO_FIELDS_TO_UPDATE",
                message: "No fields provided to update",
                statusCode: 400
            });
        }

        updateValues.push(userId);

        // Execute update
        await connection.query(
            `UPDATE Utilisateur SET ${updateFields.join(", ")} WHERE idUtilisateur = ?`,
            updateValues
        );

        // Return updated user
        return await serviceGetUser(userId);
    } finally {
        connection.release();
    }
}

export async function serviceDeleteUser(userId: number): Promise<void> {
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

        // Delete user (CASCADE will handle related records)
        await connection.query(
            "DELETE FROM Utilisateur WHERE idUtilisateur = ?",
            [userId]
        );
    } finally {
        connection.release();
    }
}
