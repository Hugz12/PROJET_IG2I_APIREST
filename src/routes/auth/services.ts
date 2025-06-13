import { getConnection } from "lib/services/mysql";
import { ApiError } from "types/apiError";
import { ErrorResponses } from "types/errorResponses";
import { generateToken } from "lib/services/jwt";
import { hashPassword, verifyPassword } from "lib/utils/crypt";
import { LoginDTO, RegisterDTO } from "routes/auth/schema";


export async function serviceRegister(register: RegisterDTO): Promise<boolean> {
    // Start MySQL connection
    const connection = await getConnection();

    // Check if the user already exists
    const [rows]: any = await connection.query("SELECT count(*) as count FROM Utilisateur WHERE login = ?", [register.login]);
    if (rows[0].count > 0) {
        throw new ApiError(ErrorResponses.DUPLICATE_EMAIL);
    }

    // Hash the password
    const hashedPassword = await hashPassword(register.mdp);

    // Insert the new user into the database
    const result: any = await connection.query(
        "INSERT INTO Utilisateur (login, mdp, nomUtilisateur, prenomUtilisateur, ville, codePostal) VALUES (?, ?, ?, ?, ?, ?)",
        [register.login, hashedPassword, register.nomUtilisateur, register.prenomUtilisateur, register.ville, register.codePostal]
    );

    // Close the connection
    connection.release();
 
    return true;
}

export async function serviceLogin(login: LoginDTO): Promise<{ token: string }> {
    // Start MySQL connection
    const connection = await getConnection();

    // Check if the user exists
    const [rows]: any = await connection.query("SELECT * FROM Utilisateur WHERE login = ?", [login.login]);
    if (rows.length === 0) {
        throw new ApiError(ErrorResponses.INVALID_CREDENTIALS);
    }
    const user = rows[0];

    // Verify the password
    const isPasswordValid = await verifyPassword(login.mdp, user.mdp);
    if (!isPasswordValid) {
        throw new ApiError(ErrorResponses.INVALID_CREDENTIALS);
    }

    // Generate a JWT token
    const token = generateToken({ idUtilisateur: user.idUtilisateur, login: user.login });

    // Close the connection
    connection.release();

    return { token };
}

