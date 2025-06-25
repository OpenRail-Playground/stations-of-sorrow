require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

// SQLite database configuration
const dbPath = path.resolve(__dirname, '../../database.sqlite');

// Create a database connection pool
let db;

// Initialize database
const initDb = async () => {
  if (!db) {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    console.log('Successfully connected to SQLite database');
  }
  return db;
};

// Mock pool interface to keep compatibility with existing code
const pool = {
  query: async (text, params = []) => {
    const database = await initDb();
    try {
      console.log('Running query:', text, 'with params:', params);
      
      // Convert PostgreSQL query format to SQLite format
      const sqliteText = text
        .replace(/\$\d+/g, '?')
        .replace(/RETURNING \*/g, '') // SQLite doesn't support RETURNING
        .replace(/ST_SetSRID\(ST_MakePoint\(\$\d+, \$\d+\), 4326\)/g, 'GeomFromText(\'POINT(? ?)\', 4326)') // Simple geo conversion
        .replace(/ST_X\(.*?::geometry\)/g, 'lng')
        .replace(/ST_Y\(.*?::geometry\)/g, 'lat');
      
      console.log('Converted to SQLite:', sqliteText);
      
      // For INSERT queries with RETURNING clause, perform the insert and then select
      if (text.includes('RETURNING') || text.includes('returning')) {
        await database.run(sqliteText, params);
        // Get the last inserted row
        return { rows: [await database.get('SELECT last_insert_rowid() as id')] };
      } 
      
      // For SELECT queries
      if (text.toLowerCase().trim().startsWith('select')) {
        try {
          const rows = await database.all(sqliteText, params);
          console.log('SELECT result rows count:', rows.length);
          return { rows };
        } catch (err) {
          console.error('SQLite SELECT error:', err);
          return { rows: [] };
        }
      }
      
      // For other queries (UPDATE, DELETE, etc.)
      const result = await database.run(sqliteText, params);
      return { rowCount: result.changes };
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }
};

// Test database connection
const testConnection = async () => {
  try {
    await initDb();
    return true;
  } catch (error) {
    console.error('Error connecting to PostgreSQL database:', error);
    return false;
  }
};

module.exports = { pool, testConnection };
