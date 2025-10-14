const databaseManager = require('./database-manager');

// Initialize database connection on module load
databaseManager.getConnection().catch(err => {
  console.error('Failed to initialize database:', err.message);
  process.exit(1);
});

// Export the database manager for backward compatibility
module.exports = databaseManager;