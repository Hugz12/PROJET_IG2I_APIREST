import { 
    serviceCreateAccount, 
    serviceGetUserAccounts, 
    serviceGetAccountById, 
    serviceUpdateAccount 
} from '../../../routes/account/services';
import { getConnection } from 'lib/services/mysql';
import { AccountResponseDTO, CreateAccountDTO, UpdateAccountDTO } from '../../../routes/account/schema';
import { ApiError } from '../../../types/apiError';
import { ErrorResponses } from '../../../types/errorResponses';
import { mockConnection, mockQuery, mockRelease } from '../../setup';

describe('Account Services', () => {
    beforeEach(() => {
        (getConnection as jest.Mock).mockResolvedValue(mockConnection);
        jest.clearAllMocks();
    });

    describe('serviceCreateAccount', () => {
        it('should create a new account and return it', async () => {
            // Mock data
            const userId = 1;
            const accountData: CreateAccountDTO = {
                descriptionCompte: 'Test Account',
                nomBanque: 'Test Bank',
                soldeInitial: 1000
            };
            const insertId = 5;
            const mockInsertResult = { affectedRows: 1, insertId };
            const mockCreatedAccount = {
                idCompte: insertId,
                descriptionCompte: accountData.descriptionCompte,
                nomBanque: accountData.nomBanque,
                soldeInitial: accountData.soldeInitial,
                dernierSolde: accountData.soldeInitial,
                idUtilisateur: userId,
                dateHeureCreation: new Date(),
                dateHeureMAJ: new Date(),
            };

            // Mock the query responses
            mockQuery
                .mockResolvedValueOnce([mockInsertResult])
                .mockResolvedValueOnce([[mockCreatedAccount]]);

            // Call the service
            const result = await serviceCreateAccount(accountData, userId);

            // Assertions
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(2);
            expect(mockQuery).toHaveBeenNthCalledWith(
                1,
                "INSERT INTO Compte (descriptionCompte, nomBanque, soldeInitial, idUtilisateur) VALUES (?, ?, ?, ?)",
                [accountData.descriptionCompte, accountData.nomBanque, accountData.soldeInitial, userId]
            );
            expect(mockQuery).toHaveBeenNthCalledWith(
                2,
                "SELECT * FROM Compte WHERE idCompte = ?",
                [insertId]
            );
            expect(mockRelease).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ account: mockCreatedAccount });
        });

        it('should throw an error when account creation fails', async () => {
            // Mock data
            const userId = 1;
            const accountData: CreateAccountDTO = {
                descriptionCompte: 'Test Account',
                nomBanque: 'Test Bank',
                soldeInitial: 1000
            };
            const mockInsertResult = { affectedRows: 0 };

            // Mock the query response
            mockQuery.mockResolvedValueOnce([mockInsertResult]);

            // Assertion for the error
            await expect(serviceCreateAccount(accountData, userId)).rejects.toThrow(
                new ApiError(ErrorResponses.ACCOUNT_CREATION_FAILED)
            );
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });
    });

    describe('serviceGetUserAccounts', () => {
        it('should return an array of accounts for a specific user', async () => {
            // Mock data
            const userId = 1;
            const mockAccounts = [
                {
                    idCompte: 1,
                    descriptionCompte: 'Account 1',
                    nomBanque: 'Bank 1',
                    soldeInitial: 1000,
                    dernierSolde: 1200,
                    idUtilisateur: userId,
                    dateHeureCreation: new Date(),
                    dateHeureMAJ: new Date(),
                },
                {
                    idCompte: 2,
                    descriptionCompte: 'Account 2',
                    nomBanque: 'Bank 2',
                    soldeInitial: 2000,
                    dernierSolde: 1800,
                    idUtilisateur: userId,
                    dateHeureCreation: new Date(),
                    dateHeureMAJ: new Date(),
                },
            ];

            // Mock the query response
            mockQuery.mockResolvedValueOnce([mockAccounts]);

            // Call the service
            const result = await serviceGetUserAccounts(userId);

            // Assertions
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledWith(
                "SELECT * FROM Compte WHERE idUtilisateur = ? ORDER BY dateHeureCreation DESC",
                [userId]
            );
            expect(mockRelease).toHaveBeenCalledTimes(1);
            expect(result.accounts).toHaveLength(2);
            expect(result.accounts[0]).toBeInstanceOf(AccountResponseDTO);
            expect(result.accounts[0].idCompte).toBe(mockAccounts[0].idCompte);
            expect(result.accounts[0].descriptionCompte).toBe(mockAccounts[0].descriptionCompte);
            expect(result.accounts[1].idCompte).toBe(mockAccounts[1].idCompte);
        });

        it('should return an empty array when no accounts exist for the user', async () => {
            // Mock data
            const userId = 1;

            // Mock the query response
            mockQuery.mockResolvedValueOnce([[]]);

            // Call the service
            const result = await serviceGetUserAccounts(userId);

            // Assertions
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledWith(
                "SELECT * FROM Compte WHERE idUtilisateur = ? ORDER BY dateHeureCreation DESC",
                [userId]
            );
            expect(mockRelease).toHaveBeenCalledTimes(1);
            expect(result.accounts).toHaveLength(0);
        });
    });

    describe('serviceGetAccountById', () => {
        it('should return account data when ID exists and belongs to user', async () => {
            // Mock data
            const accountId = 1;
            const userId = 1;
            const mockAccount = {
                idCompte: accountId,
                descriptionCompte: 'Test Account',
                nomBanque: 'Test Bank',
                soldeInitial: 1000,
                dernierSolde: 1200,
                idUtilisateur: userId,
                dateHeureCreation: new Date(),
                dateHeureMAJ: new Date(),
            };

            // Mock the query response
            mockQuery.mockResolvedValueOnce([[mockAccount]]);

            // Call the service
            const result = await serviceGetAccountById(accountId, userId);

            // Assertions
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledWith(
                "SELECT * FROM Compte WHERE idCompte = ?",
                [accountId, userId]
            );
            expect(mockRelease).toHaveBeenCalledTimes(1);
            expect(result.account).toBeInstanceOf(AccountResponseDTO);
            expect(result.account.idCompte).toBe(accountId);
            expect(result.account.descriptionCompte).toBe(mockAccount.descriptionCompte);
            expect(result.account.nomBanque).toBe(mockAccount.nomBanque);
            expect(result.account.soldeInitial).toBe(mockAccount.soldeInitial);
            expect(result.account.dernierSolde).toBe(mockAccount.dernierSolde);
            expect(result.account.idUtilisateur).toBe(userId);
        });

        it('should throw NOT_FOUND error when account ID does not exist', async () => {
            // Mock data
            const accountId = 999;
            const userId = 1;

            // Mock the query response
            mockQuery.mockResolvedValueOnce([[]]);

            // Assertion for the error
            await expect(serviceGetAccountById(accountId, userId)).rejects.toThrow(
                new ApiError(ErrorResponses.NOT_FOUND)
            );
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });

        it('should throw UNAUTHORIZED error when account does not belong to user', async () => {
            // Mock data
            const accountId = 1;
            const userId = 1;
            const differentUserId = 2;
            const mockAccount = {
                idCompte: accountId,
                descriptionCompte: 'Test Account',
                nomBanque: 'Test Bank',
                soldeInitial: 1000,
                dernierSolde: 1200,
                idUtilisateur: differentUserId,
                dateHeureCreation: new Date(),
                dateHeureMAJ: new Date(),
            };

            // Mock the query response
            mockQuery.mockResolvedValueOnce([[mockAccount]]);

            // Assertion for the error
            await expect(serviceGetAccountById(accountId, userId)).rejects.toThrow(
                new ApiError(ErrorResponses.UNAUTHORIZED)
            );
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });
    });

    describe('serviceUpdateAccount', () => {
        it('should update an existing account and return the updated data', async () => {
            // Mock data
            const accountId = 1;
            const userId = 1;
            const updateData: UpdateAccountDTO = {
                descriptionCompte: 'Updated Account',
                nomBanque: 'Updated Bank'
            };
            const originalAccount = {
                idCompte: accountId,
                descriptionCompte: 'Original Account',
                nomBanque: 'Original Bank',
                soldeInitial: 1000,
                dernierSolde: 1200,
                idUtilisateur: userId,
                dateHeureCreation: new Date(),
                dateHeureMAJ: new Date(),
            };
            const updatedAccount = {
                ...originalAccount,
                descriptionCompte: updateData.descriptionCompte,
                nomBanque: updateData.nomBanque,
                dateHeureMAJ: new Date(),
            };

            // Mock the query responses
            mockQuery
                .mockResolvedValueOnce([[originalAccount]])  // Check if account exists
                .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update query
                .mockResolvedValueOnce([[updatedAccount]]);  // Get updated account

            // Call the service
            const result = await serviceUpdateAccount(accountId, updateData, userId);

            // Assertions
            expect(getConnection).toHaveBeenCalledTimes(2); // One for update, one for get
            expect(mockQuery).toHaveBeenCalledTimes(3);
            expect(mockQuery).toHaveBeenNthCalledWith(
                1,
                "SELECT * FROM Compte WHERE idCompte = ?",
                [accountId, userId]
            );
            expect(mockQuery).toHaveBeenNthCalledWith(
                2,
                expect.stringContaining("UPDATE Compte SET"),
                expect.arrayContaining([updateData.descriptionCompte, updateData.nomBanque, accountId, userId])
            );
            expect(mockRelease).toHaveBeenCalledTimes(2);
            expect(result.account).toBeInstanceOf(AccountResponseDTO);
            expect(result.account.descriptionCompte).toBe(updateData.descriptionCompte);
            expect(result.account.nomBanque).toBe(updateData.nomBanque);
        });

        it('should throw NOT_FOUND error when trying to update non-existent account', async () => {
            // Mock data
            const accountId = 999;
            const userId = 1;
            const updateData: UpdateAccountDTO = {
                descriptionCompte: 'Updated Account',
                nomBanque: 'Updated Bank'
            };

            // Mock the query response
            mockQuery.mockResolvedValueOnce([[]]);

            // Assertion for the error
            await expect(serviceUpdateAccount(accountId, updateData, userId)).rejects.toThrow(
                new ApiError(ErrorResponses.NOT_FOUND)
            );
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });

        it('should throw UNAUTHORIZED error when trying to update an account owned by another user', async () => {
            // Mock data
            const accountId = 1;
            const userId = 1;
            const differentUserId = 2;
            const updateData: UpdateAccountDTO = {
                descriptionCompte: 'Updated Account',
                nomBanque: 'Updated Bank'
            };
            const mockAccount = {
                idCompte: accountId,
                descriptionCompte: 'Original Account',
                nomBanque: 'Original Bank',
                soldeInitial: 1000,
                dernierSolde: 1200,
                idUtilisateur: differentUserId,
                dateHeureCreation: new Date(),
                dateHeureMAJ: new Date(),
            };

            // Mock the query response
            mockQuery.mockResolvedValueOnce([[mockAccount]]);

            // Assertion for the error
            await expect(serviceUpdateAccount(accountId, updateData, userId)).rejects.toThrow(
                new ApiError(ErrorResponses.UNAUTHORIZED)
            );
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });

        it('should throw BAD_REQUEST error when no fields are provided to update', async () => {
            // Mock data
            const accountId = 1;
            const userId = 1;
            const updateData: UpdateAccountDTO = {}; // Empty update data
            const mockAccount = {
                idCompte: accountId,
                descriptionCompte: 'Original Account',
                nomBanque: 'Original Bank',
                soldeInitial: 1000,
                dernierSolde: 1200,
                idUtilisateur: userId,
                dateHeureCreation: new Date(),
                dateHeureMAJ: new Date(),
            };

            // Mock the query response
            mockQuery.mockResolvedValueOnce([[mockAccount]]);

            // Assertion for the error
            await expect(serviceUpdateAccount(accountId, updateData, userId)).rejects.toThrow(
                new ApiError(ErrorResponses.BAD_REQUEST)
            );
            expect(getConnection).toHaveBeenCalledTimes(1);
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockRelease).toHaveBeenCalledTimes(1);
        });
    });
});
