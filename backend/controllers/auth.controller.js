/**
 * Authentication Controller
 * Handles user authentication, registration, and profile management
 * Business logic is included directly in this controller
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Profile = require('../models/profile.model');
const appConfig = require('../config/app.config');

// ==================== Helper Functions ====================

/**
 * Hash a password using bcrypt
 */
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare plain password with hashed password
 */
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate JWT token for a user
 */
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        appConfig.jwt.secret,
        { expiresIn: appConfig.jwt.expiresIn }
    );
};

// ==================== Auth Controller ====================

const AuthController = {
    /**
     * Register a new user
     * POST /api/auth/register
     */
    async register(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }

            // Hash password and create user
            const hashedPassword = await hashPassword(password);
            const user = new User({
                email,
                password: hashedPassword,
                role: 'user'
            });
            await user.save();

            // Create empty profile for user
            const profile = new Profile({ userId: user._id });
            await profile.save();

            // Generate token
            const token = generateToken(user._id);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: {
                        _id: user._id,
                        email: user.email,
                        role: user.role,
                        createdAt: user.createdAt
                    },
                    token
                }
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Login user
     * POST /api/auth/login
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            // Find user by email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Compare passwords
            const isMatch = await comparePassword(password, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Generate token
            const token = generateToken(user._id);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        _id: user._id,
                        email: user.email,
                        role: user.role,
                        createdAt: user.createdAt
                    },
                    token
                }
            });

        } catch (error) {
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Get current user info
     * GET /api/auth/me
     */
    async getMe(req, res) {
        try {
            const user = await User.findById(req.user._id).select('-password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                data: user
            });

        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Get all users (admin only)
     * GET /api/auth/users
     */
    async getAllUsers(req, res) {
        try {
            const users = await User.find().select('-password');

            res.status(200).json({
                success: true,
                count: users.length,
                data: users
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Get single user by ID (admin only)
     * GET /api/auth/users/:id
     */
    async getUserById(req, res) {
        try {
            const user = await User.findById(req.params.id).select('-password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Get user's profile
            const profile = await Profile.findOne({ userId: user._id });

            res.status(200).json({
                success: true,
                data: {
                    ...user.toObject(),
                    profile
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Update user (admin only)
     * PUT /api/auth/users/:id
     */
    async updateUser(req, res) {
        try {
            const { email, role, age, height, weight, goal, dailyCalorieTarget } = req.body;

            // Prevent admin from demoting themselves
            if (req.params.id === req.user._id.toString() && role && role !== 'admin') {
                return res.status(400).json({
                    success: false,
                    message: 'You cannot change your own role'
                });
            }

            // Update user
            const userUpdate = {};
            if (email) userUpdate.email = email;
            if (role) userUpdate.role = role;

            const user = await User.findByIdAndUpdate(
                req.params.id,
                { $set: userUpdate },
                { new: true, runValidators: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Update profile if profile fields provided
            const profileUpdate = {};
            if (age !== undefined) profileUpdate.age = age;
            if (height !== undefined) profileUpdate.height = height;
            if (weight !== undefined) profileUpdate.weight = weight;
            if (goal !== undefined) profileUpdate.goal = goal;
            if (dailyCalorieTarget !== undefined) profileUpdate.dailyCalorieTarget = dailyCalorieTarget;

            if (Object.keys(profileUpdate).length > 0) {
                await Profile.findOneAndUpdate(
                    { userId: req.params.id },
                    { $set: profileUpdate },
                    { new: true, upsert: true }
                );
            }

            res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: user
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Delete user (admin only)
     * DELETE /api/auth/users/:id
     */
    async deleteUser(req, res) {
        try {
            // Prevent admin from deleting themselves
            if (req.params.id === req.user._id.toString()) {
                return res.status(400).json({
                    success: false,
                    message: 'You cannot delete your own account'
                });
            }

            const user = await User.findById(req.params.id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Delete user's related data
            await Profile.deleteOne({ userId: req.params.id });

            // Import models for cleanup
            const Plan = require('../models/plan.model');
            const Log = require('../models/log.model');
            const Weight = require('../models/weight.model');

            await Plan.deleteMany({ userId: req.params.id });
            await Log.deleteMany({ userId: req.params.id });
            await Weight.deleteMany({ userId: req.params.id });

            // Delete user
            await User.findByIdAndDelete(req.params.id);

            res.status(200).json({
                success: true,
                message: 'User and all related data deleted successfully'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Change password
     * PUT /api/auth/change-password
     */
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters'
                });
            }

            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Verify current password
            const isMatch = await comparePassword(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Hash new password and update
            user.password = await hashPassword(newPassword);
            await user.save();

            res.status(200).json({
                success: true,
                message: 'Password changed successfully'
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
};

// ==================== Profile Controller ====================

const ProfileController = {
    /**
     * Get user profile
     * GET /api/auth/profile
     */
    async getProfile(req, res) {
        try {
            const profile = await Profile.findOne({ userId: req.user._id })
                .populate('userId', '-password');

            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: 'Profile not found'
                });
            }

            res.status(200).json({
                success: true,
                data: profile
            });

        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Update user profile
     * PUT /api/auth/profile
     */
    async updateProfile(req, res) {
        try {
            const { age, height, weight, goal, dailyCalorieTarget } = req.body;

            const profileData = {};
            if (age !== undefined) profileData.age = age;
            if (height !== undefined) profileData.height = height;
            if (weight !== undefined) profileData.weight = weight;
            if (goal !== undefined) profileData.goal = goal;
            if (dailyCalorieTarget !== undefined) profileData.dailyCalorieTarget = dailyCalorieTarget;

            const profile = await Profile.findOneAndUpdate(
                { userId: req.user._id },
                { $set: profileData },
                { new: true, runValidators: true }
            );

            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: 'Profile not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: profile
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = {
    AuthController,
    ProfileController
};
