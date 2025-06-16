
// Set a longer timeout for tests if needed
jest.setTimeout(10000); // 10 seconds

// You can add global setup code here that will run before all tests
// For example, common mocks, environment variables, etc.

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// You can add global teardown code here that will run after all tests
