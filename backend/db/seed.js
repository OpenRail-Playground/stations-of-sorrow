require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db'); // We're keeping this reference for compatibility

/**
 * Database seeding script
 * Populates the database with sample data for development
 */
(async () => {
  try {
    console.log('🌱 Seeding database with sample data...');
    
    // Sample station data based on the mockup
    const stationData = [
      {
        id: 'warnemuende',
        name: 'Warnemünde',
        coordinates: { lat: 54.1775, lng: 12.0811 },
        beachDistance: 500,
        platforms: 2,
        accessible: true,
        connections: ["RE1", "S1"]
      },
      {
        id: 'binz',
        name: 'Binz',
        coordinates: { lat: 54.4014, lng: 13.6089 },
        beachDistance: 400,
        platforms: 3,
        accessible: true,
        connections: ["RE9", "RB23"]
      },
      {
        id: 'westerland',
        name: 'Westerland (Sylt)',
        coordinates: { lat: 54.9038, lng: 8.3206 },
        beachDistance: 800,
        platforms: 4,
        accessible: true,
        connections: ["RE6", "RB61"]
      },
      {
        id: 'travemuende',
        name: 'Travemünde Strand',
        coordinates: { lat: 53.9583, lng: 10.8708 },
        beachDistance: 300,
        platforms: 2,
        accessible: true,
        connections: ["RB81"]
      },
      {
        id: 'kuehlungsborn',
        name: 'Kühlungsborn West',
        coordinates: { lat: 54.1505, lng: 11.7425 },
        beachDistance: 350,
        platforms: 1,
        accessible: false,
        connections: ["RB12"]
      }
    ];
    
    // Insert station data
    for (const station of stationData) {
      // Check if station already exists to avoid duplicates
      const { rows } = await pool.query('SELECT id FROM pax_masterdata WHERE id = ?', [station.id]);
      
      if (rows.length === 0) {
        await pool.query(`
          INSERT INTO pax_masterdata (id, name, lat, lng, beach_distance, platforms, accessible, connections)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          station.id,
          station.name,
          station.coordinates.lat,
          station.coordinates.lng,
          station.beachDistance,
          station.platforms,
          station.accessible,
          JSON.stringify(station.connections)
        ]);
        console.log(`✅ Added station: ${station.name}`);
      } else {
        console.log(`⏩ Station already exists: ${station.name}`);
      }
      
      // Generate random occupancy data
      const occupancyData = {
        'warnemuende': { current: 67, level: 'mittel', icon: '👥' },
        'binz': { current: 89, level: 'sehr_hoch', icon: '🚫👥👥👥' },
        'westerland': { current: 81, level: 'hoch', icon: '👥👥👥' },
        'travemuende': { current: 45, level: 'niedrig', icon: '👤' },
        'kuehlungsborn': { current: 35, level: 'niedrig', icon: '👤' }
      };
      
      // Insert occupancy data
      await pool.query(`
        INSERT INTO paxdata (station_id, current_occupancy, occupancy_level, occupancy_icon)
        VALUES (?, ?, ?, ?)
      `, [
        station.id,
        occupancyData[station.id].current,
        occupancyData[station.id].level,
        occupancyData[station.id].icon
      ]);
      
      // Insert weather data
      const weatherData = {
        'warnemuende': { temp: 18, condition: 'sonnig', wind: 12, beachSuitability: 'gut' },
        'binz': { temp: 19, condition: 'bewölkt', wind: 15, beachSuitability: 'mäßig' },
        'westerland': { temp: 16, condition: 'windig', wind: 22, beachSuitability: 'schlecht' },
        'travemuende': { temp: 17, condition: 'heiter', wind: 8, beachSuitability: 'sehr gut' },
        'kuehlungsborn': { temp: 18, condition: 'leicht bewölkt', wind: 10, beachSuitability: 'gut' }
      };
      
      await pool.query(`
        INSERT INTO weather (station_id, temp, condition, wind, beach_suitability)
        VALUES (?, ?, ?, ?, ?)
      `, [
        station.id,
        weatherData[station.id].temp,
        weatherData[station.id].condition,
        weatherData[station.id].wind,
        weatherData[station.id].beachSuitability
      ]);
    }

    // Add calendar/holiday data
    console.log('🗓️ Adding holiday calendar data...');
    
    // Get the current year
    const currentYear = new Date().getFullYear();
    
    // Sample holiday data for summer
    const holidayData = [
      { date: `${currentYear}-05-29`, isHoliday: true, isSchoolHoliday: false, state: 'bundesweit', eventName: 'Pfingstmontag' },
      { date: `${currentYear}-06-24`, isHoliday: false, isSchoolHoliday: true, state: 'MV', eventName: 'Sommerferien Start MV' },
      { date: `${currentYear}-07-03`, isHoliday: false, isSchoolHoliday: true, state: 'SH', eventName: 'Sommerferien Start SH' },
      { date: `${currentYear}-07-22`, isHoliday: false, isSchoolHoliday: true, state: 'HH', eventName: 'Sommerferien Start HH' },
      { date: `${currentYear}-08-05`, isHoliday: false, isSchoolHoliday: true, state: 'SH', eventName: 'Sommerferien Ende SH' },
      { date: `${currentYear}-08-03`, isHoliday: false, isSchoolHoliday: false, state: 'SH', eventName: 'Hansesail Rostock' },
      { date: `${currentYear}-08-04`, isHoliday: false, isSchoolHoliday: false, state: 'MV', eventName: 'Hansesail Rostock' },
      { date: `${currentYear}-08-05`, isHoliday: false, isSchoolHoliday: false, state: 'MV', eventName: 'Hansesail Rostock' },
      { date: `${currentYear}-08-06`, isHoliday: false, isSchoolHoliday: false, state: 'MV', eventName: 'Hansesail Rostock' },
      { date: `${currentYear}-08-31`, isHoliday: false, isSchoolHoliday: true, state: 'HH', eventName: 'Sommerferien Ende HH' },
      { date: `${currentYear}-09-02`, isHoliday: false, isSchoolHoliday: true, state: 'MV', eventName: 'Sommerferien Ende MV' },
      { date: `${currentYear}-10-03`, isHoliday: true, isSchoolHoliday: false, state: 'bundesweit', eventName: 'Tag der Deutschen Einheit' },
      
      // Add today and some nearby dates to ensure calendar data is visible when testing
      { date: new Date().toISOString().split('T')[0], isHoliday: false, isSchoolHoliday: false, state: 'Test', eventName: 'Heute (Testdatum)' },
    ];

    // Insert all holiday data
    for (const holiday of holidayData) {
      // Check if entry already exists
      const { rows } = await pool.query('SELECT date FROM calendar WHERE date = ?', [holiday.date]);
      
      if (rows.length === 0) {
        await pool.query(`
          INSERT INTO calendar (date, is_holiday, is_school_holiday, state, event_name)
          VALUES (?, ?, ?, ?, ?)
        `, [
          holiday.date,
          holiday.isHoliday,
          holiday.isSchoolHoliday,
          holiday.state,
          holiday.eventName
        ]);
        console.log(`✅ Added calendar entry: ${holiday.eventName} (${holiday.date})`);
      } else {
        console.log(`⏩ Calendar entry already exists for: ${holiday.date}`);
      }
    }
    
    // Add congestion forecasts
    console.log('🚦 Adding congestion forecast data...');
    
    const congestionData = {
      'warnemuende': [
        { level: 65, waitingTime: 15, accuracy: 85 },
        { level: 80, waitingTime: 25, accuracy: 90 },
        { level: 50, waitingTime: 10, accuracy: 88 }
      ],
      'binz': [
        { level: 90, waitingTime: 35, accuracy: 92 },
        { level: 85, waitingTime: 30, accuracy: 88 },
        { level: 70, waitingTime: 20, accuracy: 85 }
      ],
      'westerland': [
        { level: 75, waitingTime: 20, accuracy: 87 },
        { level: 85, waitingTime: 30, accuracy: 90 },
        { level: 65, waitingTime: 15, accuracy: 84 }
      ],
      'travemuende': [
        { level: 45, waitingTime: 5, accuracy: 80 },
        { level: 60, waitingTime: 12, accuracy: 85 },
        { level: 40, waitingTime: 5, accuracy: 78 }
      ],
      'kuehlungsborn': [
        { level: 35, waitingTime: 0, accuracy: 75 },
        { level: 50, waitingTime: 8, accuracy: 80 },
        { level: 30, waitingTime: 0, accuracy: 72 }
      ]
    };
    
    // Insert congestion data for each station with timestamps for the last 3 hours
    const now = new Date();
    
    for (const stationId of Object.keys(congestionData)) {
      const stationCongestion = congestionData[stationId];
      
      for (let i = 0; i < stationCongestion.length; i++) {
        const data = stationCongestion[i];
        const timestamp = new Date(now);
        timestamp.setHours(now.getHours() - i - 1); // Past hours
        
        await pool.query(`
          INSERT INTO congestion (station_id, timestamp, congestion_level, waiting_time, forecast_accuracy)
          VALUES (?, ?, ?, ?, ?)
        `, [
          stationId,
          timestamp.toISOString(),
          data.level,
          data.waitingTime,
          data.accuracy
        ]);
      }
      
      console.log(`✅ Added congestion data for station: ${stationId}`);
    }
    
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
})();
