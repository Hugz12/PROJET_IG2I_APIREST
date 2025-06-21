import { 
    serviceCreateTransfer, 
    serviceFetchTransfersByAccountId 
} from '../../../routes/account/transfer/services';
import { getConnection } from 'lib/services/mysql';
import { CreateTransferDTO, TransferResponseDTO } from '../../../routes/account/transfer/schema';
import { ApiError } from '../../../types/apiError';
import { ErrorResponses } from '../../../types/errorResponses';
import { mockConnection, mockQuery, mockRelease } from '../../setup';

describe('Transfer Services', () => {
    beforeEach(() => {
        (getConnection as jest.Mock).mockResolvedValue(mockConnection);
        jest.clearAllMocks();
    });

    describe('serviceCreateTransfer', () => {
        it('should create a new transfer and return it', async () => {
            // Mock data
            const userId = 1;
            const idCompteDebit = 5;
            const transferData: CreateTransferDTO = {
                idCompteCredit: 6,
                montant: 100,
                dateVirement: '2025-01-15',
                idTiers: 1,
                idCategorie: 2
            };
            const insertId = 10;
            const mockInsertResult = { affectedRows: 1, insertId };
            const mockDateNow = new Date('2025-01-15T12:00:00Z');
            
            // Mock Date.now for consistent test results
            const realDate = global.Date;
            global.Date = class extends realDate {
                constructor(value?: number | string | Date) {
                    if (arguments.length === 0) {
                        super(mockDateNow);
                    } else {
                        super(value as any);
                    }
                }
            } as any;

            try {
                // Mock the query responses
                mockQuery
                    .mockResolvedValueOnce([[{ count: 2 }]]) // Account check
                    .mockResolvedValueOnce([[{ count: 1 }]]) // Category check
                    .mockResolvedValueOnce([mockInsertResult]); // Insert query

                // Call the service
                const result = await serviceCreateTransfer(transferData, idCompteDebit, userId);

                // Assertions
                expect(getConnection).toHaveBeenCalledTimes(1);
                expect(mockQuery).toHaveBeenCalledTimes(3);
                expect(mockQuery).toHaveBeenNthCalledWith(
                    1,
                    expect.stringContaining("SELECT COUNT(*) as count FROM Compte"),
                    [idCompteDebit, transferData.idCompteCredit, userId]
                );
                expect(mockQuery).toHaveBeenNthCalledWith(
                    2,
                    `SELECT COUNT(*) as count FROM Categorie WHERE idCategorie = ?`,
                    [transferData.idCategorie]
                );
                expect(mockQuery).toHaveBeenNthCalledWith(
                    3,
                    expect.stringContaining("INSERT INTO Virement"),
                    [
                        idCompteDebit,
                        transferData.idCompteCredit,
                        transferData.montant,
                        transferData.dateVirement || expect.any(Date),
                        transferData.idTiers || null,
                        transferData.idCategorie || null
                    ]
                );
                expect(mockRelease).toHaveBeenCalledTimes(1);
                expect(result.transfer).toBeInstanceOf(TransferResponseDTO);
                expect(result.transfer.idVirement).toBe(insertId);
                expect(result.transfer.idCompteDebit).toBe(idCompteDebit);
                expect(result.transfer.idCompteCredit).toBe(transferData.idCompteCredit);
                expect(result.transfer.montant).toBe(transferData.montant);
            } finally {
                global.Date = realDate; // Restore original Date
            }
        });

        it('should create a transfer with default values when optional fields are not provided', async () => {
            // Mock data
            const userId = 1;
            const idCompteDebit = 5;
            const transferData: CreateTransferDTO = {
                idCompteCredit: 6,
                montant: 100
            };
            const insertId = 10;
            const mockInsertResult = { affectedRows: 1, insertId };
            const mockDateNow = new Date('2025-01-15T12:00:00Z');
            
            // Mock Date.now for consistent test results
            const realDate = global.Date;
            global.Date = class extends realDate {
                constructor(value?: number | string | Date) {
                    if (arguments.length === 0) {
                        super(mockDateNow);
                    } else {
                        super(value as any);
                    }
                }
            } as any;

            try {
                // Mock the query responses
                mockQuery
                    .mockResolvedValueOnce([[{ count: 2 }]]) // Account check
                    .mockResolvedValueOnce([mockInsertResult]); // Insert query

                // Call the service
                const result = await serviceCreateTransfer(transferData, idCompteDebit, userId);

                // Assertions
                expect(getConnection).toHaveBeenCalledTimes(1);
                expect(mockQuery).toHaveBeenCalledTimes(2);
                expect(mockQuery).toHaveBeenNthCalledWith(
                    1,
                    expect.stringContaining("SELECT COUNT(*) as count FROM Compte"),
                    [idCompteDebit, transferData.idCompteCredit, userId]
                );
                expect(mockQuery).toHaveBeenNthCalledWith(
                    2,
                    expect.stringContaining("INSERT INTO Virement"),
                    [
                        idCompteDebit,
                        transferData.idCompteCredit,
                        transferData.montant,
                        expect.any(Date),
                        null,
                        null
                    ]
                );
                expect(result.transfer).toBeInstanceOf(TransferResponseDTO);
                expect(result.transfer.idVirement).toBe(insertId);
                expect(result.transfer.idCompteDebit).toBe(idCompteDebit);
                expect(result.transfer.idCompteCredit).toBe(transferData.idCompteCredit);
                expect(result.transfer.montant).toBe(transferData.montant);
            } finally {
                global.Date = realDate; // Restore original Date
            }
        });

        it('should throw an unauthorized error when account does not belong to the user', async () => {
            // Mock data
            const userId = 1;
            const idCompteDebit = 5;
            const transferData: CreateTransferDTO = {
                idCompteCredit: 6,
                montant: 100
            };
            
            // Only one account belongs to the user
            mockQuery.mockResolvedValueOnce([[{ count: 1 }]]);

            // Assertion for the error
            await expect(serviceCreateTransfer(transferData, idCompteDebit, userId)).rejects.toThrow(
                new ApiError(ErrorResponses.UNAUTHORIZED)
            );
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });

        it('should throw a category not found error when the category does not exist', async () => {
            // Mock data
            const userId = 1;
            const idCompteDebit = 5;
            const transferData: CreateTransferDTO = {
                idCompteCredit: 6,
                montant: 100,
                idCategorie: 999 // Non-existent category
            };
            
            // Accounts belong to user but category doesn't exist
            mockQuery
                .mockResolvedValueOnce([[{ count: 2 }]]) // Account check
                .mockResolvedValueOnce([[{ count: 0 }]]); // Category check - not found

            // Assertion for the error
            await expect(serviceCreateTransfer(transferData, idCompteDebit, userId)).rejects.toThrow(
                new ApiError(ErrorResponses.CATEGORY_NOT_FOUND)
            );
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(2);
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });
    });

    describe('serviceFetchTransfersByAccountId', () => {
        it('should return an array of transfers for a specific account', async () => {
            // Mock data
            const userId = 1;
            const accountId = 5;
            const mockTransfers = [
                {
                    idVirement: 1,
                    idCompteDebit: accountId,
                    idCompteCredit: 6,
                    montant: 100,
                    dateVirement: new Date('2025-01-15'),
                    dateHeureCreation: new Date('2025-01-15'),
                    dateHeureMAJ: new Date('2025-01-15'),
                    idTiers: 1,
                    idCategorie: 2
                },
                {
                    idVirement: 2,
                    idCompteDebit: 7,
                    idCompteCredit: accountId,
                    montant: 200,
                    dateVirement: new Date('2025-01-16'),
                    dateHeureCreation: new Date('2025-01-16'),
                    dateHeureMAJ: new Date('2025-01-16')
                }
            ];

            // Mock the query responses
            mockQuery
                .mockResolvedValueOnce([[{ count: 1 }]]) // Account check
                .mockResolvedValueOnce([mockTransfers]); // Fetch transfers

            // Call the service
            const result = await serviceFetchTransfersByAccountId(accountId, userId);

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
                `SELECT * FROM Virement WHERE idCompteDebit = ? OR idCompteCredit = ?`,
                [accountId, accountId]
            );
            expect(mockRelease).toHaveBeenCalledTimes(1);
            expect(result.transfers).toHaveLength(2);
            expect(result.transfers[0]).toBeInstanceOf(TransferResponseDTO);
            expect(result.transfers[0].idVirement).toBe(1);
            expect(result.transfers[1].idVirement).toBe(2);
        });

        it('should throw an unauthorized error when the account does not belong to the user', async () => {
            // Mock data
            const userId = 1;
            const accountId = 5;
            
            // Account doesn't belong to user
            mockQuery.mockResolvedValueOnce([[{ count: 0 }]]);

            // Assertion for the error
            await expect(serviceFetchTransfersByAccountId(accountId, userId)).rejects.toThrow(
                new ApiError(ErrorResponses.UNAUTHORIZED)
            );
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });

        it('should return an empty array when no transfers exist for the account', async () => {
            // Mock data
            const userId = 1;
            const accountId = 5;
            
            // Mock the query responses
            mockQuery
                .mockResolvedValueOnce([[{ count: 1 }]]) // Account check
                .mockResolvedValueOnce([[]]); // No transfers found

            // Call the service
            const result = await serviceFetchTransfersByAccountId(accountId, userId);

            // Assertions
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(2);
            expect(mockRelease).toHaveBeenCalledTimes(1);
            expect(result.transfers).toHaveLength(0);
        });
    });
});
