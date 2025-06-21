import { serviceGetUser } from '../../../routes/user/services';
import { getConnection } from 'lib/services/mysql';
import { UserResponseDTO } from '../../../routes/user/schema';
import * as cryptUtils from 'lib/utils/crypt';
import { mockConnection, mockQuery, mockRelease } from '../../setup';

describe('User Services', () => {
	beforeEach(() => {
		(getConnection as jest.Mock).mockResolvedValue(mockConnection);
		(cryptUtils.hashPassword as jest.Mock).mockResolvedValue('salt:hashedpassword');
	});

	describe('serviceGetUser', () => {
		it('should return user data when user exists', async () => {
			const userId = 1;
			const mockUser = {
				idUtilisateur: userId,
				nomUtilisateur: 'Doe',
				prenomUtilisateur: 'John',
				login: 'john.doe@example.com',
				ville: 'Paris',
				codePostal: '75000',
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
	});
});
