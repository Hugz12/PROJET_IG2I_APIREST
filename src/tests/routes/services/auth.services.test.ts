import { serviceLogin, serviceRegister } from '../../../routes/auth/services';
import { getConnection } from 'lib/services/mysql';
import { LoginDTO, RegisterDTO } from '../../../routes/auth/schema';
import * as cryptUtils from 'lib/utils/crypt';
import * as jwtService from 'lib/services/jwt';
import { mockConnection, mockQuery, mockRelease } from '../../setup';
import { ApiError } from 'types/apiError';
import { ErrorResponses } from 'types/errorResponses';

describe('Auth Services', () => {
	beforeEach(() => {
		// Setup basic mocks
		(getConnection as jest.Mock).mockResolvedValue(mockConnection);
		(cryptUtils.hashPassword as jest.Mock).mockResolvedValue('salt:hashedpassword');
		jest.spyOn(cryptUtils, 'verifyPassword');
		jest.spyOn(jwtService, 'generateToken');
		jest.clearAllMocks();
	});

	describe('serviceRegister', () => {
		it('should register a new user and return a token', async () => {
			// Mock data
			const registerData: RegisterDTO = new RegisterDTO(
				'new.user@example.com',
				'password123',
				'Doe',
				'John',
				'Paris',
				75000
			);
			const insertId = 1;
			const mockInsertResult = { insertId };
			
			// Mock the query responses
			mockQuery
				.mockResolvedValueOnce([[{ count: 0 }]]) // No existing user with this email
				.mockResolvedValueOnce([mockInsertResult]); // Insert new user
				
			// Mock the token generation
			jest.spyOn(jwtService, 'generateToken').mockReturnValue('mocked.jwt.token');

			// Call the service
			const result = await serviceRegister(registerData);

			// Assertions
			expect(getConnection).toHaveBeenCalledTimes(1);
			expect(mockQuery).toHaveBeenCalledTimes(2);
			expect(mockQuery).toHaveBeenNthCalledWith(
				1,
				"SELECT count(*) as count FROM Utilisateur WHERE login = ?",
				[registerData.login]
			);
			expect(mockQuery).toHaveBeenNthCalledWith(
				2,
				"INSERT INTO Utilisateur (login, mdp, nomUtilisateur, prenomUtilisateur, ville, codePostal) VALUES (?, ?, ?, ?, ?, ?)",
				[
					registerData.login,
					'salt:hashedpassword',
					registerData.nomUtilisateur,
					registerData.prenomUtilisateur,
					registerData.ville,
					registerData.codePostal
				]
			);
			expect(cryptUtils.hashPassword).toHaveBeenCalledWith(registerData.mdp);
			expect(jwtService.generateToken).toHaveBeenCalledWith({
				idUtilisateur: insertId,
				login: registerData.login
			});
			expect(mockRelease).toHaveBeenCalledTimes(1);
			expect(result).toEqual({ token: 'mocked.jwt.token' });
		});

		it('should throw DUPLICATE_EMAIL error when email already exists', async () => {
			// Mock data
			const registerData: RegisterDTO = new RegisterDTO(
				'existing.user@example.com',
				'password123',
				'Doe',
				'John',
				'Paris',
				75000
			);

			// Mock the query response for existing user check
			mockQuery.mockResolvedValueOnce([[{ count: 1 }]]); // Email already exists

			// Assertion for the error
			await expect(serviceRegister(registerData)).rejects.toThrow(
				new ApiError(ErrorResponses.DUPLICATE_EMAIL)
			);
			expect(getConnection).toHaveBeenCalledTimes(1);
			expect(mockQuery).toHaveBeenCalledTimes(1);
			expect(mockQuery).toHaveBeenCalledWith(
				"SELECT count(*) as count FROM Utilisateur WHERE login = ?",
				[registerData.login]
			);
			expect(mockRelease).toHaveBeenCalledTimes(1);
		});
	});

	describe('serviceLogin', () => {
		it('should log in a user and return a token when credentials are valid', async () => {
			// Mock data
			const loginData: LoginDTO = new LoginDTO(
				'user@example.com',
				'password123'
			);
			const mockUser = {
				idUtilisateur: 1,
				login: 'user@example.com',
				mdp: 'salt:hashedpassword',
				nomUtilisateur: 'Doe',
				prenomUtilisateur: 'John',
				ville: 'Paris',
				codePostal: '75000',
				dateHeureCreation: new Date(),
				dateHeureMAJ: new Date()
			};

			// Mock the query response for user lookup
			mockQuery.mockResolvedValueOnce([[mockUser]]);
			
			// Mock password verification to return true
			jest.spyOn(cryptUtils, 'verifyPassword').mockReturnValue(true);
			
			// Mock token generation
			jest.spyOn(jwtService, 'generateToken').mockReturnValue('mocked.jwt.token');

			// Call the service
			const result = await serviceLogin(loginData);

			// Assertions
			expect(getConnection).toHaveBeenCalledTimes(1);
			expect(mockQuery).toHaveBeenCalledWith(
				"SELECT * FROM Utilisateur WHERE login = ?",
				[loginData.login]
			);
			expect(cryptUtils.verifyPassword).toHaveBeenCalledWith(
				loginData.mdp,
				mockUser.mdp
			);
			expect(jwtService.generateToken).toHaveBeenCalledWith({
				idUtilisateur: mockUser.idUtilisateur,
				login: mockUser.login
			});
			expect(mockRelease).toHaveBeenCalledTimes(1);
			expect(result).toEqual({ token: 'mocked.jwt.token' });
		});

		it('should throw INVALID_CREDENTIALS error when user does not exist', async () => {
			// Mock data
			const loginData: LoginDTO = new LoginDTO(
				'nonexistent@example.com',
				'password123'
			);

			// Mock empty result for user lookup
			mockQuery.mockResolvedValueOnce([[]]);

			// Assertion for the error
			await expect(serviceLogin(loginData)).rejects.toThrow(
				new ApiError(ErrorResponses.INVALID_CREDENTIALS)
			);
			expect(getConnection).toHaveBeenCalledTimes(1);
			expect(mockQuery).toHaveBeenCalledWith(
				"SELECT * FROM Utilisateur WHERE login = ?",
				[loginData.login]
			);
			expect(mockRelease).toHaveBeenCalledTimes(1);
		});

		it('should throw INVALID_CREDENTIALS error when password is incorrect', async () => {
			// Mock data
			const loginData: LoginDTO = new LoginDTO(
				'user@example.com',
				'wrongpassword'
			);
			const mockUser = {
				idUtilisateur: 1,
				login: 'user@example.com',
				mdp: 'salt:hashedpassword',
				nomUtilisateur: 'Doe',
				prenomUtilisateur: 'John'
			};

			// Mock the query response for user lookup
			mockQuery.mockResolvedValueOnce([[mockUser]]);
			
			// Mock password verification to return false
			jest.spyOn(cryptUtils, 'verifyPassword').mockReturnValue(false);

			// Assertion for the error
			await expect(serviceLogin(loginData)).rejects.toThrow(
				new ApiError(ErrorResponses.INVALID_CREDENTIALS)
			);
			expect(getConnection).toHaveBeenCalledTimes(1);
			expect(mockQuery).toHaveBeenCalledWith(
				"SELECT * FROM Utilisateur WHERE login = ?",
				[loginData.login]
			);
			expect(cryptUtils.verifyPassword).toHaveBeenCalledWith(
				loginData.mdp,
				mockUser.mdp
			);
			expect(mockRelease).toHaveBeenCalledTimes(1);
		});
	});
});
