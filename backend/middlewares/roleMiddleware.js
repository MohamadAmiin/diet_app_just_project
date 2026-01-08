/**
 * Role Middleware
 * Handles Role-Based Access Control (RBAC)
 */

const appConfig = require('../config/appConfig');

/**
 * Middleware factory that checks if user has required role(s)
 */
const roleMiddleware = (allowedRoles) => {
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required.'
                });
            }

            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You do not have permission to access this resource.'
                });
            }

            next();

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Authorization error.',
                error: error.message
            });
        }
    };
};

/**
 * Middleware to check if user has specific permission
 */
const permissionMiddleware = (permission) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required.'
                });
            }

            const userPermissions = appConfig.permissions[req.user.role] || [];

            if (!userPermissions.includes(permission)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Missing permission: ${permission}`
                });
            }

            next();

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Permission check error.',
                error: error.message
            });
        }
    };
};

/**
 * Middleware to check if user is admin
 */
const isAdmin = roleMiddleware(appConfig.roles.ADMIN);

/**
 * Middleware to check if user is admin OR owns the resource
 */
const isAdminOrOwner = (getResourceUserId) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required.'
                });
            }

            if (req.user.role === appConfig.roles.ADMIN) {
                return next();
            }

            const resourceUserId = await getResourceUserId(req);

            if (resourceUserId && req.user._id.toString() === resourceUserId.toString()) {
                return next();
            }

            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only access your own resources.'
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Authorization error.',
                error: error.message
            });
        }
    };
};

module.exports = {
    roleMiddleware,
    permissionMiddleware,
    isAdmin,
    isAdminOrOwner
};
