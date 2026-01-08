/**
 * Progress Controller
 * Handles weight tracking and progress monitoring
 * Business logic is included directly in this controller
 */

const Weight = require('../models/weightModel');
const { DailyTotals } = require('../models/logModel');
const Profile = require('../models/profileModel');

// ==================== Helper Functions ====================

/**
 * Get weight change statistics
 */
const getWeightProgress = async (userId) => {
    const weights = await Weight.find({ userId }).sort({ date: 1 });

    if (weights.length === 0) {
        return {
            currentWeight: null,
            startWeight: null,
            totalChange: 0,
            percentChange: 0,
            trend: 'no_data'
        };
    }

    const startWeight = weights[0].value;
    const currentWeight = weights[weights.length - 1].value;
    const totalChange = Math.round((currentWeight - startWeight) * 10) / 10;
    const percentChange = Math.round((totalChange / startWeight) * 100 * 10) / 10;

    const recentEntries = weights.slice(-7);
    let trend = 'stable';

    if (recentEntries.length >= 2) {
        const recentStart = recentEntries[0].value;
        const recentEnd = recentEntries[recentEntries.length - 1].value;
        const recentChange = recentEnd - recentStart;

        if (recentChange > 0.5) trend = 'gaining';
        else if (recentChange < -0.5) trend = 'losing';
    }

    return {
        currentWeight,
        startWeight,
        totalChange,
        percentChange,
        trend,
        entriesCount: weights.length
    };
};

/**
 * Get nutrition progress over time
 */
