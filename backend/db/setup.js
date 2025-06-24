require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

/**
 * Database setup script
 * Creates the SQLite database if it doesn't exist
 */
(async () => {
  try {
    console.log('🔧 Setting up SQLite database...');
    
    const dbPath = path.resolve(__dirname, '../../database.sqlite');
    
    // Create database directory if it doesn't exist
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Connect to or create SQLite database
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Enable foreign key support
    await db.exec('PRAGMA foreign_keys = ON');
    
    console.log('📦 Creating spatial extension (SpatiaLite equivalent)...');
    
    // Create tables that don't require spatial functions first
    console.log('🏗️ Creating basic database tables...');
    
    // Instead of using PostGIS, we'll use simpler coordinates for SQLite
    await db.exec(`
      -- Create basic tables
      CREATE TABLE IF NOT EXISTS pax_masterdata (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        beach_distance INTEGER NOT NULL,
        platforms INTEGER NOT NULL,
        accessible BOOLEAN DEFAULT false,
        connections TEXT,
        facilities TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Real-time passenger data
      CREATE TABLE IF NOT EXISTS paxdata (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        station_id TEXT REFERENCES pax_masterdata(id),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        current_occupancy INTEGER NOT NULL,
        occupancy_level TEXT NOT NULL,
        occupancy_icon TEXT,
        passenger_count INTEGER,
        prediction_accuracy REAL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_pax_masterdata_coords ON pax_masterdata(lat, lng);
      CREATE INDEX IF NOT EXISTS idx_paxdata_station_time ON paxdata(station_id, timestamp);
      
      -- Congestion forecasts
      CREATE TABLE IF NOT EXISTS congestion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        station_id TEXT REFERENCES pax_masterdata(id),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        congestion_level INTEGER NOT NULL,
        waiting_time INTEGER,
        forecast_accuracy REAL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Weather information
      CREATE TABLE IF NOT EXISTS weather (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        station_id TEXT REFERENCES pax_masterdata(id),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        temp REAL,
        condition TEXT,
        wind INTEGER,
        beach_suitability TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Holiday calendar
      CREATE TABLE IF NOT EXISTS calendar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        is_holiday BOOLEAN DEFAULT false,
        is_school_holiday BOOLEAN DEFAULT false,
        state TEXT,
        event_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- API usage tracking
      CREATE TABLE IF NOT EXISTS api_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        endpoint TEXT NOT NULL,
        method TEXT NOT NULL,
        ip_address TEXT,
        response_time_ms INTEGER,
        status_code INTEGER,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Create more indexes
      CREATE INDEX IF NOT EXISTS idx_congestion_station_time ON congestion(station_id, timestamp);
      CREATE INDEX IF NOT EXISTS idx_weather_station_time ON weather(station_id, timestamp);
      CREATE INDEX IF NOT EXISTS idx_calendar_date ON calendar(date);
    `);
    
    console.log('✅ Database tables created successfully');
    
    // Close the database connection
    await db.close();
    console.log('✅ Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup error:', error);
    process.exit(1);
  }
})();
