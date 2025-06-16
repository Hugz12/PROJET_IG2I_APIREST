import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

/**
 * Hash un mot de passe en utilisant l'algorithme natif scrypt.
 * @param password - Le mot de passe à hasher
 * @returns Le mot de passe hashé avec le sel (format : salt:hash)
 */
export function hashPassword(password: string): string {
    const salt = randomBytes(16).toString("hex"); // Sel aléatoire
    const hash = scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

/**
 * Vérifie un mot de passe en le comparant avec un hash stocké.
 * @param password - Le mot de passe en clair à vérifier
 * @param storedHash - Le hash stocké au format "salt:hash"
 * @returns true si le mot de passe correspond, sinon false
 */
export function verifyPassword(password: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(":");

    if (!salt || !hash) {
        console.error("Hash format invalide");
        throw new Error("Hash format invalide");
    }

    const hashBuffer = Buffer.from(hash, "hex");
    const passwordBuffer = scryptSync(password, salt, 64);

    return timingSafeEqual(hashBuffer, passwordBuffer);
}
