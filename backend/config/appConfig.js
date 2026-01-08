/**
 * Application Configuration
 * Centralized configuration for the application
 */

module.exports = {
    jwt: {
        secret: process.env.JWT_SECRET || 'fallback_secret_key',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },

    server: {
        port: process.env.PORT || 5000,
        env: process.env.NODE_ENV || 'development'
    },

    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        credentials: true
    },

    roles: {
        ADMIN: 'admin',
        USER: 'user'
    },

    permissions: {
        admin: [
            'manage_foods',
            'view_all_users',
            'manage_own_profile',
            'manage_own_plans',
            'manage_own_logs'
        ],
        user: [
            'manage_own_profile',
            'manage_own_plans',
            'manage_own_logs',
            'view_foods'
        ]
    }
};
