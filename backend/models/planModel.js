
/**
 * Plan Model
 * Stores diet plans and plan items
 */

const mongoose = require('mongoose');

// Schema for individual items in a plan
const planItemSchema = new mongoose.Schema({
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
    calories: {
        type: Number, // Calculated: food calories * quantity
        default: 0
    }
});

// Main plan schema
const planSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        default: 'My Diet Plan'
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
    items: [planItemSchema], // Array of plan items
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster user plan lookups
planSchema.index({ userId: 1, isActive: 1 });

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;
