/**
 * Plan Controller
 * Handles diet plans and food management
 * Business logic is included directly in this controller
 */

const Plan = require('../models/plan.model');
const Food = require('../models/food.model');
const Profile = require('../models/profile.model');

// ==================== Helper Functions ====================

/**
 * Calculate nutritional totals for plan items
 */
const calculateNutrition = async (items) => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;

    for (const item of items) {
        const food = await Food.findById(item.foodId);
        if (food) {
            const quantity = item.quantity || 1;
            totalCalories += food.calories * quantity;
            totalProtein += food.protein * quantity;
            totalCarbs += food.carbs * quantity;
            totalFats += food.fats * quantity;
        }
    }

    return {
        totalCalories: Math.round(totalCalories),
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        totalFats: Math.round(totalFats * 10) / 10
    };
};

/**
 * Calculate daily calorie needs based on profile (Harris-Benedict equation)
 */
const calculateDailyCalories = (profile, gender = 'male') => {
    const { age, height, weight, goal } = profile;

    let bmr;
    if (gender === 'male') {
        bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    const activityMultiplier = 1.55;
    let tdee = bmr * activityMultiplier;

    switch (goal) {
        case 'lose_weight':
            tdee -= 500;
            break;
        case 'gain_weight':
        case 'build_muscle':
            tdee += 300;
            break;
    }

    return Math.round(tdee);
};

/**
 * Calculate macros distribution
 */
const calculateMacros = (calories, goal) => {
    let proteinRatio, carbsRatio, fatsRatio;

    switch (goal) {
        case 'lose_weight':
            proteinRatio = 0.35;
            carbsRatio = 0.35;
            fatsRatio = 0.30;
            break;
        case 'build_muscle':
            proteinRatio = 0.30;
            carbsRatio = 0.45;
            fatsRatio = 0.25;
            break;
        default:
            proteinRatio = 0.25;
            carbsRatio = 0.50;
            fatsRatio = 0.25;
    }

    return {
        protein: Math.round((calories * proteinRatio) / 4),
        carbs: Math.round((calories * carbsRatio) / 4),
        fats: Math.round((calories * fatsRatio) / 9)
    };
};

// ==================== Plan Controller ====================

const PlanController = {
    /**
     * Create a new diet plan
     * POST /api/plans
     */
    async createPlan(req, res) {
        try {
            const { name, items } = req.body;

            const processedItems = [];
            for (const item of items || []) {
                const food = await Food.findById(item.foodId);
                if (food) {
                    processedItems.push({
                        ...item,
                        calories: Math.round(food.calories * (item.quantity || 1))
                    });
                }
            }

            const totals = await calculateNutrition(items || []);

            const plan = new Plan({
                userId: req.user._id,
                name: name || 'My Diet Plan',
                items: processedItems,
                ...totals
            });

            await plan.save();

            res.status(201).json({
                success: true,
                message: 'Diet plan created successfully',
                data: plan
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Get all plans for current user
     * GET /api/plans
     */
    async getUserPlans(req, res) {
        try {
            const plans = await Plan.find({ userId: req.user._id })
                .populate('items.foodId')
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                count: plans.length,
                data: plans
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Get a specific plan by ID
     * GET /api/plans/:id
     */
    async getPlan(req, res) {
        try {
            const plan = await Plan.findById(req.params.id).populate('items.foodId');

            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plan not found'
                });
            }

            if (plan.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            res.status(200).json({
                success: true,
                data: plan
            });

        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Update a diet plan
     * PUT /api/plans/:id
     */
    async updatePlan(req, res) {
        try {
            const plan = await Plan.findById(req.params.id);

            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plan not found'
                });
            }

            if (plan.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            let updateData = { ...req.body };

            if (updateData.items) {
                const processedItems = [];
                for (const item of updateData.items) {
                    const food = await Food.findById(item.foodId);
                    if (food) {
                        processedItems.push({
                            ...item,
                            calories: Math.round(food.calories * (item.quantity || 1))
                        });
                    }
                }
                updateData.items = processedItems;

                const totals = await calculateNutrition(updateData.items);
                Object.assign(updateData, totals);
            }

            const updatedPlan = await Plan.findByIdAndUpdate(
                req.params.id,
                { $set: updateData },
                { new: true, runValidators: true }
            ).populate('items.foodId');

            res.status(200).json({
                success: true,
                message: 'Plan updated successfully',
                data: updatedPlan
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Add item to a plan
     * POST /api/plans/:id/items
     */
    async addItem(req, res) {
        try {
            const plan = await Plan.findById(req.params.id);

            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plan not found'
                });
            }

            if (plan.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const { foodId, quantity, mealType } = req.body;

            if (!foodId || !mealType) {
                return res.status(400).json({
                    success: false,
                    message: 'foodId and mealType are required'
                });
            }

            const food = await Food.findById(foodId);
            if (!food) {
                return res.status(404).json({
                    success: false,
                    message: 'Food not found'
                });
            }

            const newItem = {
                foodId,
                quantity: quantity || 1,
                mealType,
                calories: Math.round(food.calories * (quantity || 1))
            };

            plan.items.push(newItem);

            const totals = await calculateNutrition(plan.items);
            Object.assign(plan, totals);

            await plan.save();
            const updatedPlan = await Plan.findById(req.params.id).populate('items.foodId');

            res.status(200).json({
                success: true,
                message: 'Item added to plan',
                data: updatedPlan
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Remove item from a plan
     * DELETE /api/plans/:id/items/:itemId
     */
    async removeItem(req, res) {
        try {
            const plan = await Plan.findById(req.params.id);

            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plan not found'
                });
            }

            if (plan.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            plan.items = plan.items.filter(item => item._id.toString() !== req.params.itemId);

            const totals = await calculateNutrition(plan.items);
            Object.assign(plan, totals);

            await plan.save();
            const updatedPlan = await Plan.findById(req.params.id).populate('items.foodId');

            res.status(200).json({
                success: true,
                message: 'Item removed from plan',
                data: updatedPlan
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Delete a plan
     * DELETE /api/plans/:id
     */
    async deletePlan(req, res) {
        try {
            const plan = await Plan.findById(req.params.id);

            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plan not found'
                });
            }

            if (plan.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            await Plan.findByIdAndDelete(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Plan deleted successfully'
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Get active plan
     * GET /api/plans/active
     */
    async getActivePlan(req, res) {
        try {
            const plan = await Plan.findOne({ userId: req.user._id, isActive: true })
                .populate('items.foodId');

            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'No active plan found'
                });
            }

            res.status(200).json({
                success: true,
                data: plan
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Set a plan as active
     * PUT /api/plans/:id/activate
     */
    async setActivePlan(req, res) {
        try {
            const plan = await Plan.findById(req.params.id);

            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Plan not found'
                });
            }

            if (plan.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            await Plan.updateMany({ userId: req.user._id }, { isActive: false });

            const activePlan = await Plan.findByIdAndUpdate(
                req.params.id,
                { isActive: true },
                { new: true }
            ).populate('items.foodId');

            res.status(200).json({
                success: true,
                message: 'Plan set as active',
                data: activePlan
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Calculate recommended calories based on profile
     * GET /api/plans/calculate-calories
     */
    async calculateCalories(req, res) {
        try {
            const profile = await Profile.findOne({ userId: req.user._id });

            if (!profile || !profile.age || !profile.height || !profile.weight) {
                return res.status(400).json({
                    success: false,
                    message: 'Please complete your profile (age, height, weight) first'
                });
            }

            const gender = req.query.gender || 'male';
            const dailyCalories = calculateDailyCalories(profile, gender);
            const macros = calculateMacros(dailyCalories, profile.goal);

            res.status(200).json({
                success: true,
                data: {
                    dailyCalories,
                    macros,
                    goal: profile.goal,
                    profile: {
                        age: profile.age,
                        height: profile.height,
                        weight: profile.weight
                    }
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

// ==================== Food Controller ====================

const FoodController = {
    /**
     * Create a new food item (admin only)
     * POST /api/foods
     */
    async createFood(req, res) {
        try {
            const { name, calories, protein, carbs, fats, servingSize, category } = req.body;

            if (!name || calories === undefined || protein === undefined ||
                carbs === undefined || fats === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, calories, protein, carbs, and fats are required'
                });
            }

            const food = new Food({
                name,
                calories,
                protein,
                carbs,
                fats,
                servingSize,
                category,
                createdBy: req.user._id
            });

            await food.save();

            res.status(201).json({
                success: true,
                message: 'Food created successfully',
                data: food
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Get all foods
     * GET /api/foods
     */
    async getAllFoods(req, res) {
        try {
            const { category, search, limit = 50 } = req.query;

            let query = {};

            if (category) {
                query.category = category;
            }

            if (search) {
                query.name = { $regex: search, $options: 'i' };
            }

            const foods = await Food.find(query).limit(parseInt(limit));

            res.status(200).json({
                success: true,
                count: foods.length,
                data: foods
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Get a single food by ID
     * GET /api/foods/:id
     */
    async getFood(req, res) {
        try {
            const food = await Food.findById(req.params.id);

            if (!food) {
                return res.status(404).json({
                    success: false,
                    message: 'Food not found'
                });
            }

            res.status(200).json({
                success: true,
                data: food
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Update a food item (admin only)
     * PUT /api/foods/:id
     */
    async updateFood(req, res) {
        try {
            const food = await Food.findByIdAndUpdate(
                req.params.id,
                { $set: req.body },
                { new: true, runValidators: true }
            );

            if (!food) {
                return res.status(404).json({
                    success: false,
                    message: 'Food not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Food updated successfully',
                data: food
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Delete a food item (admin only)
     * DELETE /api/foods/:id
     */
    async deleteFood(req, res) {
        try {
            const food = await Food.findByIdAndDelete(req.params.id);

            if (!food) {
                return res.status(404).json({
                    success: false,
                    message: 'Food not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Food deleted successfully'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = {
    PlanController,
    FoodController
};
