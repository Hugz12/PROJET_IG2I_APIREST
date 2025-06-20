import { fi } from "@faker-js/faker/.";
import { getConnection } from "lib/services/mysql";
import { 
    ThirdPartyResponseDTO, 
    CreateThirdPartyDTO, 
    UpdateThirdPartyDTO 
} from "routes/third-party/schema";

export async function serviceGetAllThirdParties(userId: number): Promise<ThirdPartyResponseDTO[]> {
    const connection = await getConnection();

    try {
        const [rows]: any = await connection.query(
            `SELECT 
                idTiers AS thirdPartyId, 
                nomTiers AS thirdPartyName, 
                idUtilisateur AS userId,
                dateHeureCreation AS createdAt, 
                dateHeureMAJ AS updatedAt
             FROM Tiers
             WHERE idUtilisateur = ?
             ORDER BY nomTiers`,
            [userId]
        );

        return rows.map((row: any) => new ThirdPartyResponseDTO(
            row.thirdPartyId,
            row.thirdPartyName,
            row.userId,
            row.createdAt,
            row.updatedAt
        ));
    } catch (error) {
        console.error("Error fetching third parties:", error);
        return []; // Return an empty array on error
    } finally {
        connection.release();
    }
}

export async function serviceGetThirdPartyById(id: number): Promise<ThirdPartyResponseDTO | null> {
    const connection = await getConnection();

    try {
        const [rows]: any = await connection.query(
            `SELECT 
                idTiers AS thirdPartyId, 
                nomTiers AS thirdPartyName, 
                idUtilisateur AS userId,
                dateHeureCreation AS createdAt, 
                dateHeureMAJ AS updatedAt
             FROM Tiers
             WHERE idTiers = ?`,
            [id]
        );

        if (rows.length === 0) {
            return null;
        }

        const row = rows[0];
        return new ThirdPartyResponseDTO(
            row.thirdPartyId,
            row.thirdPartyName,
            row.userId,
            row.createdAt,
            row.updatedAt
        );
    } finally {
        connection.release();
    }
}

export async function serviceCreateThirdParty(thirdPartyData: CreateThirdPartyDTO): Promise<ThirdPartyResponseDTO> {
    const connection = await getConnection();

    try {
        const { thirdPartyName, userId } = thirdPartyData;
        const currentDate = new Date();
        
        const [result]: any = await connection.query(
            `INSERT INTO Tiers (nomTiers, idUtilisateur, dateHeureCreation)
             VALUES (?, ?, ?)`,
            [thirdPartyName, userId || 1, currentDate]
        );

        return new ThirdPartyResponseDTO(
            result.insertId,
            thirdPartyName,
            userId || 1,
            currentDate
        );
    } finally {
        connection.release();
    }
}

export async function serviceUpdateThirdParty(
    id: number, 
    thirdPartyData: UpdateThirdPartyDTO
): Promise<ThirdPartyResponseDTO | null> {
    const connection = await getConnection();

    try {
        // First check if third party exists
        const existingThirdParty = await serviceGetThirdPartyById(id);
        if (!existingThirdParty) {
            return null;
        }

        const { thirdPartyName } = thirdPartyData;
        const updateFields = [];
        const updateValues = [];

        // Build dynamic update query
        if (thirdPartyName !== undefined) {
            updateFields.push('nomTiers = ?');
            updateValues.push(thirdPartyName);
        }

        if (updateFields.length === 0) {
            // No fields to update, return existing record
            return existingThirdParty;
        }

        // Add dateHeureMAJ
        updateFields.push('dateHeureMAJ = ?');
        const currentDate = new Date();
        updateValues.push(currentDate);

        // Add ID for WHERE clause
        updateValues.push(id);

        await connection.query(
            `UPDATE Tiers 
             SET ${updateFields.join(', ')} 
             WHERE idTiers = ?`,
            updateValues
        );

        return new ThirdPartyResponseDTO(
            id,
            thirdPartyName ?? existingThirdParty.thirdPartyName,
            existingThirdParty.userId,
            existingThirdParty.createdAt,
            currentDate
        );
    } finally {
        connection.release();
    }
}

export async function serviceDeleteThirdParty(id: number): Promise<boolean> {
    const connection = await getConnection();

    try {
        const [result]: any = await connection.query(
            'DELETE FROM Tiers WHERE idTiers = ?',
            [id]
        );

        return result.affectedRows > 0;
    } finally {
        connection.release();
    }
}

export async function serviceGetThirdPartiesByUserId(userId: number): Promise<ThirdPartyResponseDTO[]> {
    const connection = await getConnection();

    try {
        const [rows]: any = await connection.query(
            `SELECT 
                idTiers AS thirdPartyId, 
                nomTiers AS thirdPartyName, 
                idUtilisateur AS userId,
                dateHeureCreation AS createdAt, 
                dateHeureMAJ AS updatedAt
             FROM Tiers
             WHERE idUtilisateur = ?
             ORDER BY nomTiers`,
            [userId]
        );

        return rows.map((row: any) => new ThirdPartyResponseDTO(
            row.thirdPartyId,
            row.thirdPartyName,
            row.userId,
            row.createdAt,
            row.updatedAt
        ));
    } finally {
        connection.release();
    }
}