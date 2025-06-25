const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { CORS_OPTIONS, SOCKET_OPTIONS } = require('./config/env');
const { testConnection } = require('./config/db');
const RealtimeService = require('./services/realtimeService');
const DataUpdaterService = require('./services/dataUpdaterService');
const Station = require('./models/Station');

// Import routes
const stationsRouter = require('./routes/stations');
const occupancyRouter = require('./routes/occupancy');
const alternativesRouter = require('./routes/alternatives');
const calendarRouter = require('./routes/calendar');

// Initialize Express app
const app = express();

// Configure middleware
app.use(cors(CORS_OPTIONS));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/v1/stations', stationsRouter);
app.use('/api/v1/occupancy', occupancyRouter);
app.use('/api/v1/alternatives', alternativesRouter);
app.use('/api/v1/calendar', calendarRouter);

// Serve static files from frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('frontend/public'));
  
  // Handle SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/public/index.html'));
  });
} else {
  // In development, serve from frontend/public as well for convenience
  app.use(express.static('frontend/public'));
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbConnection = await testConnection();
  
  res.json({
    status: 'ok',
    timestamp: new Date(),
    dbConnection: dbConnection ? 'connected' : 'disconnected',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, SOCKET_OPTIONS);

// Initialize realtime service
const realtimeService = new RealtimeService(io);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Client subscribes to a station's updates
  socket.on('subscribe_station', (stationId) => {
    console.log(`Client ${socket.id} subscribed to station ${stationId}`);
    socket.join(`station_${stationId}`);
  });
  
  // Client subscribes to alternatives search results
  socket.on('subscribe_alternatives', (searchParams) => {
    const searchId = JSON.stringify(searchParams);
    console.log(`Client ${socket.id} subscribed to alternatives search ${searchId}`);
    socket.join(`alternatives_${searchId}`);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Create data updater service
const dataUpdater = new DataUpdaterService(realtimeService);

// Function to start data updates after server start
async function startDataUpdates() {
  try {
    // Fetch all station IDs
    const stations = await Station.getAll();
    const stationIds = stations.map(station => station.id);
    
    if (stationIds.length > 0) {
      dataUpdater.startPeriodicUpdates(stationIds);
    }
  } catch (error) {
    console.error('Error starting data updates:', error);
  }
}

// Export with data updates starter function
module.exports = { app, server, io, startDataUpdates };
