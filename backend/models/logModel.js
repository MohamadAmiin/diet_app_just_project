
/**
 * Log Model
 * Stores meal logs and daily totals
 */

const mongoose = require('mongoose');

// Meal Log Schema - Records individual meal entries
const mealLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [0.1, 'Quantity must be positive'],
        default: 1
    },
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    calories: {
        type: Number,
        default: 0
    },
    protein: {
        type: Number,
        default: 0
    },
    carbs: {
        type: Number,
        default: 0
    },
    fats: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster lookups by user and date
mealLogSchema.index({ userId: 1, date: -1 });

// Daily Totals Schema - Aggregated daily nutrition data
const dailyTotalsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    totalCalories: {
        type: Number,
        default: 0
    },
    totalProtein: {
        type: Number,
        default: 0
    },
    totalCarbs: {
        type: Number,
        default: 0
    },
    totalFats: {
        type: Number,
        default: 0
    },
    mealsCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound index for user and date (unique per day per user)
dailyTotalsSchema.index({ userId: 1, date: 1 }, { unique: true });

const MealLog = mongoose.model('MealLog', mealLogSchema);
const DailyTotals = mongoose.model('DailyTotals', dailyTotalsSchema);

module.exports = { MealLog, DailyTotals };
