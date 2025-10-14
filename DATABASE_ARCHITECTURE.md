# Database Architecture - Centralized Connection Management

## Overview

The database connection has been centralized using a singleton pattern to ensure efficient resource management and consistent database access across the application.

## Architecture Components

### 1. Database Manager (`src/core/database-manager.js`)

The centralized database manager provides:

- **Singleton Pattern**: Single database connection instance shared across the application
- **Connection Pooling**: Efficient connection management with proper error handling
- **Async/Await Support**: Modern promise-based API for all database operations
- **Transaction Support**: Built-in transaction handling for complex operations
- **Graceful Shutdown**: Proper connection cleanup on application termination

#### Key Methods:

```javascript
// Get database connection
await databaseManager.getConnection()

// Execute queries
await databaseManager.run(sql, params)     // INSERT, UPDATE, DELETE
await databaseManager.get(sql, params)     // SELECT single row
await databaseManager.all(sql, params)     // SELECT multiple rows

// Transaction support
await databaseManager.transaction(statements)

// Connection management
await databaseManager.close()
databaseManager.isDbConnected()
```

### 2. Core Database (`src/core/database.js`)

Updated to use the centralized manager while maintaining backward compatibility.

### 3. Repository Layer

Both `UsersRepository` and `PatientsRepository` have been updated to:

- Use the centralized database manager
- Implement async/await pattern
- Provide proper error handling with descriptive messages
- Remove duplicate connection logic

## Configuration

### Database Path Priority:

1. **Environment Variable**: `process.env.DB_FILE`
2. **Hardcoded Path**: `C:\Users\LENOVO\Documents\homeopathic.db` (for compatibility)
3. **Default Path**: `./data/database.sqlite`

### Environment Variables:

```bash
# Optional: Set custom database path
DB_FILE=/path/to/your/database.sqlite
```

## Benefits

### Before Centralization:
- ❌ Duplicate connection code in each repository
- ❌ Multiple database connections
- ❌ Inconsistent error handling
- ❌ No connection pooling
- ❌ Manual promise wrapping

### After Centralization:
- ✅ Single connection instance (singleton pattern)
- ✅ Consistent error handling across all repositories
- ✅ Built-in connection pooling and management
- ✅ Modern async/await API
- ✅ Transaction support
- ✅ Graceful shutdown handling
- ✅ Better performance and resource utilization

## Usage Examples

### Repository Implementation:
```javascript
const databaseManager = require('../../core/database-manager');

class UsersRepository {
  constructor() {
    this.dbManager = databaseManager;
  }

  async getAll() {
    try {
      const rows = await this.dbManager.all('SELECT * FROM users');
      return rows;
    } catch (err) {
      throw new Error(`Failed to get all users: ${err.message}`);
    }
  }
}
```

### Transaction Example:
```javascript
const statements = [
  { sql: 'INSERT INTO users (name, email) VALUES (?, ?)', params: ['John', 'john@example.com'] },
  { sql: 'INSERT INTO patients (name, age) VALUES (?, ?)', params: ['Jane', 25] }
];

const results = await databaseManager.transaction(statements);
```

## Migration Notes

- All repository methods are now async and return promises
- Service layer remains unchanged (already handled promises correctly)
- Controllers remain unchanged (already used async/await)
- Database initialization happens automatically on first connection
- Graceful shutdown is handled automatically

## Performance Improvements

- **Reduced Memory Usage**: Single connection instead of multiple instances
- **Better Error Handling**: Centralized error management with descriptive messages
- **Connection Reuse**: Efficient connection pooling
- **WAL Mode**: Enabled Write-Ahead Logging for better performance
- **Foreign Keys**: Enabled for data integrity

## Monitoring

The database manager provides connection status monitoring:

```javascript
// Check connection status
if (databaseManager.isDbConnected()) {
  console.log('Database is connected');
}
```

## Future Enhancements

- Connection retry logic with exponential backoff
- Database health checks endpoint
- Query performance monitoring
- Connection pool size configuration
- Read/write replica support
