import { 
    serviceCreateMovement, 
    serviceFetchMovementsByAccountId 
} from '../../../routes/account/movement/services';
import { getConnection } from 'lib/services/mysql';
import { CreateMovementDTO, MovementResponseDTO } from '../../../routes/account/movement/schema';
import { ApiError } from '../../../types/apiError';
import { ErrorResponses } from '../../../types/errorResponses';
import { mockConnection, mockQuery, mockRelease } from '../../setup';

describe('Movement Services', () => {
    beforeEach(() => {
        (getConnection as jest.Mock).mockResolvedValue(mockConnection);
        jest.clearAllMocks();
    });

    describe('serviceCreateMovement', () => {
        it('should create a new movement and return it', async () => {
            // Mock data
            const userId = 1;
            const accountId = 5;
            const movementData: CreateMovementDTO = {
                montant: 100,
                dateMouvement: '2025-01-15',
                idTiers: 1,
                idCategorie: 2,
                typeMouvement: 'D'
            };
            const insertId = 10;
            const mockInsertResult = { affectedRows: 1, insertId };
            const mockCreatedMovement = {
                idMouvement: insertId,
                idCompte: accountId,
                montant: movementData.montant,
                dateMouvement: new Date(movementData.dateMouvement as string),
                idTiers: movementData.idTiers,
                idCategorie: movementData.idCategorie,
                typeMouvement: movementData.typeMouvement,
                dateHeureCreation: new Date(),
                dateHeureMAJ: new Date(),
            };

            // Mock the query responses
            mockQuery
                .mockResolvedValueOnce([[{ count: 1 }]]) // Account check
                .mockResolvedValueOnce([[{ count: 1 }]]) // Category check
                .mockResolvedValueOnce([mockInsertResult]) // Insert query
                .mockResolvedValueOnce([[mockCreatedMovement]]); // Fetch created movement

            // Call the service
            const result = await serviceCreateMovement(movementData, accountId, userId);

            // Assertions
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(4);
            expect(mockQuery).toHaveBeenNthCalledWith(
                1,
                `SELECT COUNT(*) as count FROM Compte WHERE idCompte = ? AND idUtilisateur = ?`,
                [accountId, userId]
            );
            expect(mockQuery).toHaveBeenNthCalledWith(
                2,
                `SELECT COUNT(*) as count FROM Categorie WHERE idCategorie = ?`,
                [movementData.idCategorie]
            );
            expect(mockQuery).toHaveBeenNthCalledWith(
                3,
                expect.stringContaining("INSERT INTO Mouvement"),
                [
                    accountId,
                    movementData.montant,
                    movementData.dateMouvement || expect.any(Date),
                    movementData.idTiers || null,
                    movementData.idCategorie || null,
                    movementData.typeMouvement || "D"
                ]
            );
            expect(mockQuery).toHaveBeenNthCalledWith(
                4,
                `SELECT * FROM Mouvement WHERE idMouvement = ?`,
                [insertId]
            );
            expect(mockRelease).toHaveBeenCalledTimes(1);
            expect(result.movement).toBeInstanceOf(MovementResponseDTO);
            expect(result.movement.idMouvement).toBe(insertId);
            expect(result.movement.idCompte).toBe(accountId);
            expect(result.movement.montant).toBe(movementData.montant);
            expect(result.movement.typeMouvement).toBe(movementData.typeMouvement);
        });

        it('should create a movement with default values when optional fields are not provided', async () => {
            // Mock data
            const userId = 1;
            const accountId = 5;
            const movementData: CreateMovementDTO = {
                montant: 100
            };
            const insertId = 10;
            const mockInsertResult = { affectedRows: 1, insertId };
            const mockCreatedMovement = {
                idMouvement: insertId,
                idCompte: accountId,
                montant: movementData.montant,
                dateMouvement: new Date(),
                idTiers: null,
                idCategorie: null,
                typeMouvement: 'D', // Default value
                dateHeureCreation: new Date(),
                dateHeureMAJ: new Date(),
            };

            // Mock the query responses
            mockQuery
                .mockResolvedValueOnce([[{ count: 1 }]]) // Account check
                .mockResolvedValueOnce([mockInsertResult]) // Insert query
                .mockResolvedValueOnce([[mockCreatedMovement]]); // Fetch created movement

            // Call the service
            const result = await serviceCreateMovement(movementData, accountId, userId);

            // Assertions
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(3);
            expect(mockQuery).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining("INSERT INTO Mouvement"),
                expect.arrayContaining([
                    accountId,
                    movementData.montant,
                    expect.anything(),
                    null,
                    null,
                    "D"
                ])
            );
            expect(mockRelease).toHaveBeenCalledTimes(1);
            expect(result.movement).toBeInstanceOf(MovementResponseDTO);
            expect(result.movement.idMouvement).toBe(insertId);
            expect(result.movement.typeMouvement).toBe('D');
        });

        it('should throw UNAUTHORIZED error when account does not belong to user', async () => {
            // Mock data
            const userId = 1;
            const accountId = 5;
            const movementData: CreateMovementDTO = {
                montant: 100,
                dateMouvement: '2025-01-15',
                typeMouvement: 'D'
            };

            // Mock the query response
            mockQuery.mockResolvedValueOnce([[{ count: 0 }]]);

            // Assertion for the error
            await expect(serviceCreateMovement(movementData, accountId, userId)).rejects.toThrow(
                new ApiError(ErrorResponses.UNAUTHORIZED)
            );
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });

        it('should throw CATEGORY_NOT_FOUND error when category does not exist', async () => {
            // Mock data
            const userId = 1;
            const accountId = 5;
            const movementData: CreateMovementDTO = {
                montant: 100,
                dateMouvement: '2025-01-15',
                idCategorie: 999, // Non-existent category ID
                typeMouvement: 'D'
            };

            // Mock the query response
            mockQuery
                .mockResolvedValueOnce([[{ count: 1 }]]) // Account check
                .mockResolvedValueOnce([[{ count: 0 }]]); // Category check - not found

            // Assertion for the error
            await expect(serviceCreateMovement(movementData, accountId, userId)).rejects.toThrow(
                new ApiError(ErrorResponses.CATEGORY_NOT_FOUND)
            );
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(2);
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });

        it('should throw MOVEMENT_CREATION_FAILED error when insertion fails', async () => {
            // Mock data
            const userId = 1;
            const accountId = 5;
            const movementData: CreateMovementDTO = {
                montant: 100,
                dateMouvement: '2025-01-15',
                typeMouvement: 'D'
            };
            const mockInsertResult = { affectedRows: 0 };

            // Mock the query response
            mockQuery
                .mockResolvedValueOnce([[{ count: 1 }]]) // Account check
                .mockResolvedValueOnce([mockInsertResult]); // Insert fails

            // Assertion for the error
            await expect(serviceCreateMovement(movementData, accountId, userId)).rejects.toThrow(
                new ApiError(ErrorResponses.MOVEMENT_CREATION_FAILED)
            );
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(2);
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });

        it('should throw NOT_FOUND error when the created movement cannot be found', async () => {
            // Mock data
            const userId = 1;
            const accountId = 5;
            const movementData: CreateMovementDTO = {
                montant: 100,
                typeMouvement: 'D'
            };
            const insertId = 10;
            const mockInsertResult = { affectedRows: 1, insertId };

            // Mock the query response
            mockQuery
                .mockResolvedValueOnce([[{ count: 1 }]]) // Account check
                .mockResolvedValueOnce([mockInsertResult]) // Insert succeeds
                .mockResolvedValueOnce([[]]); // Movement not found

            // Assertion for the error
            await expect(serviceCreateMovement(movementData, accountId, userId)).rejects.toThrow(
                new ApiError(ErrorResponses.NOT_FOUND)
            );
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(3);
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });
    });

    describe('serviceFetchMovementsByAccountId', () => {
        it('should return a specific movement when ID is provided', async () => {
            // Mock data
            const userId = 1;
            const accountId = 5;
            const movementId = 10;
            const mockMovement = {
                idMouvement: movementId,
                idCompte: accountId,
                montant: 100,
                dateMouvement: new Date('2025-01-15'),
                idTiers: 1,
                idCategorie: 2,
                typeMouvement: 'D',
                dateHeureCreation: new Date(),
                dateHeureMAJ: new Date(),
            };

            // Mock the query responses
            mockQuery
                .mockResolvedValueOnce([[{ count: 1 }]]) // Account check
                .mockResolvedValueOnce([[mockMovement]]); // Fetch movement

            // Call the service
            const result = await serviceFetchMovementsByAccountId(accountId, userId, movementId);

            // Assertions
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(2);
            expect(mockQuery).toHaveBeenNthCalledWith(
                1,
                `SELECT COUNT(*) as count FROM Compte WHERE idCompte = ? AND idUtilisateur = ?`,
                [accountId, userId]
            );
            expect(mockQuery).toHaveBeenNthCalledWith(
                2,
                `SELECT * FROM Mouvement WHERE idCompte = ? AND idMouvement = ?`,
                [accountId, movementId]
            );
            expect(mockRelease).toHaveBeenCalledTimes(1);
            expect(result.movement).toBeInstanceOf(MovementResponseDTO);
            expect((result.movement as MovementResponseDTO).idMouvement).toBe(movementId);
            expect((result.movement as MovementResponseDTO).idCompte).toBe(accountId);
            expect((result.movement as MovementResponseDTO).montant).toBe(mockMovement.montant);
        });

        it('should return all movements for an account when no movement ID is provided', async () => {
            // Mock data
            const userId = 1;
            const accountId = 5;
            const mockMovements = [
                {
                    idMouvement: 10,
                    idCompte: accountId,
                    montant: 100,
                    dateMouvement: new Date('2025-01-15'),
                    idTiers: 1,
                    idCategorie: 2,
                    typeMouvement: 'D',
                    dateHeureCreation: new Date(),
                    dateHeureMAJ: new Date(),
                },
                {
                    idMouvement: 11,
                    idCompte: accountId,
                    montant: 200,
                    dateMouvement: new Date('2025-01-20'),
                    idTiers: 2,
                    idCategorie: 1,
                    typeMouvement: 'C',
                    dateHeureCreation: new Date(),
                    dateHeureMAJ: new Date(),
                }
            ];

            // Mock the query responses
            mockQuery
                .mockResolvedValueOnce([[{ count: 1 }]]) // Account check
                .mockResolvedValueOnce([mockMovements]); // Fetch all movements

            // Call the service
            const result = await serviceFetchMovementsByAccountId(accountId, userId);

            // Assertions
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(2);
            expect(mockQuery).toHaveBeenNthCalledWith(
                1,
                `SELECT COUNT(*) as count FROM Compte WHERE idCompte = ? AND idUtilisateur = ?`,
                [accountId, userId]
            );
            expect(mockQuery).toHaveBeenNthCalledWith(
                2,
                `SELECT * FROM Mouvement WHERE idCompte = ? ORDER BY dateMouvement DESC`,
                [accountId]
            );
            expect(mockRelease).toHaveBeenCalledTimes(1);
            expect(Array.isArray(result.movement)).toBe(true);
            expect((result.movement as MovementResponseDTO[]).length).toBe(2);
            expect((result.movement as MovementResponseDTO[])[0]).toBeInstanceOf(MovementResponseDTO);
            expect((result.movement as MovementResponseDTO[])[0].idMouvement).toBe(mockMovements[0].idMouvement);
            expect((result.movement as MovementResponseDTO[])[1].idMouvement).toBe(mockMovements[1].idMouvement);
        });

        it('should return an empty array when no movements exist for the account', async () => {
            // Mock data
            const userId = 1;
            const accountId = 5;

            // Mock the query responses
            mockQuery
                .mockResolvedValueOnce([[{ count: 1 }]]) // Account check
                .mockResolvedValueOnce([[]]); // No movements found

            // Call the service
            const result = await serviceFetchMovementsByAccountId(accountId, userId);

            // Assertions
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(2);
            expect(mockRelease).toHaveBeenCalledTimes(1);
            expect(Array.isArray(result.movement)).toBe(true);
            expect((result.movement as MovementResponseDTO[]).length).toBe(0);
        });

        it('should throw UNAUTHORIZED error when account does not belong to user', async () => {
            // Mock data
            const userId = 1;
            const accountId = 5;
            const movementId = 10;

            // Mock the query response
            mockQuery.mockResolvedValueOnce([[{ count: 0 }]]); // Account not found or not owned

            // Assertion for the error
            await expect(serviceFetchMovementsByAccountId(accountId, userId, movementId)).rejects.toThrow(
                new ApiError(ErrorResponses.UNAUTHORIZED)
            );
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });

        it('should throw NOT_FOUND error when the specific movement does not exist', async () => {
            // Mock data
            const userId = 1;
            const accountId = 5;
            const movementId = 10;

            // Mock the query responses
            mockQuery
                .mockResolvedValueOnce([[{ count: 1 }]]) // Account check
                .mockResolvedValueOnce([[]]); // Movement not found

            // Assertion for the error
            await expect(serviceFetchMovementsByAccountId(accountId, userId, movementId)).rejects.toThrow(
                new ApiError(ErrorResponses.NOT_FOUND)
            );
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(2);
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });
    });
});
