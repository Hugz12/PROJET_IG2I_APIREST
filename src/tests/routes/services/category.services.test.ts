import { serviceGetAllCategories } from '../../../routes/category/services';
import { getConnection } from 'lib/services/mysql';
import { CategoryResponseDTO, SubCategoryResponseDTO } from '../../../routes/category/schema';
import { mockConnection, mockQuery, mockRelease } from '../../setup';

describe('Category Services', () => {
    beforeEach(() => {
        (getConnection as jest.Mock).mockResolvedValue(mockConnection);
        jest.clearAllMocks();
    });

    describe('serviceGetAllCategories', () => {
        it('should return an array of categories with subcategories', async () => {
            // Mock data
            const mockCategories = [
                {
                    idCategorie: 1,
                    nomCategorie: 'Food',
                    catDateHeureCreation: new Date('2023-01-01'),
                    catDateHeureMAJ: new Date('2023-01-02'),
                    idSousCategorie: 1,
                    nomSousCategorie: 'Restaurant',
                    subIdCategorie: 1,
                    subDateHeureCreation: new Date('2023-01-01'),
                    subDateHeureMAJ: new Date('2023-01-02')
                },
                {
                    idCategorie: 1,
                    nomCategorie: 'Food',
                    catDateHeureCreation: new Date('2023-01-01'),
                    catDateHeureMAJ: new Date('2023-01-02'),
                    idSousCategorie: 2,
                    nomSousCategorie: 'Groceries',
                    subIdCategorie: 1,
                    subDateHeureCreation: new Date('2023-01-01'),
                    subDateHeureMAJ: new Date('2023-01-02')
                },
                {
                    idCategorie: 2,
                    nomCategorie: 'Transportation',
                    catDateHeureCreation: new Date('2023-01-01'),
                    catDateHeureMAJ: new Date('2023-01-02'),
                    idSousCategorie: 3,
                    nomSousCategorie: 'Public Transport',
                    subIdCategorie: 2,
                    subDateHeureCreation: new Date('2023-01-01'),
                    subDateHeureMAJ: new Date('2023-01-02')
                }
            ];

            // Mock the query response
            mockQuery.mockResolvedValueOnce([mockCategories]);

            // Call the service
            const result = await serviceGetAllCategories();

            // Assertions
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockRelease).toHaveBeenCalledTimes(1);

            // Check structure and content
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(2); // Should have 2 categories

            // First category should have 2 subcategories
            expect(result[0]).toBeInstanceOf(CategoryResponseDTO);
            expect(result[0].idCategorie).toBe(1);
            expect(result[0].nomCategorie).toBe('Food');
            expect(result[0].sousCategories?.length).toBe(2);
            expect(result[0].sousCategories?.[0]).toBeInstanceOf(SubCategoryResponseDTO);
            expect(result[0].sousCategories?.[0].idSousCategorie).toBe(1);
            expect(result[0].sousCategories?.[0].nomSousCategorie).toBe('Restaurant');
            expect(result[0].sousCategories?.[1].idSousCategorie).toBe(2);
            expect(result[0].sousCategories?.[1].nomSousCategorie).toBe('Groceries');

            // Second category should have 1 subcategory
            expect(result[1]).toBeInstanceOf(CategoryResponseDTO);
            expect(result[1].idCategorie).toBe(2);
            expect(result[1].nomCategorie).toBe('Transportation');
            expect(result[1].sousCategories?.length).toBe(1);
            expect(result[1].sousCategories?.[0].idSousCategorie).toBe(3);
            expect(result[1].sousCategories?.[0].nomSousCategorie).toBe('Public Transport');
        });

        it('should return an empty array when no categories exist', async () => {
            // Mock empty query response
            mockQuery.mockResolvedValueOnce([[]]);

            // Call the service
            const result = await serviceGetAllCategories();

            // Assertions
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockRelease).toHaveBeenCalledTimes(1);
            
            // Should return empty array
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBe(0);
        });
    });
});
