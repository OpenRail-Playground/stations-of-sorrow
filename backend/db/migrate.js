require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

/**
 * Database migration script
 * Runs SQL migration files in sequential order
 */
(async () => {
  try {
    console.log('📚 Running database migrations...');
    
    // Ensure migrations directory exists
    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.error('❌ Migrations directory not found!');
      process.exit(1);
    }
    
    // Get list of migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Natural sort order
      
    if (migrationFiles.length === 0) {
      console.warn('⚠️ No migration files found.');
      process.exit(0);
    }
    
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get already applied migrations
    const { rows: appliedMigrations } = await pool.query('SELECT name FROM migrations');
    const appliedMigrationNames = appliedMigrations.map(row => row.name);
    
    // Apply pending migrations
    const pendingMigrations = migrationFiles.filter(file => !appliedMigrationNames.includes(file));
    
    if (pendingMigrations.length === 0) {
      console.log('✅ Database is up to date, no migrations to run.');
      process.exit(0);
    }
    
    console.log(`🔄 Found ${pendingMigrations.length} migrations to apply...`);
    
    // Apply each pending migration in a transaction
    for (const migrationFile of pendingMigrations) {
      const migrationPath = path.join(migrationsDir, migrationFile);
      const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
      
      // Begin transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        console.log(`🔄 Applying migration: ${migrationFile}`);
        await client.query(migrationSql);
        
        // Record migration
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [migrationFile]);
        
        await client.query('COMMIT');
        console.log(`✅ Successfully applied: ${migrationFile}`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`❌ Error applying migration ${migrationFile}:`, error);
        process.exit(1);
      } finally {
        client.release();
      }
    }
    
    console.log('✅ All migrations applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
})();
