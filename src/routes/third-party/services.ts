import { getConnection } from "lib/services/mysql";
import {
	ThirdPartyResponseDTO,
	CreateThirdPartyDTO,
	UpdateThirdPartyDTO
} from "routes/third-party/schema";
import { ApiError } from "types/apiError";
import { ErrorResponses } from "types/errorResponses";

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

export async function serviceCreateThirdParty(thirdPartyData: CreateThirdPartyDTO, userId: number): Promise<ThirdPartyResponseDTO> {
	const connection = await getConnection();

	try {
		const { thirdPartyName } = thirdPartyData;

		const [result]: any = await connection.query(
			`INSERT INTO Tiers (nomTiers, idUtilisateur)
             VALUES (?, ?)`,
			[thirdPartyName, userId]
		);

		return new ThirdPartyResponseDTO(
			result.insertId,
			thirdPartyName,
			userId,
			new Date(), // Created at is set to current date
		);
	} finally {
		connection.release();
	}
}

export async function serviceUpdateThirdParty(
	id: number,
	thirdPartyData: UpdateThirdPartyDTO,
	userId: number
): Promise<ThirdPartyResponseDTO | null> {
	const connection = await getConnection();

	try {
		const existingThirdParty = await serviceGetThirdPartyById(id);

		if (!existingThirdParty) {
			throw new ApiError({
				internalCode: ErrorResponses.NOT_FOUND.internalCode,
				message: ErrorResponses.NOT_FOUND.message,
				statusCode: ErrorResponses.NOT_FOUND.statusCode
			});
		}
		else if (existingThirdParty.userId !== userId) {
			throw new ApiError({
				internalCode: ErrorResponses.UNAUTHORIZED.internalCode,
				message: ErrorResponses.UNAUTHORIZED.message,
				statusCode: ErrorResponses.UNAUTHORIZED.statusCode
			});
		}

		const { thirdPartyName } = thirdPartyData;

		await connection.query(
			`UPDATE Tiers 
             SET nomTiers = ? 
             WHERE idTiers = ?`,
			[thirdPartyName, id]
		);

		return new ThirdPartyResponseDTO(
			id,
			thirdPartyName,
			existingThirdParty.userId,
			existingThirdParty.createdAt,
			new Date() // Updated at is set to current date
		);
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
