# MySQL Mock Service

This document provides guidance on using the MySQL mock service for testing.

## Overview

The MySQL mock service allows you to test services that depend on MySQL without actually connecting to a database. It provides a way to simulate database responses for specific queries.

## How to Use

1. Import the mock service in your test file:

```typescript
import { mockMysql } from '../lib/mocks/mysql.mock';
import { jest } from '@jest/globals';
```

2. Mock the MySQL service before importing your actual service:

```typescript
jest.mock('../lib/services/mysql', () => ({
  getConnection: () => mockMysql.getConnection(),
}));

// Now you can import your service
import { yourService } from '../path/to/your/service';
```

3. Setup mock responses in your test:

```typescript
beforeEach(() => {
  // Reset mocks before each test
  mockMysql.resetMocks();
  
  // Set up mock responses
  mockMysql.connection.setMockQueryResult(
    "SELECT * FROM YourTable WHERE field = ?",
    ["value"],
    [[{ id: 1, field: "value", otherField: "data" }]]
  );
});
```

4. Test your service:

```typescript
it('should work with mock data', async () => {
  const result = await yourService.someMethod();
  expect(result).toEqual(expectedValue);
});
```

## API Reference

### `mockMysql` Object

- `connection`: Instance of `MockConnection`
- `getConnection()`: Returns a Promise that resolves to the mock connection
- `resetMocks()`: Resets all mock data

### `MockConnection` Class

- `query(sql: string, values?: any)`: Mocks the query method of a MySQL connection
- `setMockQueryResult(sql: string, values: any, result: any)`: Sets a mock result for a specific query
- `setMockQueryError(sql: string, values: any, error: Error)`: Sets a mock error for a specific query
- `release()`: Mocks the release method of a MySQL connection
- `resetMocks()`: Clears all mock results and errors

## Important Notes

1. Always reset mocks before each test to ensure test isolation.
2. Mock query results should match the format returned by mysql2/promise:
   - For SELECT queries: `[[rows], [fields]]`
   - For INSERT/UPDATE/DELETE queries: `[[{ affectedRows, insertId }], [fields]]`
3. The query key is created using both the SQL string and the values, so both need to match exactly for the mock to work.

## Example

See `src/tests/mockMysql.test.ts` for a complete example of how to use the MySQL mock service.