const getNutritionProgress = async (userId, days = 7) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const totals = await DailyTotals.find({
        userId,
        date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    if (totals.length === 0) {
        return {
            daysTracked: 0,
            averageCalories: 0,
            averageProtein: 0,
            averageCarbs: 0,
            averageFats: 0,
            history: []
        };
    }

    const sums = totals.reduce((acc, day) => {
        acc.calories += day.totalCalories;
        acc.protein += day.totalProtein;
        acc.carbs += day.totalCarbs;
        acc.fats += day.totalFats;
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

    return {
        daysTracked: totals.length,
        averageCalories: Math.round(sums.calories / totals.length),
        averageProtein: Math.round(sums.protein / totals.length * 10) / 10,
        averageCarbs: Math.round(sums.carbs / totals.length * 10) / 10,
        averageFats: Math.round(sums.fats / totals.length * 10) / 10,
        history: totals.map(t => ({
            date: t.date,
            calories: t.totalCalories,
            protein: t.totalProtein,
            carbs: t.totalCarbs,
            fats: t.totalFats
        }))
    };
};

/**
 * Get goal progress
 */
const getGoalProgressData = async (userId) => {
    const profile = await Profile.findOne({ userId });
    const weightProgress = await getWeightProgress(userId);

    if (!profile) {
        return {
            goal: null,
            status: 'no_profile',
            message: 'Please complete your profile to track goal progress'
        };
    }

    const { goal } = profile;

    let status = 'on_track';
    let message = '';

    switch (goal) {
        case 'lose_weight':
            if (weightProgress.trend === 'losing') {
                status = 'on_track';
                message = 'Great progress! You are losing weight.';
            } else if (weightProgress.trend === 'gaining') {
                status = 'off_track';
                message = 'You are gaining weight. Consider reviewing your diet plan.';
            } else {
                status = 'stable';
                message = 'Your weight is stable. Keep consistent with your plan.';
            }
            break;

        case 'gain_weight':
        case 'build_muscle':
            if (weightProgress.trend === 'gaining') {
                status = 'on_track';
                message = 'Great progress! You are gaining weight.';
            } else if (weightProgress.trend === 'losing') {
                status = 'off_track';
                message = 'You are losing weight. Consider increasing calorie intake.';
            } else {
                status = 'stable';
                message = 'Your weight is stable. Consider adjusting your diet plan.';
            }
            break;

        case 'maintain_weight':
            if (weightProgress.trend === 'stable') {
                status = 'on_track';
                message = 'Perfect! You are maintaining your weight.';
            } else {
                status = 'attention';
                message = 'Your weight is changing. Review your calorie intake.';
            }
            break;

        default:
            message = 'Set a goal in your profile to track progress.';
    }

    return {
        goal,
        status,
        message,
        weightProgress,
        calorieTarget: profile.dailyCalorieTarget
    };
};

// ==================== Weight Controller ====================

const WeightController = {
    /**
     * Log a new weight entry
     * POST /api/progress/weight
     */
    async logWeight(req, res) {
        try {
            const { value, date, notes } = req.body;

            if (!value) {
                return res.status(400).json({
                    success: false,
                    message: 'Weight value is required'
                });
            }

            const weight = new Weight({
                userId: req.user._id,
                value,
                date: date || new Date(),
                notes
            });

            await weight.save();

            // Update profile with latest weight
            await Profile.findOneAndUpdate(
                { userId: req.user._id },
                { weight: value }
            );

            res.status(201).json({
                success: true,
                message: 'Weight logged successfully',
                data: weight
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Get weight history
     * GET /api/progress/weight
     */
    async getWeightHistory(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 30;

            const weights = await Weight.find({ userId: req.user._id })
                .sort({ date: -1 })
                .limit(limit);

            res.status(200).json({
                success: true,
                count: weights.length,
                data: weights
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Get weight for a date range
     * GET /api/progress/weight/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
     */
    async getWeightRange(req, res) {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'startDate and endDate are required'
                });
            }

            const weights = await Weight.find({
                userId: req.user._id,
                date: { $gte: new Date(startDate), $lte: new Date(endDate) }
            }).sort({ date: 1 });

            res.status(200).json({
                success: true,
                count: weights.length,
                data: weights
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Get latest weight
     * GET /api/progress/weight/latest
     */
    async getLatestWeight(req, res) {
        try {
            const weight = await Weight.findOne({ userId: req.user._id }).sort({ date: -1 });

            if (!weight) {
                return res.status(404).json({
                    success: false,
                    message: 'No weight entries found'
                });
            }

            res.status(200).json({
                success: true,
                data: weight
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Update a weight entry
     * PUT /api/progress/weight/:id
     */
    async updateWeight(req, res) {
        try {
            const weight = await Weight.findById(req.params.id);

            if (!weight) {
                return res.status(404).json({
                    success: false,
                    message: 'Weight entry not found'
                });
            }

            if (weight.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const updatedWeight = await Weight.findByIdAndUpdate(
                req.params.id,
                { $set: req.body },
                { new: true, runValidators: true }
            );

            res.status(200).json({
                success: true,
                message: 'Weight entry updated',
                data: updatedWeight
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Delete a weight entry
     * DELETE /api/progress/weight/:id
     */
    async deleteWeight(req, res) {
        try {
            const weight = await Weight.findById(req.params.id);

            if (!weight) {
                return res.status(404).json({
                    success: false,
                    message: 'Weight entry not found'
                });
            }

            if (weight.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            await Weight.findByIdAndDelete(req.params.id);

            res.status(200).json({
                success: true,
                message: 'Weight entry deleted'
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
};

// ==================== Progress Controller ====================

const ProgressController = {
    /**
     * Get weight progress summary
     * GET /api/progress/weight-progress
     */
    async getWeightProgressSummary(req, res) {
        try {
            const progress = await getWeightProgress(req.user._id);

            res.status(200).json({
                success: true,
                data: progress
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Get nutrition progress
     * GET /api/progress/nutrition
     */
    async getNutritionProgressSummary(req, res) {
        try {
            const days = parseInt(req.query.days) || 7;
            const progress = await getNutritionProgress(req.user._id, days);

            res.status(200).json({
                success: true,
                data: progress
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Get goal progress
     * GET /api/progress/goal
     */
    async getGoalProgress(req, res) {
        try {
            const progress = await getGoalProgressData(req.user._id);

            res.status(200).json({
                success: true,
                data: progress
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Get comprehensive progress summary
     * GET /api/progress/summary
     */
    async getProgressSummary(req, res) {
        try {
            const [weightProgress, nutritionProgress, goalProgress] = await Promise.all([
                getWeightProgress(req.user._id),
                getNutritionProgress(req.user._id, 7),
                getGoalProgressData(req.user._id)
            ]);

            res.status(200).json({
                success: true,
                data: {
                    weight: weightProgress,
                    nutrition: nutritionProgress,
                    goal: goalProgress,
                    generatedAt: new Date()
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

module.exports = {
    WeightController,
    ProgressController
};
