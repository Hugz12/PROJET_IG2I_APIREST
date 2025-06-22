import { getConnection } from "lib/services/mysql";
import * as cryptUtils from "lib/utils/crypt";

// Define a timeout to prevent tests from hanging indefinitely
jest.setTimeout(10000);

jest.mock("lib/services/mysql", () => ({
	getConnection: jest.fn(),
}));

jest.mock("lib/utils/crypt", () => ({
	hashPassword: jest.fn(),
	verifyPassword: jest.fn(),
}));

export const mockRelease = jest.fn();
export const mockQuery = jest.fn();
export const mockConnection = {
	query: mockQuery,
	release: mockRelease
};

beforeEach(() => {
	(getConnection as jest.Mock).mockResolvedValue(mockConnection);
	(cryptUtils.hashPassword as jest.Mock).mockResolvedValue("salt:hashedpassword");
});

afterEach(() => {
	jest.clearAllMocks();
});
