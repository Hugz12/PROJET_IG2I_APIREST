import { serviceGetUser } from '../routes/user/services';
import { getConnection } from 'lib/services/mysql';
import { ApiError } from 'types/apiError';
import { ErrorResponses } from 'types/errorResponses';
import { UpdateUserDTO, UserResponseDTO } from '../routes/user/schema';
import * as cryptUtils from 'lib/utils/crypt';

// Mock the MySQL connection
jest.mock('lib/services/mysql', () => ({
  getConnection: jest.fn(),
}));

// Mock the crypto utilities
jest.mock('lib/utils/crypt', () => ({
  hashPassword: jest.fn(),
}));

describe('User Services', () => {
  // Mock connection and query results
  const mockRelease = jest.fn();
  const mockQuery = jest.fn();
  const mockConnection = {
    query: mockQuery,
    release: mockRelease 
  };
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    (getConnection as jest.Mock).mockResolvedValue(mockConnection);
    (cryptUtils.hashPassword as jest.Mock).mockResolvedValue('salt:hashedpassword');
  });

  describe('serviceGetUser', () => {
    it('should return user data when user exists', async () => {
      // Arrange
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
      
      // Act
      const result = await serviceGetUser(userId);
      
      // Assert 
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
