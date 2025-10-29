const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;

class DatabaseManager {
  constructor() {
    this.db = null;
    this.isConnected = false;
    this.connectionPromise = null;
  }

  /**
   * Get database connection instance (singleton pattern)
   * @returns {Promise<sqlite3.Database>}
   */
  async getConnection() {
    if (this.db && this.isConnected) {
      return this.db;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = this._createConnection();
    return this.connectionPromise;
  }

  /**
   * Create database connection with proper error handling and retry logic
   * @private
   * @returns {Promise<sqlite3.Database>}
   */
  _createConnection() {
    return new Promise((resolve, reject) => {
      const dbPath = this._getDbPath();
      
      console.log('Initializing database connection...');
      console.log('Database path:', dbPath);

      this.db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE | sqlite3.OPEN_FULLMUTEX, (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          this.isConnected = false;
          this.connectionPromise = null;
          
          // Handle specific SQLITE_BUSY error
          if (err.code === 'SQLITE_BUSY') {
            console.log('Database is busy, attempting retry in 1 second...');
            setTimeout(() => {
              this.connectionPromise = null;
              this._createConnection().then(resolve).catch(reject);
            }, 1000);
            return;
          }
          
          reject(err);
        } else {
          console.log('Successfully connected to SQLite database');
          this.isConnected = true;
          this._setupDatabase();
          resolve(this.db);
        }
      });

      // Handle database errors after connection
      this.db.on('error', (err) => {
        console.error('Database error:', err.message);
        this.isConnected = false;
        
        // Don't crash on SQLITE_BUSY errors during operation
        if (err.code !== 'SQLITE_BUSY') {
          throw err;
        }
      });
    });
  }

  /**
   * Get database path from environment or use default
   * @private
   * @returns {string}
   */
  _getDbPath() {
    // Priority: 1. Environment variable, 2. Hardcoded path, 3. Default path
    if (process.env.DB_FILE && process.env.DB_FILE.trim() !== '') {
      return process.env.DB_FILE;
    }
    
    // Fallback to hardcoded path for compatibility
    const hardcodedPath = 'C:\\Users\\LENOVO\\Documents\\homeopathy.db';
    if (require('fs').existsSync(hardcodedPath)) {
      return hardcodedPath;
    }
    
    // Default path
    return path.resolve(__dirname, '..', '..', 'data', 'database.sqlite');
  }

  /**
   * Setup database tables and initial configuration
   * @private
   */
  async _setupDatabase() {
    // Configure SQLite for better concurrency and error handling
    this.db.configure('busyTimeout', 60000); // 60 second timeout for busy database
    
    // Enable foreign keys
    this.db.run('PRAGMA foreign_keys = ON');
    
    // Set journal mode for better performance and concurrency
    this.db.run('PRAGMA journal_mode = WAL');
    
    // Set busy timeout at SQL level as well
    this.db.run('PRAGMA busy_timeout = 60000');
    
    // Optimize for better performance
    this.db.run('PRAGMA synchronous = NORMAL');
    this.db.run('PRAGMA cache_size = 10000');
    this.db.run('PRAGMA temp_store = MEMORY');
    
    // Run migrations
    await this._runMigrations();
    
    console.log('Database configuration applied');
  }

  /**
   * Execute a query with parameters and retry logic
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @param {number} retries - Number of retries for busy database
   * @returns {Promise<any>}
   */
  async run(sql, params = [], retries = 3) {
    const db = await this.getConnection();
    return new Promise((resolve, reject) => {
      const executeQuery = (attemptCount) => {
        db.run(sql, params, function(err) {
          if (err) {
            // Retry on SQLITE_BUSY error
            if (err.code === 'SQLITE_BUSY' && attemptCount > 0) {
              console.log(`Database busy, retrying... (${4 - attemptCount}/3)`);
              setTimeout(() => executeQuery(attemptCount - 1), 500 * (4 - attemptCount));
              return;
            }
            reject(err);
          } else {
            resolve({ 
              lastID: this.lastID, 
              changes: this.changes 
            });
          }
        });
      };
      executeQuery(retries);
    });
  }

  /**
   * Get a single row with retry logic
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @param {number} retries - Number of retries for busy database
   * @returns {Promise<any>}
   */
  async get(sql, params = [], retries = 3) {
    const db = await this.getConnection();
    return new Promise((resolve, reject) => {
      const executeQuery = (attemptCount) => {
        db.get(sql, params, (err, row) => {
          if (err) {
            // Retry on SQLITE_BUSY error
            if (err.code === 'SQLITE_BUSY' && attemptCount > 0) {
              console.log(`Database busy, retrying... (${4 - attemptCount}/3)`);
              setTimeout(() => executeQuery(attemptCount - 1), 500 * (4 - attemptCount));
              return;
            }
            reject(err);
          } else {
            resolve(row);
          }
        });
      };
      executeQuery(retries);
    });
  }

  /**
   * Get all rows with retry logic
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @param {number} retries - Number of retries for busy database
   * @returns {Promise<Array>}
   */
  async all(sql, params = [], retries = 3) {
    const db = await this.getConnection();
    return new Promise((resolve, reject) => {
      const executeQuery = (attemptCount) => {
        db.all(sql, params, (err, rows) => {
          if (err) {
            // Retry on SQLITE_BUSY error
            if (err.code === 'SQLITE_BUSY' && attemptCount > 0) {
              console.log(`Database busy, retrying... (${4 - attemptCount}/3)`);
              setTimeout(() => executeQuery(attemptCount - 1), 500 * (4 - attemptCount));
              return;
            }
            reject(err);
          } else {
            resolve(rows);
          }
        });
      };
      executeQuery(retries);
    });
  }

  /**
   * Execute multiple statements in a transaction
   * @param {Array<{sql: string, params: Array}>} statements
   * @returns {Promise<Array>}
   */
  async transaction(statements) {
    const db = await this.getConnection();
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        const results = [];
        let completed = 0;
        let hasError = false;

        statements.forEach((stmt, index) => {
          db.run(stmt.sql, stmt.params, function(err) {
            if (err && !hasError) {
              hasError = true;
              db.run('ROLLBACK');
              reject(err);
              return;
            }
            
            results[index] = { 
              lastID: this.lastID, 
              changes: this.changes 
            };
            completed++;
            
            if (completed === statements.length && !hasError) {
              db.run('COMMIT', (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(results);
                }
              });
            }
          });
        });
      });
    });
  }

  /**
   * Close database connection gracefully
   * @returns {Promise<void>}
   */
  async close() {
    if (this.db && this.isConnected) {
      return new Promise((resolve, reject) => {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
            reject(err);
          } else {
            console.log('Database connection closed successfully');
            this.db = null;
            this.isConnected = false;
            this.connectionPromise = null;
            resolve();
          }
        });
      });
    }
  }

  /**
   * Check if database is connected
   * @returns {boolean}
   */
  isDbConnected() {
    return this.isConnected;
  }

  /**
   * Run database migrations
   * @private
   */
  async _runMigrations() {
    try {
      const migrationsPath = path.join(__dirname, 'migrations');
      const files = await fs.readdir(migrationsPath);
      
      // Sort migration files to ensure order
      const migrationFiles = files
        .filter(file => file.endsWith('.sql'))
        .sort();

      for (const file of migrationFiles) {
        const filePath = path.join(migrationsPath, file);
        const sql = await fs.readFile(filePath, 'utf8');
        
        await new Promise((resolve, reject) => {
          this.db.exec(sql, (err) => {
            if (err) {
              console.error(`Error running migration ${file}:`, err);
              reject(err);
            } else {
              console.log(`Successfully ran migration: ${file}`);
              resolve();
            }
          });
        });
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log('No migrations directory found. Skipping migrations.');
      } else {
        throw err;
      }
    }
  }
}

// Export singleton instance
module.exports = new DatabaseManager();
