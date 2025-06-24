require('dotenv').config();
const { server, startDataUpdates } = require('./app');
const { PORT } = require('./config/env');
const { testConnection } = require('./config/db');

// Test database connection before starting server
const startServer = async () => {
  try {
    // Check database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('Failed to connect to the database. Please check your configuration.');
      process.exit(1);
    }
    
    // Start the server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      console.log(`API endpoints available at http://localhost:${PORT}/api/v1`);
      
      // Start periodic data updates for simulation
      if (process.env.NODE_ENV !== 'test') {
        startDataUpdates();
        console.log('Started periodic data updates for stations');
      }
    });
    
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Start the server
startServer();
