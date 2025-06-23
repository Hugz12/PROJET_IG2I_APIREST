import { getConnection } from "lib/services/mysql";
import {
	CategoryResponseDTO,
	SubCategoryResponseDTO
} from "routes/category/schema";

export async function serviceGetAllCategories(): Promise<CategoryResponseDTO[]> {
	const connection = await getConnection();

	try {
		// Get all categories
		const [rows]: any = await connection.query(
			`SELECT 
                c.idCategorie, c.nomCategorie, c.dateHeureCreation AS catDateHeureCreation, c.dateHeureMAJ AS catDateHeureMAJ,
                s.idSousCategorie, s.nomSousCategorie, s.idcategorie AS subIdCategorie, s.dateHeureCreation AS subDateHeureCreation, s.dateHeureMAJ AS subDateHeureMAJ
             FROM Categorie c
             LEFT JOIN SousCategorie s ON s.idcategorie = c.idCategorie
             ORDER BY c.nomCategorie, s.nomSousCategorie`
		);

		// Group results by category
		const categoryMap: Map<number, CategoryResponseDTO> = new Map();
		rows.forEach((row: any) => {
			if (!categoryMap.has(row.idCategorie)) {
				categoryMap.set(row.idCategorie, new CategoryResponseDTO(
					row.idCategorie,
					row.nomCategorie,
					row.catDateHeureCreation,
					row.catDateHeureMAJ,
					[]
				));
			}

			if (row.idSousCategorie) {
				const subCategory = new SubCategoryResponseDTO(
					row.idSousCategorie,
					row.nomSousCategorie,
					row.subIdCategorie,
					row.subDateHeureCreation,
					row.subDateHeureMAJ
				);
				categoryMap.get(row.idCategorie)?.sousCategories?.push(subCategory);
			}
		});

		return Array.from(categoryMap.values());
	} finally {
		connection.release();
	}
}
