/**
 * Authentication Routes
 * Handles user authentication, registration, and profile management
 */

const express = require('express');
const router = express.Router();
const { AuthController, ProfileController } = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

// ==================== Public Routes ====================

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// ==================== Protected Routes ====================

router.get('/me', authMiddleware, AuthController.getMe);
router.put('/change-password', authMiddleware, AuthController.changePassword);

// ==================== Profile Routes ====================

router.get('/profile', authMiddleware, ProfileController.getProfile);
router.put('/profile', authMiddleware, ProfileController.updateProfile);

// ==================== Admin Routes ====================

router.get('/users', authMiddleware, isAdmin, AuthController.getAllUsers);

module.exports = router;
