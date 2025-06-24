/**
 * Environment configuration for the application
 */

// Default port for the server
const PORT = process.env.PORT || 3000;

// Node environment
const NODE_ENV = process.env.NODE_ENV || 'development';

// Deutsche Bahn API credentials
const DB_API = {
  clientId: process.env.DB_API_CLIENT_ID || '',
  clientSecret: process.env.DB_API_CLIENT_SECRET || ''
};

// CORS configuration
const CORS_OPTIONS = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Socket.IO configuration
const SOCKET_OPTIONS = {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
};

module.exports = {
  PORT,
  NODE_ENV,
  DB_API,
  CORS_OPTIONS,
  SOCKET_OPTIONS
};
