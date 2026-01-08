/**
 * Database Seed Script
 *
 * Run this script to populate the database with sample foods and an admin user.
 * Usage: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/user.model');
const Food = require('./models/food.model');

// Sample foods data
const sampleFoods = [
    // Protein sources
    { name: 'Chicken Breast (grilled)', calories: 165, protein: 31, carbs: 0, fats: 3.6, servingSize: '100g', category: 'protein' },
    { name: 'Salmon (baked)', calories: 208, protein: 20, carbs: 0, fats: 13, servingSize: '100g', category: 'protein' },
    { name: 'Eggs (boiled)', calories: 155, protein: 13, carbs: 1.1, fats: 11, servingSize: '2 eggs', category: 'protein' },
    { name: 'Ground Beef (lean)', calories: 250, protein: 26, carbs: 0, fats: 15, servingSize: '100g', category: 'protein' },
    { name: 'Tuna (canned)', calories: 116, protein: 26, carbs: 0, fats: 1, servingSize: '100g', category: 'protein' },
    { name: 'Greek Yogurt', calories: 100, protein: 17, carbs: 6, fats: 0.7, servingSize: '170g', category: 'protein' },

    // Carbohydrate sources
    { name: 'Brown Rice (cooked)', calories: 112, protein: 2.6, carbs: 24, fats: 0.9, servingSize: '100g', category: 'carbs' },
    { name: 'White Rice (cooked)', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, servingSize: '100g', category: 'carbs' },
    { name: 'Oatmeal (cooked)', calories: 71, protein: 2.5, carbs: 12, fats: 1.5, servingSize: '100g', category: 'carbs' },
    { name: 'Sweet Potato (baked)', calories: 103, protein: 2.3, carbs: 24, fats: 0.1, servingSize: '100g', category: 'carbs' },
    { name: 'Whole Wheat Bread', calories: 247, protein: 13, carbs: 41, fats: 3.4, servingSize: '2 slices', category: 'carbs' },
    { name: 'Pasta (cooked)', calories: 131, protein: 5, carbs: 25, fats: 1.1, servingSize: '100g', category: 'carbs' },

    // Vegetables
    { name: 'Broccoli (steamed)', calories: 35, protein: 2.4, carbs: 7, fats: 0.4, servingSize: '100g', category: 'vegetables' },
    { name: 'Spinach (raw)', calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4, servingSize: '100g', category: 'vegetables' },
    { name: 'Carrots (raw)', calories: 41, protein: 0.9, carbs: 10, fats: 0.2, servingSize: '100g', category: 'vegetables' },
    { name: 'Bell Peppers', calories: 31, protein: 1, carbs: 6, fats: 0.3, servingSize: '100g', category: 'vegetables' },
    { name: 'Tomatoes', calories: 18, protein: 0.9, carbs: 3.9, fats: 0.2, servingSize: '100g', category: 'vegetables' },
    { name: 'Cucumber', calories: 16, protein: 0.7, carbs: 3.6, fats: 0.1, servingSize: '100g', category: 'vegetables' },

    // Fruits
    { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, servingSize: '1 medium', category: 'fruits' },
    { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, servingSize: '1 medium', category: 'fruits' },
    { name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fats: 0.1, servingSize: '1 medium', category: 'fruits' },
    { name: 'Strawberries', calories: 32, protein: 0.7, carbs: 7.7, fats: 0.3, servingSize: '100g', category: 'fruits' },
    { name: 'Blueberries', calories: 57, protein: 0.7, carbs: 14, fats: 0.3, servingSize: '100g', category: 'fruits' },
    { name: 'Grapes', calories: 69, protein: 0.7, carbs: 18, fats: 0.2, servingSize: '100g', category: 'fruits' },

    // Dairy
    { name: 'Milk (whole)', calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3, servingSize: '100ml', category: 'dairy' },
    { name: 'Milk (skim)', calories: 34, protein: 3.4, carbs: 5, fats: 0.1, servingSize: '100ml', category: 'dairy' },
    { name: 'Cheese (cheddar)', calories: 403, protein: 25, carbs: 1.3, fats: 33, servingSize: '100g', category: 'dairy' },
    { name: 'Cottage Cheese', calories: 98, protein: 11, carbs: 3.4, fats: 4.3, servingSize: '100g', category: 'dairy' },

    // Fats
    { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fats: 50, servingSize: '100g', category: 'fats' },
    { name: 'Peanut Butter', calories: 588, protein: 25, carbs: 20, fats: 50, servingSize: '100g', category: 'fats' },
    { name: 'Avocado', calories: 160, protein: 2, carbs: 9, fats: 15, servingSize: '1/2 avocado', category: 'fats' },
    { name: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fats: 100, servingSize: '100ml', category: 'fats' },

    // Snacks
    { name: 'Protein Bar', calories: 200, protein: 20, carbs: 22, fats: 6, servingSize: '1 bar', category: 'snacks' },
    { name: 'Rice Cakes', calories: 35, protein: 0.7, carbs: 7.3, fats: 0.3, servingSize: '1 cake', category: 'snacks' },
    { name: 'Dark Chocolate', calories: 546, protein: 5, carbs: 60, fats: 31, servingSize: '100g', category: 'snacks' },

    // Beverages
    { name: 'Orange Juice', calories: 45, protein: 0.7, carbs: 10, fats: 0.2, servingSize: '100ml', category: 'beverages' },
    { name: 'Coffee (black)', calories: 2, protein: 0.3, carbs: 0, fats: 0, servingSize: '240ml', category: 'beverages' },
    { name: 'Green Tea', calories: 0, protein: 0, carbs: 0, fats: 0, servingSize: '240ml', category: 'beverages' },
    { name: 'Protein Shake', calories: 120, protein: 24, carbs: 3, fats: 1, servingSize: '1 scoop + water', category: 'beverages' }
];

// Admin user data
const adminUser = {
    email: 'admin@diet.com',
    password: 'admin123',
    role: 'admin',
    age: 30,
    height: 175,
    weight: 70,
    goal: 'maintain_weight',
    dailyCalorieTarget: 2000
};

// Seed function
const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/diet_management';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Food.deleteMany({});
        console.log('Cleared existing foods');

        // Insert foods
        const foods = await Food.insertMany(sampleFoods);
        console.log(`Inserted ${foods.length} foods`);

        // Check if admin exists
        let admin = await User.findOne({ email: adminUser.email });
        if (!admin) {
            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminUser.password, salt);

            admin = await User.create({
                ...adminUser,
                password: hashedPassword
            });
            console.log('Created admin user');
            console.log('  Email:', adminUser.email);
            console.log('  Password:', adminUser.password);
        } else {
            console.log('Admin user already exists');
        }

        console.log('\n✅ Database seeded successfully!');
        console.log('\nYou can now login with:');
        console.log('  Email: admin@diet.com');
        console.log('  Password: admin123');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

// Run seed
seedDatabase();
