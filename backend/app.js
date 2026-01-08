/**
 * Express Application Configuration
 *
 * This file configures the Express app with middleware, routes, and error handlers.
 * The server.js file handles the actual server startup and database connection.
 */

const express = require('express');
const cors = require('cors');
const appConfig = require('./config/app.config');

// Import routes
const authRoutes = require('./routes/auth.routes');
const planRoutes = require('./routes/plan.routes');
const logRoutes = require('./routes/log.routes');
const progressRoutes = require('./routes/progress.routes');

// Initialize Express app
const app = express();

// ==================== Middleware ====================

// CORS - Allow cross-origin requests from frontend
app.use(cors(appConfig.cors));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Simple request logger (for development)
if (appConfig.server.env === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// ==================== API Routes ====================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Diet Management API is running',
        timestamp: new Date().toISOString()
    });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Plan and Food routes
app.use('/api', planRoutes);

// Meal logging routes
app.use('/api/logs', logRoutes);

// Progress and weight tracking routes
app.use('/api/progress', progressRoutes);

// ==================== Error Handling ====================

// 404 handler - Route not found
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: messages
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate field value entered'
        });
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format'
        });
    }

    // Default error response
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

module.exports = app;
