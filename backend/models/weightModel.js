/**
 * Weight Model
 * Tracks user weight over time for progress monitoring
 */

const mongoose = require('mongoose');

const weightSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    value: {
        type: Number, // in kilograms
        required: [true, 'Weight value is required'],
        min: [20, 'Weight must be at least 20kg'],
        max: [500, 'Weight must be realistic']
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    notes: {
        type: String,
        maxlength: [200, 'Notes cannot exceed 200 characters']
    }
}, {
    timestamps: true
});

// Index for faster lookups by user and date
weightSchema.index({ userId: 1, date: -1 });

const Weight = mongoose.model('Weight', weightSchema);

module.exports = Weight;
