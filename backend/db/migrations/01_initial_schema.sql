-- Migration: 01_initial_schema.sql
-- Initial database schema for Stations of Sun project

-- PostGIS Extension activation
CREATE EXTENSION IF NOT EXISTS postgis;

-- Station master data
CREATE TABLE IF NOT EXISTS pax_masterdata (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    coordinates GEOMETRY(POINT, 4326) NOT NULL,
    beach_distance INTEGER NOT NULL, -- Distance to beach in meters
    platforms INTEGER NOT NULL,
    accessible BOOLEAN DEFAULT false,
    connections JSONB, -- Array of train connections
    facilities JSONB, -- Station facilities
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index on coordinates
CREATE INDEX IF NOT EXISTS idx_pax_masterdata_coordinates ON pax_masterdata USING GIST (coordinates);

-- Real-time passenger data
CREATE TABLE IF NOT EXISTS paxdata (
    id SERIAL PRIMARY KEY,
    station_id VARCHAR(50) REFERENCES pax_masterdata(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    current_occupancy INTEGER NOT NULL, -- Current occupancy in %
    occupancy_level VARCHAR(20) NOT NULL, -- niedrig, mittel, hoch, sehr_hoch
    occupancy_icon VARCHAR(50), -- Unicode icons for UI
    passenger_count INTEGER,
    prediction_accuracy DECIMAL(5,2), -- Prediction accuracy
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast queries by station and time
CREATE INDEX IF NOT EXISTS idx_paxdata_station_time ON paxdata(station_id, timestamp DESC);

-- Congestion forecasts and waiting times
CREATE TABLE IF NOT EXISTS congestion (
    id SERIAL PRIMARY KEY,
    station_id VARCHAR(50) REFERENCES pax_masterdata(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    congestion_level INTEGER NOT NULL, -- 0-100
    waiting_time INTEGER, -- Waiting time in minutes
    forecast_accuracy DECIMAL(5,2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weather information relevant to beaches
CREATE TABLE IF NOT EXISTS weather (
    id SERIAL PRIMARY KEY,
    station_id VARCHAR(50) REFERENCES pax_masterdata(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    temp DECIMAL(5,2), -- Temperature in Celsius
    condition VARCHAR(50), -- Weather condition (sunny, cloudy, etc.)
    wind INTEGER, -- Wind speed in km/h
    beach_suitability VARCHAR(20), -- Beach suitability rating
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Holiday calendar and events
CREATE TABLE IF NOT EXISTS calendar (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    is_holiday BOOLEAN DEFAULT false,
    is_school_holiday BOOLEAN DEFAULT false,
    state VARCHAR(50), -- Federal state (Bundesland)
    event_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API usage tracking
CREATE TABLE IF NOT EXISTS api_usage (
    id SERIAL PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    ip_address VARCHAR(45),
    response_time_ms INTEGER,
    status_code INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indices for common query patterns
CREATE INDEX IF NOT EXISTS idx_congestion_station_time ON congestion(station_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_weather_station_time ON weather(station_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_calendar_date ON calendar(date);
