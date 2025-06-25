require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csvtojson'); // We need this package for parsing CSV
const { pool } = require('../config/db'); // We're keeping this reference for compatibility

/**
 * Database seeding script
 * Populates the database with real station data from masterdata.csv
 */
(async () => {
  try {
    console.log('🌱 Seeding database with real station data from masterdata.csv...');
    
    // Read and parse the masterdata.csv file
    const csvFilePath = path.join(__dirname, 'seeds', 'masterdata.csv');
    console.log(`Reading from ${csvFilePath}`);
    
    if (!fs.existsSync(csvFilePath)) {
      throw new Error(`CSV file not found at: ${csvFilePath}`);
    }
    
    const stationDataRaw = await csv().fromFile(csvFilePath);
    console.log(`Successfully parsed ${stationDataRaw.length} records from CSV`);
    
    // Process and transform the data
    const uniqueStations = new Map();
    
    stationDataRaw.forEach(row => {
      // Only process if we have both station name and coordinates
      if (row.station_name && row.station_latitude && row.station_longitude) {
        // Use station_id or ril100 as the key - in railway terminology, RIL100 is a unique station code
        const stationId = row.station_id || `${row.station_ril100}-${row.station_name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`;
        
        // Skip if already processed (avoid duplicate stations)
        if (!uniqueStations.has(stationId)) {
          // Determine beach distance based on name hints
          const isBeachStation = /strand|meer|ostsee|see|hafen|bad|warnemünde|binz|kühlungsborn|zinnowitz|sellin|breege|juliusruh/i.test(row.station_name);
          const beachDistance = isBeachStation ? 
            Math.floor(Math.random() * 300) + 50 : // 50-350m for beach stations
            Math.floor(Math.random() * 1500) + 500; // 500-2000m for others
            
          // More platforms for bigger stations (based on region)
          const isMajorStation = /hauptbahnhof|hbf|zentral|berlin|hamburg|rostock/i.test(row.station_name);
          const platforms = isMajorStation ? 
            Math.floor(Math.random() * 5) + 4 : // 4-8 platforms for major stations
            Math.floor(Math.random() * 2) + 1;  // 1-2 platforms for smaller stations
            
          // More modern stations tend to be accessible
          const isModern = row.station_id > 5000 || Math.random() > 0.3;
            
          uniqueStations.set(stationId, {
            id: stationId,
            name: row.station_name,
            lat: parseFloat(row.station_latitude),
            lng: parseFloat(row.station_longitude),
            beachDistance: beachDistance,
            platforms: platforms,
            accessible: isModern,
            connections: generateRandomConnections(row.station_name),
            facilities: generateRandomFacilities(row.station_name, isModern, isMajorStation)
          });
        }
      }
    });
    
    // Convert the Map to an array
    const stationData = Array.from(uniqueStations.values());
    
    console.log(`Processed ${stationData.length} unique stations from the CSV data`);
    
    // Helper functions to generate random data for missing fields
    function generateRandomConnections(stationName) {
      // Traintype probabilities depend on station type
      const isMajorStation = /hauptbahnhof|hbf|zentral|berlin|hamburg|rostock|stralsund|schwerin/i.test(stationName);
      const isSmallStation = /haltepunkt|hp|dorf|klein/i.test(stationName);
      
      let trainTypes = [];
      
      // Major stations get more connections and long-distance trains
      if (isMajorStation) {
        trainTypes = ['RE', 'RE', 'RB', 'IC', 'ICE', 'S'];
        const numConnections = Math.floor(Math.random() * 4) + 3; // 3-6 connections
        
        const connections = [];
        const usedNumbers = new Set(); // To avoid duplicate train numbers
        
        for (let i = 0; i < numConnections; i++) {
          const type = trainTypes[Math.floor(Math.random() * trainTypes.length)];
          let number;
          
          // Use realistic train numbers by region
          if (type === 'ICE') {
            number = Math.floor(Math.random() * 50) + 1; // ICE 1-50
          } else if (type === 'IC') {
            number = Math.floor(Math.random() * 100) + 2000; // IC 2000-2099
          } else if (type === 'RE') {
            number = Math.floor(Math.random() * 10) + 1; // RE 1-10
          } else if (type === 'RB') {
            number = Math.floor(Math.random() * 20) + 11; // RB 11-30
          } else {
            number = Math.floor(Math.random() * 3) + 1; // S 1-3
          }
          
          const trainId = `${type}${number}`;
          if (!usedNumbers.has(trainId)) {
            connections.push(trainId);
            usedNumbers.add(trainId);
          }
        }
        
        return connections;
      } 
      // Small stations get fewer connections and only regional trains
      else if (isSmallStation) {
        trainTypes = ['RB', 'RB', 'RE'];
        const numConnections = Math.floor(Math.random() * 2) + 1; // 1-2 connections
        
        const connections = [];
        for (let i = 0; i < numConnections; i++) {
          const type = trainTypes[Math.floor(Math.random() * trainTypes.length)];
          const number = Math.floor(Math.random() * 20) + 11; // RB/RE 11-30
          connections.push(`${type}${number}`);
        }
        
        return connections;
      } 
      // Medium-sized stations
      else {
        trainTypes = ['RE', 'RB', 'RB', 'S', 'IC'];
        const numConnections = Math.floor(Math.random() * 3) + 1; // 1-3 connections
        
        const connections = [];
        for (let i = 0; i < numConnections; i++) {
          const type = trainTypes[Math.floor(Math.random() * trainTypes.length)];
          
          let number;
          if (type === 'IC') {
            number = Math.floor(Math.random() * 100) + 2000; // IC 2000-2099
          } else if (type === 'RE' || type === 'RB') {
            number = Math.floor(Math.random() * 20) + 11; // RE/RB 11-30
          } else {
            number = Math.floor(Math.random() * 3) + 1; // S 1-3
          }
          
          connections.push(`${type}${number}`);
        }
        
        return connections;
      }
    }
    
    function generateRandomFacilities(stationName, isModern, isMajorStation) {
      const allFacilities = [
        'elevator', 'wifi', 'parking', 'bike_rental', 'locker', 
        'restroom', 'shop', 'cafe', 'ticket_machine', 'info_point',
        'db_lounge', 'accessible_toilet', 'luggage_storage', 'taxi_stand'
      ];
      
      const facilities = {};
      
      // Major stations have more amenities
      if (isMajorStation) {
        // Major stations always have these facilities
        ['elevator', 'parking', 'restroom', 'shop', 'cafe', 'ticket_machine', 'info_point'].forEach(f => {
          facilities[f] = true;
        });
        
        // 50% chance for premium amenities
        ['db_lounge', 'luggage_storage'].forEach(f => {
          if (Math.random() > 0.5) {
            facilities[f] = true;
          }
        });
        
        // Modern stations are more likely to have these
        if (isModern) {
          ['wifi', 'accessible_toilet'].forEach(f => {
            facilities[f] = true;
          });
        }
      }
      // Beach stations have specific facilities
      else if (/strand|meer|ostsee|see|hafen|bad|warnemünde|binz|kühlungsborn|zinnowitz|sellin/i.test(stationName)) {
        // Beach stations always have info and tickets
        ['ticket_machine', 'info_point', 'bike_rental'].forEach(f => {
          facilities[f] = true;
        });
        
        // 70% chance for these at beach stations
        ['cafe', 'restroom'].forEach(f => {
          if (Math.random() > 0.3) {
            facilities[f] = true;
          }
        });
        
        // Modern beach stations might have these
        if (isModern && Math.random() > 0.5) {
          facilities['wifi'] = true;
        }
      }
      // Regular stations have basic amenities
      else {
        // All stations have ticket machines
        facilities['ticket_machine'] = true;
        
        // Regular stations have a random selection of basic amenities
        const basicFacilities = ['parking', 'bike_rental', 'restroom', 'shop'];
        const numBasic = Math.floor(Math.random() * 3) + 1; // 1-3 basic facilities
        
        for (let i = 0; i < numBasic; i++) {
          const idx = Math.floor(Math.random() * basicFacilities.length);
          facilities[basicFacilities[idx]] = true;
        }
        
        // Modern stations might have modern amenities
        if (isModern && Math.random() > 0.7) {
          facilities['wifi'] = true;
        }
      }
      
      return facilities;
    }
    
    // Insert station data
    console.log(`Starting to insert ${stationData.length} stations into the database...`);
    let success = 0;
    let errors = 0;
    let skipped = 0;
    
    for (const station of stationData) {
      try {
        // Check if station already exists to avoid duplicates
        const { rows } = await pool.query('SELECT id FROM pax_masterdata WHERE id = ?', [station.id]);
        
        if (rows.length === 0) {
          // Insert station data
          await pool.query(`
            INSERT INTO pax_masterdata (
              id, 
              name, 
              lat, 
              lng, 
              beach_distance, 
              platforms, 
              accessible, 
              connections, 
              facilities
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            station.id,
            station.name,
            station.lat,
            station.lng,
            station.beachDistance,
            station.platforms,
            station.accessible ? 1 : 0,  // SQLite boolean as 1/0
            JSON.stringify(station.connections),
            JSON.stringify(station.facilities)
          ]);
          
          console.log(`✅ Added station: ${station.name}`);
          success++;
          
          // Generate random occupancy data
          const occupancyLevel = generateRandomOccupancyLevel(station.name);
          let icon = '🙂';
          
          if (occupancyLevel.level === 'niedrig') icon = '😊';
          else if (occupancyLevel.level === 'mittel') icon = '👥';
          else if (occupancyLevel.level === 'hoch') icon = '👥👥';
          else if (occupancyLevel.level === 'sehr_hoch') icon = '🚫👥👥';
          
          // Insert occupancy data
          await pool.query(`
            INSERT INTO paxdata (
              station_id, 
              current_occupancy, 
              occupancy_level, 
              occupancy_icon, 
              passenger_count, 
              prediction_accuracy
            ) VALUES (?, ?, ?, ?, ?, ?)
          `, [
            station.id,
            occupancyLevel.value,
            occupancyLevel.level,
            icon,
            Math.floor(Math.random() * 1000) + 50,  // Random passenger count between 50-1050
            Math.floor(Math.random() * 15) + 85     // Random accuracy between 85-100%
          ]);
          
          // Generate and insert weather data for each station
          const isBeach = /strand|meer|ostsee|see|hafen|bad|warnemünde|binz|kühlungsborn|zinnowitz/i.test(station.name);
          const isInland = /land|dorf|burg|stadt|hof|wald/i.test(station.name);
          
          const conditions = isBeach 
            ? ['sonnig', 'sonnig', 'heiter', 'leicht bewölkt', 'windig']  // Beach stations more likely to be sunny
            : ['sonnig', 'heiter', 'leicht bewölkt', 'bewölkt', 'regnerisch'];
            
          const beachSuitabilities = isBeach 
            ? ['sehr gut', 'sehr gut', 'gut', 'gut', 'mäßig']  // Beach stations more likely to have good suitability
            : ['gut', 'mäßig', 'mäßig', 'schlecht'];
            
          const weatherData = {
            temp: isBeach 
              ? Math.floor(Math.random() * 6) + 19  // 19-24 degrees (warmer for beaches)
              : Math.floor(Math.random() * 8) + 16, // 16-23 degrees (slightly cooler for inland)
            condition: conditions[Math.floor(Math.random() * conditions.length)],
            wind: isBeach
              ? Math.floor(Math.random() * 15) + 10  // 10-25 km/h (windier at beaches)
              : Math.floor(Math.random() * 10) + 5,  // 5-15 km/h (less wind inland)
            beachSuitability: beachSuitabilities[Math.floor(Math.random() * beachSuitabilities.length)]
          };
          
          await pool.query(`
            INSERT INTO weather (
              station_id, 
              temp, 
              condition, 
              wind, 
              beach_suitability
            ) VALUES (?, ?, ?, ?, ?)
          `, [
            station.id,
            weatherData.temp,
            weatherData.condition,
            weatherData.wind,
            weatherData.beachSuitability
          ]);
        } else {
          console.log(`⏩ Station already exists: ${station.name}`);
          skipped++;
        }
      } catch (err) {
        console.error(`Error adding station ${station.name}:`, err);
        errors++;
      }
    }
    
    console.log(`Station insertion complete: ${success} added, ${skipped} skipped, ${errors} errors`);
    
    // Function to generate occupancy level with seasonal and station context
    function generateRandomOccupancyLevel(stationName) {
      // Beach/touristy stations tend to be more crowded in summer
      const isPopularStation = /hauptbahnhof|hbf|strand|bad|berlin|hamburg|warnemünde|binz|kühlungsborn|zinnowitz|sellin|strand/i.test(stationName);
      
      let baseValue;
      if (isPopularStation) {
        // Popular stations during summer tend to be more crowded
        baseValue = Math.floor(Math.random() * 40) + 50; // 50-89% occupancy
      } else {
        // Other stations have more varied occupancy
        baseValue = Math.floor(Math.random() * 70) + 20; // 20-89% occupancy
      }
      
      // Randomly increase some stations to very high
      if (Math.random() < 0.1) {
        baseValue = Math.min(baseValue + 20, 95); // Boost by 20%, max 95%
      }
      
      let level = 'niedrig';
      if (baseValue >= 85) {
        level = 'sehr_hoch';
      } else if (baseValue >= 70) {
        level = 'hoch';
      } else if (baseValue >= 40) {
        level = 'mittel';
      }
      
      return { value: baseValue, level };
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
