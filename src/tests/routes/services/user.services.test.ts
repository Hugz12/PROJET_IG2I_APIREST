import { serviceGetUser, serviceUpdateUser } from "../../../routes/user/services";
import { getConnection } from "lib/services/mysql";
import { UpdateUserDTO, UserResponseDTO } from "../../../routes/user/schema";
import * as cryptUtils from "lib/utils/crypt";
import { mockConnection, mockQuery, mockRelease } from "../../setup";
import { ApiError } from "types/apiError";
import { ErrorResponses } from "types/errorResponses";

describe("User Services", () => {
	beforeEach(() => {
		(getConnection as jest.Mock).mockResolvedValue(mockConnection);
		(cryptUtils.hashPassword as jest.Mock).mockResolvedValue("salt:hashedpassword");
		jest.clearAllMocks();
	});

	describe("serviceGetUser", () => {
		it("should return user data when user exists", async () => {
			const userId = 1;
			const mockUser = {
				idUtilisateur: userId,
				nomUtilisateur: "Doe",
				prenomUtilisateur: "John",
				login: "john.doe@example.com",
				ville: "Paris",
				codePostal: "75000",
				dateHeureCreation: new Date(),
				dateHeureMAJ: new Date()
			};

			mockQuery.mockResolvedValueOnce([[mockUser]]);

			const result = await serviceGetUser(userId);

			expect(getConnection).toHaveBeenCalledTimes(1);
			expect(mockQuery).toHaveBeenCalledWith(
				"SELECT idUtilisateur, nomUtilisateur, prenomUtilisateur, login, ville, codePostal, dateHeureCreation, dateHeureMAJ FROM Utilisateur WHERE idUtilisateur = ?",
				[userId]
			);
			expect(mockRelease).toHaveBeenCalledTimes(1);
			expect(result).toBeInstanceOf(UserResponseDTO);
			expect(result.idUtilisateur).toBe(userId);
			expect(result.nomUtilisateur).toBe(mockUser.nomUtilisateur);
			expect(result.prenomUtilisateur).toBe(mockUser.prenomUtilisateur);
			expect(result.login).toBe(mockUser.login);
			expect(result.ville).toBe(mockUser.ville);
			expect(result.codePostal).toBe(mockUser.codePostal);
		});

		it("should throw USER_NOT_FOUND error when user does not exist", async () => {
			const nonExistentId = 999;

			// Mock an empty result
			mockQuery.mockResolvedValueOnce([[]]);

			// Assertion for the error
			await expect(serviceGetUser(nonExistentId)).rejects.toThrow(
				new ApiError(ErrorResponses.USER_NOT_FOUND)
			);
			expect(getConnection).toHaveBeenCalledTimes(1);
			expect(mockQuery).toHaveBeenCalledTimes(1);
			expect(mockRelease).toHaveBeenCalledTimes(1);
		});
	});

	describe("serviceUpdateUser", () => {
		it("should update an existing user and return the updated data", async () => {
			const userId = 1;
			const updateUserDTO = new UpdateUserDTO(
				"Updated Name",
				"Updated FirstName",
				"updated.email@example.com",
				"newPassword",
				"Updated City",
				75001
			);

			const mockExistingUser = [{ idUtilisateur: userId }];
			const mockEmailCheck: { idUtilisateur: number }[] = [];
			const mockUpdatedUser = {
				idUtilisateur: userId,
				nomUtilisateur: updateUserDTO.nomUtilisateur,
				prenomUtilisateur: updateUserDTO.prenomUtilisateur,
				login: updateUserDTO.login,
				ville: updateUserDTO.ville,
				codePostal: updateUserDTO.codePostal?.toString(),
				dateHeureCreation: new Date(),
				dateHeureMAJ: new Date()
			};

			// Mock the query responses
			mockQuery
				.mockResolvedValueOnce([mockExistingUser]) // Check if user exists
				.mockResolvedValueOnce([mockEmailCheck])   // Check if email is already taken
				.mockResolvedValueOnce([{ affectedRows: 1 }]) // Update user
				.mockResolvedValueOnce([[mockUpdatedUser]]); // Get updated user

			// Call the service
			const result = await serviceUpdateUser(userId, updateUserDTO);

			// Assertions
			expect(getConnection).toHaveBeenCalledTimes(2); // Once for update, once for getUser
			expect(mockQuery).toHaveBeenCalledTimes(4);
			expect(mockQuery).toHaveBeenNthCalledWith(
				1,
				"SELECT idUtilisateur FROM Utilisateur WHERE idUtilisateur = ?",
				[userId]
			);
			expect(mockQuery).toHaveBeenNthCalledWith(
				2,
				"SELECT idUtilisateur FROM Utilisateur WHERE login = ? AND idUtilisateur != ?",
				[updateUserDTO.login, userId]
			);
			expect(mockQuery).toHaveBeenNthCalledWith(
				3,
				expect.stringContaining("UPDATE Utilisateur SET"),
				expect.arrayContaining([
					updateUserDTO.login,
					"salt:hashedpassword", // mocked hashed password
					updateUserDTO.ville,
					updateUserDTO.codePostal,
					updateUserDTO.nomUtilisateur,
					updateUserDTO.prenomUtilisateur,
					userId
				])
			);
			expect(mockRelease).toHaveBeenCalledTimes(2);
			expect(result).toBeInstanceOf(UserResponseDTO);
			expect(result.idUtilisateur).toBe(userId);
			expect(result.nomUtilisateur).toBe(updateUserDTO.nomUtilisateur);
			expect(result.prenomUtilisateur).toBe(updateUserDTO.prenomUtilisateur);
			expect(result.login).toBe(updateUserDTO.login);
			expect(result.ville).toBe(updateUserDTO.ville);
			expect(result.codePostal).toBe(updateUserDTO.codePostal?.toString());
		});

		it("should update a user with only some fields provided", async () => {
			const userId = 1;
			const updateUserDTO = new UpdateUserDTO(
				"Updated Name",
				"Updated FirstName"
			);

			const mockExistingUser = [{ idUtilisateur: userId }];
			const mockUpdatedUser = {
				idUtilisateur: userId,
				nomUtilisateur: updateUserDTO.nomUtilisateur,
				prenomUtilisateur: updateUserDTO.prenomUtilisateur,
				login: "existing@email.com",
				ville: null,
				codePostal: null,
				dateHeureCreation: new Date(),
				dateHeureMAJ: new Date()
			};

			// Mock the query responses
			mockQuery
				.mockResolvedValueOnce([mockExistingUser]) // Check if user exists
				.mockResolvedValueOnce([{ affectedRows: 1 }]) // Update user
				.mockResolvedValueOnce([[mockUpdatedUser]]); // Get updated user

			// Call the service
			const result = await serviceUpdateUser(userId, updateUserDTO);

			// Assertions
			expect(getConnection).toHaveBeenCalledTimes(2);
			expect(mockQuery).toHaveBeenCalledTimes(3);
			expect(mockQuery).toHaveBeenNthCalledWith(
				2,
				expect.stringContaining("UPDATE Utilisateur SET"),
				expect.arrayContaining([
					updateUserDTO.nomUtilisateur,
					updateUserDTO.prenomUtilisateur,
					userId
				])
			);
			expect(result).toBeInstanceOf(UserResponseDTO);
			expect(result.nomUtilisateur).toBe(updateUserDTO.nomUtilisateur);
			expect(result.prenomUtilisateur).toBe(updateUserDTO.prenomUtilisateur);
		});

		it("should throw USER_NOT_FOUND error when trying to update non-existent user", async () => {
			const nonExistentId = 999;
			const updateUserDTO = new UpdateUserDTO("Test", "User");

			// Mock an empty result for user check
			mockQuery.mockResolvedValueOnce([[]]);

			// Assertion for the error
			await expect(serviceUpdateUser(nonExistentId, updateUserDTO)).rejects.toThrow(
				new ApiError(ErrorResponses.USER_NOT_FOUND)
			);
			expect(getConnection).toHaveBeenCalledTimes(1);
			expect(mockQuery).toHaveBeenCalledTimes(1);
			expect(mockRelease).toHaveBeenCalledTimes(1);
		});

		it("should throw DUPLICATE_EMAIL error when email is already taken by another user", async () => {
			const userId = 1;
			const duplicateEmail = "duplicate@example.com";
			const updateUserDTO = new UpdateUserDTO("Test", "User", duplicateEmail);

			// Mock responses
			mockQuery
				.mockResolvedValueOnce([[{ idUtilisateur: userId }]]) // User exists
				.mockResolvedValueOnce([[{ idUtilisateur: 2 }]]); // Another user already has this email

			// Assertion for the error
			await expect(serviceUpdateUser(userId, updateUserDTO)).rejects.toThrow(
				new ApiError(ErrorResponses.DUPLICATE_EMAIL)
			);
			expect(getConnection).toHaveBeenCalledTimes(1);
			expect(mockQuery).toHaveBeenCalledTimes(2);
			expect(mockRelease).toHaveBeenCalledTimes(1);
		});

		it("should throw NO_FIELDS_TO_UPDATE error when no fields are provided to update", async () => {
			const userId = 1;
			// Empty update DTO
			const emptyUserDTO = new UpdateUserDTO(undefined as unknown as string, undefined as unknown as string);

			// Mock response for user check
			mockQuery.mockResolvedValueOnce([[{ idUtilisateur: userId }]]);

			// Assertion for the error
			await expect(serviceUpdateUser(userId, emptyUserDTO)).rejects.toThrow(
				new ApiError(ErrorResponses.NO_FIELDS_TO_UPDATE)
			);
			expect(getConnection).toHaveBeenCalledTimes(1);
			expect(mockQuery).toHaveBeenCalledTimes(1);
			expect(mockRelease).toHaveBeenCalledTimes(1);
		});
	});
});
