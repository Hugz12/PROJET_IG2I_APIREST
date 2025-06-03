import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Charger les variables d'environnement depuis le fichier .env
const JWT_SECRET = process.env.JWT_SECRET as string; // Utiliser la clé secrète depuis .env

export interface TokenPayload extends JwtPayload {
    idUtilisateur: number;
    login: string;
}

export function generateToken(payload: object): string {
    console.log(JWT_SECRET);
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

// Fonction pour vérifier un token JWT
export function verifyToken<T = unknown>(token: string): T | null {
    try {
        return jwt.verify(token, JWT_SECRET) as T;
    } catch (error) {
        return null;
    }
}
