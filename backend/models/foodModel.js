/**
 * Food Model
 * Stores food items with nutritional information
 */

const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Food name is required'],
        trim: true,
        maxlength: [100, 'Food name cannot exceed 100 characters']
    },
    calories: {
        type: Number,
        required: [true, 'Calories are required'],
        min: [0, 'Calories cannot be negative']
    },
    protein: {
        type: Number, // in grams
        required: [true, 'Protein is required'],
        min: [0, 'Protein cannot be negative']
    },
    carbs: {
        type: Number, // in grams
        required: [true, 'Carbs are required'],
        min: [0, 'Carbs cannot be negative']
    },
    fats: {
        type: Number, // in grams
        required: [true, 'Fats are required'],
        min: [0, 'Fats cannot be negative']
    },
    servingSize: {
        type: String,
        default: '100g' // Default serving size
    },
    category: {
        type: String,
        enum: ['protein', 'carbs', 'vegetables', 'fruits', 'dairy', 'fats', 'snacks', 'beverages', 'other'],
        default: 'other'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for faster food searches
foodSchema.index({ name: 'text' });
foodSchema.index({ category: 1 });

const Food = mongoose.model('Food', foodSchema);

module.exports = Food;
