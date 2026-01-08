/**
 * Diet Management System - Server Entry Point
 *
 * This file handles server startup and database connection.
 * Express app configuration is in app.js
 */

// Load environment variables first
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/dbConfig');
const appConfig = require('./config/appConfig');

const PORT = appConfig.server.port;

// Connect to MongoDB and start server
const startServer = async () => {
    try {
        // Connect to database
        await connectDB();

        // Start listening
        app.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log('Diet Management System');
            console.log('='.repeat(50));
            console.log(`Environment: ${appConfig.server.env}`);
            console.log(`Server running on port: ${PORT}`);
            console.log(`API URL: http://localhost:${PORT}/api`);
            console.log(`Health Check: http://localhost:${PORT}/api/health`);
            console.log('='.repeat(50));
        });

    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err.message);
    process.exit(1);
});

// Start the server
startServer();
