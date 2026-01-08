/**
 * Profile Model
 * Stores user profile information (age, height, weight, goal)
 */

const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // One profile per user
    },
    age: {
        type: Number,
        min: [1, 'Age must be positive'],
        max: [150, 'Age must be realistic']
    },
    height: {
        type: Number, // in centimeters
        min: [50, 'Height must be at least 50cm'],
        max: [300, 'Height must be realistic']
    },
    weight: {
        type: Number, // in kilograms
        min: [20, 'Weight must be at least 20kg'],
        max: [500, 'Weight must be realistic']
    },
    goal: {
        type: String,
        enum: ['lose_weight', 'maintain_weight', 'gain_weight', 'build_muscle'],
        default: 'maintain_weight'
    },
    dailyCalorieTarget: {
        type: Number,
        default: 2000 // Default daily calorie target
    }
}, {
    timestamps: true
});

// Index for faster user lookups
profileSchema.index({ userId: 1 });

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
