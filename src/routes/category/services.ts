import { getConnection } from "lib/services/mysql";
import { 
    CategoryResponseDTO, 
    SubCategoryResponseDTO 
} from "routes/category/schema";

export async function serviceGetAllCategories(): Promise<CategoryResponseDTO[]> {
    const connection = await getConnection();

    try {
        // Get all categories
        const [categoriesRows]: any = await connection.query(
            "SELECT * FROM Categorie ORDER BY nomCategorie"
        );

        // Get all subcategories
        const [subCategoriesRows]: any = await connection.query(
            "SELECT * FROM SousCategorie ORDER BY nomSousCategorie"
        );

        // Map subcategories to their parent categories
        const categories: CategoryResponseDTO[] = categoriesRows.map((cat: any) => {
            const subCategories = subCategoriesRows
                .filter((sub: any) => sub.idcategorie === cat.idCategorie)
                .map((sub: any) => new SubCategoryResponseDTO(
                    sub.idSousCategorie,
                    sub.nomSousCategorie,
                    sub.idcategorie,
                    sub.dateHeureCreation,
                    sub.dateHeureMAJ
                ));

            return new CategoryResponseDTO(
                cat.idCategorie,
                cat.nomCategorie,
                cat.dateHeureCreation,
                cat.dateHeureMAJ,
                subCategories
            );
        });

        return categories;
    } finally {
        connection.release();
    }
}
