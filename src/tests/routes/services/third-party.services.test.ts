import {
	serviceGetThirdPartyById,
	serviceCreateThirdParty,
	serviceUpdateThirdParty,
	serviceDeleteThirdParty,
	serviceGetThirdPartiesByUserId
} from '../../../routes/third-party/services';
import { getConnection } from 'lib/services/mysql';
import { CreateThirdPartyDTO, ThirdPartyResponseDTO, UpdateThirdPartyDTO } from '../../../routes/third-party/schema';
import { mockConnection, mockQuery, mockRelease } from '../../setup';
import { ApiError } from 'types/apiError';
import { ErrorResponses } from 'types/errorResponses';

describe('Third Party Services', () => {
	beforeEach(() => {
		(getConnection as jest.Mock).mockResolvedValue(mockConnection);
		jest.clearAllMocks();
	});

	describe('serviceGetThirdPartyById', () => {
		it('should return third party data when ID exists', async () => {
			const thirdPartyId = 1;
			const mockThirdParty = {
				thirdPartyId,
				thirdPartyName: 'AMAZON',
				userId: 1,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			mockQuery.mockResolvedValueOnce([[mockThirdParty]]);

			const result = await serviceGetThirdPartyById(thirdPartyId);

			expect(getConnection).toHaveBeenCalledTimes(1);
			expect(mockQuery).toHaveBeenCalledWith(
				expect.stringContaining("SELECT"),
				[thirdPartyId]
			);
			expect(mockRelease).toHaveBeenCalledTimes(1);
			expect(result).toBeInstanceOf(ThirdPartyResponseDTO);
			expect(result?.thirdPartyId).toBe(thirdPartyId);
			expect(result?.thirdPartyName).toBe(mockThirdParty.thirdPartyName);
			expect(result?.userId).toBe(mockThirdParty.userId);
		});

		it('should return null when third party ID does not exist', async () => {
			const nonExistentId = 999;

			mockQuery.mockResolvedValueOnce([[]]);

			const result = await serviceGetThirdPartyById(nonExistentId);

			expect(getConnection).toHaveBeenCalledTimes(1);
			expect(mockQuery).toHaveBeenCalledWith(
				expect.stringContaining("SELECT"),
				[nonExistentId]
			);
			expect(mockRelease).toHaveBeenCalledTimes(1);
			expect(result).toBeNull();
		});
	});

	describe('serviceCreateThirdParty', () => {
		it('should create a new third party and return it', async () => {
			const userId = 1;
			const thirdPartyName = 'New Third Party';
			const insertId = 5;
			const createThirdPartyDTO = new CreateThirdPartyDTO(thirdPartyName, userId);

			// Mock the insert query response
			mockQuery.mockResolvedValueOnce([{ insertId }]);

			const result = await serviceCreateThirdParty(createThirdPartyDTO, userId);

			expect(getConnection).toHaveBeenCalledTimes(1);
			expect(mockQuery).toHaveBeenCalledWith(
				expect.stringContaining("INSERT INTO Tiers"),
				[thirdPartyName, userId]
			);
			expect(mockRelease).toHaveBeenCalledTimes(1);
			expect(result).toBeInstanceOf(ThirdPartyResponseDTO);
			expect(result.thirdPartyId).toBe(insertId);
			expect(result.thirdPartyName).toBe(thirdPartyName);
			expect(result.userId).toBe(userId);
			expect(result.createdAt).toBeInstanceOf(Date);
		});
	});

	describe('serviceUpdateThirdParty', () => {
		it('should update an existing third party and return the updated data', async () => {
			const thirdPartyId = 1;
			const userId = 1;
			const newThirdPartyName = 'Updated Third Party';
			const updateThirdPartyDTO = new UpdateThirdPartyDTO(newThirdPartyName, userId);

			const existingThirdParty = {
				thirdPartyId,
				thirdPartyName: 'Original Third Party',
				userId,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			// Mock the getThirdPartyById response
			mockQuery.mockResolvedValueOnce([[existingThirdParty]]);

			// Mock the update query response
			mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

			const result = await serviceUpdateThirdParty(thirdPartyId, updateThirdPartyDTO, userId);

			expect(getConnection).toHaveBeenCalledTimes(2); // Once for get, once for update
			expect(mockQuery).toHaveBeenCalledWith(
				expect.stringContaining("UPDATE Tiers"),
				[newThirdPartyName, thirdPartyId]
			);
			expect(mockRelease).toHaveBeenCalledTimes(2);
			expect(result).toBeInstanceOf(ThirdPartyResponseDTO);
			expect(result?.thirdPartyId).toBe(thirdPartyId);
			expect(result?.thirdPartyName).toBe(newThirdPartyName);
			expect(result?.userId).toBe(userId);
		});

		it('should throw NOT_FOUND error when trying to update non-existent third party', async () => {
			const nonExistentId = 999;
			const userId = 1;
			const updateThirdPartyDTO = new UpdateThirdPartyDTO('Updated Name', userId);

			// Mock the getThirdPartyById response for non-existent third party
			mockQuery.mockResolvedValueOnce([[]]);

			await expect(serviceUpdateThirdParty(nonExistentId, updateThirdPartyDTO, userId))
				.rejects
				.toThrow(expect.objectContaining({
					statusCode: ErrorResponses.NOT_FOUND.statusCode,
					internalCode: ErrorResponses.NOT_FOUND.internalCode
				}));
		});

		it('should throw UNAUTHORIZED error when trying to update a third party owned by another user', async () => {
			const thirdPartyId = 1;
			const ownerId = 1;
			const differentUserId = 2;
			const updateThirdPartyDTO = new UpdateThirdPartyDTO('Updated Name', differentUserId);

			const existingThirdParty = {
				thirdPartyId,
				thirdPartyName: 'Original Third Party',
				userId: ownerId, // Owned by user 1
				createdAt: new Date(),
				updatedAt: new Date()
			};

			// Mock the getThirdPartyById response
			mockQuery.mockResolvedValueOnce([[existingThirdParty]]);

			await expect(serviceUpdateThirdParty(thirdPartyId, updateThirdPartyDTO, differentUserId))
				.rejects
				.toThrow(expect.objectContaining({
					statusCode: ErrorResponses.UNAUTHORIZED.statusCode,
					internalCode: ErrorResponses.UNAUTHORIZED.internalCode
				}));
		});
	});

	describe('serviceDeleteThirdParty', () => {
		it('should delete an existing third party and return true', async () => {
			const thirdPartyId = 1;
			const userId = 1;

			const existingThirdParty = {
				thirdPartyId,
				thirdPartyName: 'Third Party to Delete',
				userId,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			// Mock the getThirdPartyById response
			mockQuery.mockResolvedValueOnce([[existingThirdParty]]);

			// Mock the delete query response
			mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

			const result = await serviceDeleteThirdParty(thirdPartyId, userId);

			expect(getConnection).toHaveBeenCalledTimes(2); // Once for get, once for delete
			expect(mockQuery).toHaveBeenCalledWith(
				expect.stringContaining("DELETE FROM Tiers"),
				[thirdPartyId]
			);
			expect(mockRelease).toHaveBeenCalledTimes(2);
			expect(result).toBe(true);
		});

		it('should throw NOT_FOUND error when trying to delete non-existent third party', async () => {
			const nonExistentId = 999;
			const userId = 1;

			// Mock the getThirdPartyById response for non-existent third party
			mockQuery.mockResolvedValueOnce([[]]);

			await expect(serviceDeleteThirdParty(nonExistentId, userId))
				.rejects
				.toThrow(expect.objectContaining({
					statusCode: ErrorResponses.NOT_FOUND.statusCode,
					internalCode: ErrorResponses.NOT_FOUND.internalCode
				}));
		});

		it('should throw UNAUTHORIZED error when trying to delete a third party owned by another user', async () => {
			const thirdPartyId = 1;
			const ownerId = 1;
			const differentUserId = 2;

			const existingThirdParty = {
				thirdPartyId,
				thirdPartyName: 'Third Party to Delete',
				userId: ownerId, // Owned by user 1
				createdAt: new Date(),
				updatedAt: new Date()
			};

			// Mock the getThirdPartyById response
			mockQuery.mockResolvedValueOnce([[existingThirdParty]]);

			await expect(serviceDeleteThirdParty(thirdPartyId, differentUserId))
				.rejects
				.toThrow(expect.objectContaining({
					statusCode: ErrorResponses.UNAUTHORIZED.statusCode,
					internalCode: ErrorResponses.UNAUTHORIZED.internalCode
				}));
		});
	});

	describe('serviceGetThirdPartiesByUserId', () => {
		it('should return an array of third parties for a specific user', async () => {
			const userId = 1;
			const mockThirdParties = [
				{
					thirdPartyId: 1,
					thirdPartyName: 'Amazon',
					userId,
					createdAt: new Date(),
					updatedAt: new Date()
				},
				{
					thirdPartyId: 2,
					thirdPartyName: 'Walmart',
					userId,
					createdAt: new Date(),
					updatedAt: new Date()
				}
			];

			// Mock the query response
			mockQuery.mockResolvedValueOnce([mockThirdParties]);

			const result = await serviceGetThirdPartiesByUserId(userId);

			expect(getConnection).toHaveBeenCalledTimes(1);
			expect(mockQuery).toHaveBeenCalledWith(
				expect.stringContaining("SELECT"),
				[userId]
			);
			expect(mockRelease).toHaveBeenCalledTimes(1);
			expect(result).toBeInstanceOf(Array);
			expect(result.length).toBe(2);
			expect(result[0]).toBeInstanceOf(ThirdPartyResponseDTO);
			expect(result[0].thirdPartyId).toBe(mockThirdParties[0].thirdPartyId);
			expect(result[0].thirdPartyName).toBe(mockThirdParties[0].thirdPartyName);
			expect(result[0].userId).toBe(userId);
			expect(result[1].thirdPartyId).toBe(mockThirdParties[1].thirdPartyId);
		});

		it('should return an empty array when no third parties exist for the user', async () => {
			const userId = 1;

			// Mock the query response with empty array
			mockQuery.mockResolvedValueOnce([[]]);

			const result = await serviceGetThirdPartiesByUserId(userId);

			expect(getConnection).toHaveBeenCalledTimes(1);
			expect(mockQuery).toHaveBeenCalledWith(
				expect.stringContaining("SELECT"),
				[userId]
			);
			expect(mockRelease).toHaveBeenCalledTimes(1);
			expect(result).toBeInstanceOf(Array);
			expect(result.length).toBe(0);
		});
	});
});