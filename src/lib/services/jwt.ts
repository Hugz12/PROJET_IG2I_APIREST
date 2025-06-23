import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Charger les variables d'environnement depuis le fichier .env
const JWT_SECRET = process.env.JWT_SECRET as string; // Utiliser la clé secrète depuis .env

export interface TokenPayload extends JwtPayload {
    idUtilisateur: number;
    login: string;
}

export function generateToken(payload: object): string {
	try {
		return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
	} catch (error) {
		console.error("Error generating token:", error);
		throw new Error("Could not generate token");
	}
}

// Fonction pour vérifier un token JWT
export function verifyToken<T = unknown>(token: string): T | null {
	try {
		return jwt.verify(token, JWT_SECRET) as T;
	} catch (error) {
		console.error("Error verifying token:", error);
		return null;
	}
}

/** Fonctionnement du JWT
 *  
 *  Le JWT (JSON Web Token) est un jeton sécurisé utilisé pour l’authentification, composé de trois parties :
 *   - **Header** : Indique le type de jeton et l’algorithme de signature.
 *   - **Payload** : Contient les données (claims) comme l’ID utilisateur
 *   - **Signature** : Assure l’intégrité du jeton en le signant avec une clé secrète.
 * 
 *   - Header = base64UrlEncode({
 *       "alg": "HS256",
 *       "typ": "JWT"
 *   })
 * 
 *    - Payload = base64UrlEncode({
 *       "idUtilisateur": 123,
 *       "login": "user123",
 *       "iat": 1700000000, // Date de création du token
 *       "exp": 1700003600 // Date d'expiration du token
 *    })
 * 
 *    - Signature = HMACSHA256(Header + "." + Payload, secret)
 * 
 *    Le jeton final est une concaténation des trois parties, séparées par des points :
 *    `Header.Payload.Signature`
 */
