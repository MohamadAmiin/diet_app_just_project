/**
 * Log Controller
 * Handles meal logging and daily totals
 * Business logic is included directly in this controller
 */

const { MealLog, DailyTotals } = require('../models/logModel');
const Food = require('../models/foodModel');

// ==================== Helper Functions ====================

/**
 * Get start and end of a date (for date range queries)
 */
const getDateRange = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return { start, end };
};

/**
 * Get start of day for a date
 */
const getStartOfDay = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
};

/**
 * Update daily totals for a user on a specific date
 */
const updateDailyTotals = async (userId, date) => {
    const startOfDay = getStartOfDay(date);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await MealLog.find({
        userId,
        date: { $gte: startOfDay, $lte: endOfDay }
    });

    const totals = {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
        mealsCount: logs.length
    };

    for (const log of logs) {
        totals.totalCalories += log.calories;
        totals.totalProtein += log.protein;
        totals.totalCarbs += log.carbs;
        totals.totalFats += log.fats;
    }

    totals.totalCalories = Math.round(totals.totalCalories);
    totals.totalProtein = Math.round(totals.totalProtein * 10) / 10;
    totals.totalCarbs = Math.round(totals.totalCarbs * 10) / 10;
    totals.totalFats = Math.round(totals.totalFats * 10) / 10;

    await DailyTotals.findOneAndUpdate(
        { userId, date: startOfDay },
        { $set: totals },
        { new: true, upsert: true }
    );
};

// ==================== Log Controller ====================

const LogController = {
    /**
     * Log a new meal
     * POST /api/logs
     */
    async createLog(req, res) {
        try {
            const { foodId, quantity, mealType, date } = req.body;

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

            const qty = quantity || 1;

            const mealLog = new MealLog({
                userId: req.user._id,
                foodId,
                quantity: qty,
                mealType,
                date: date || new Date(),
                calories: Math.round(food.calories * qty),
                protein: Math.round(food.protein * qty * 10) / 10,
                carbs: Math.round(food.carbs * qty * 10) / 10,
                fats: Math.round(food.fats * qty * 10) / 10
            });

            await mealLog.save();
            await updateDailyTotals(req.user._id, mealLog.date);

            const log = await MealLog.findById(mealLog._id).populate('foodId');

            res.status(201).json({
                success: true,
                message: 'Meal logged successfully',
                data: log
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Get logs for today
     * GET /api/logs/today
     */
    async getTodayLogs(req, res) {
        try {
            const { start, end } = getDateRange(new Date());

            const logs = await MealLog.find({
                userId: req.user._id,
                date: { $gte: start, $lte: end }
            }).populate('foodId').sort({ date: 1 });

            res.status(200).json({
                success: true,
                count: logs.length,
                data: logs
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Get logs for a specific date
     * GET /api/logs/date/:date
     */
    async getLogsByDate(req, res) {
        try {
            const date = new Date(req.params.date);

            if (isNaN(date.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date format. Use YYYY-MM-DD'
                });
            }

            const { start, end } = getDateRange(date);

            const logs = await MealLog.find({
                userId: req.user._id,
                date: { $gte: start, $lte: end }
            }).populate('foodId').sort({ date: 1 });

            res.status(200).json({
                success: true,
                count: logs.length,
                date: req.params.date,
                data: logs
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Get logs for a date range
     * GET /api/logs/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
     */
    async getLogsRange(req, res) {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'startDate and endDate are required'
                });
            }

            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date format. Use YYYY-MM-DD'
                });
            }

            const logs = await MealLog.find({
                userId: req.user._id,
                date: { $gte: start, $lte: end }
            }).populate('foodId').sort({ date: 1 });

            res.status(200).json({
                success: true,
                count: logs.length,
                startDate,
                endDate,
                data: logs
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Get all logs (with limit)
     * GET /api/logs
     */
    async getAllLogs(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 50;

            const logs = await MealLog.find({ userId: req.user._id })
                .populate('foodId')
                .sort({ date: -1 })
                .limit(limit);

            res.status(200).json({
                success: true,
                count: logs.length,
                data: logs
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Update a meal log
     * PUT /api/logs/:id
     */
    async updateLog(req, res) {
        try {
            const log = await MealLog.findById(req.params.id);

            if (!log) {
                return res.status(404).json({
                    success: false,
                    message: 'Log not found'
                });
            }

            if (log.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            let updateData = { ...req.body };

            if (updateData.quantity || updateData.foodId) {
                const foodId = updateData.foodId || log.foodId;
                const quantity = updateData.quantity || log.quantity;

                const food = await Food.findById(foodId);
                if (food) {
                    updateData.calories = Math.round(food.calories * quantity);
                    updateData.protein = Math.round(food.protein * quantity * 10) / 10;
                    updateData.carbs = Math.round(food.carbs * quantity * 10) / 10;
                    updateData.fats = Math.round(food.fats * quantity * 10) / 10;
                }
            }

            const updatedLog = await MealLog.findByIdAndUpdate(
                req.params.id,
                { $set: updateData },
                { new: true, runValidators: true }
            ).populate('foodId');

            await updateDailyTotals(log.userId, log.date);

            res.status(200).json({
                success: true,
                message: 'Log updated successfully',
                data: updatedLog
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Delete a meal log
     * DELETE /api/logs/:id
     */
    async deleteLog(req, res) {
        try {
            const log = await MealLog.findById(req.params.id);

            if (!log) {
                return res.status(404).json({
                    success: false,
                    message: 'Log not found'
                });
            }

            if (log.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }

            const { userId, date } = log;

            await MealLog.findByIdAndDelete(req.params.id);
            await updateDailyTotals(userId, date);

            res.status(200).json({
                success: true,
                message: 'Log deleted successfully'
            });

        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
};

// ==================== Totals Controller ====================

const TotalsController = {
    /**
     * Get today's totals
     * GET /api/logs/totals/today
     */
    async getTodayTotals(req, res) {
        try {
            const startOfDay = getStartOfDay(new Date());

            let totals = await DailyTotals.findOne({ userId: req.user._id, date: startOfDay });

            if (!totals) {
                totals = {
                    userId: req.user._id,
                    date: startOfDay,
                    totalCalories: 0,
                    totalProtein: 0,
                    totalCarbs: 0,
                    totalFats: 0,
                    mealsCount: 0
                };
            }

            res.status(200).json({
                success: true,
                data: totals
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Get totals for a specific date
     * GET /api/logs/totals/date/:date
     */
    async getTotalsByDate(req, res) {
        try {
            const date = new Date(req.params.date);

            if (isNaN(date.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date format. Use YYYY-MM-DD'
                });
            }

            const startOfDay = getStartOfDay(date);

            let totals = await DailyTotals.findOne({ userId: req.user._id, date: startOfDay });

            if (!totals) {
                totals = {
                    userId: req.user._id,
                    date: startOfDay,
                    totalCalories: 0,
                    totalProtein: 0,
                    totalCarbs: 0,
                    totalFats: 0,
                    mealsCount: 0
                };
            }

            res.status(200).json({
                success: true,
                data: totals
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Get totals for a date range
     * GET /api/logs/totals/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
     */
    async getTotalsRange(req, res) {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'startDate and endDate are required'
                });
            }

            const start = getStartOfDay(new Date(startDate));
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            const totals = await DailyTotals.find({
                userId: req.user._id,
                date: { $gte: start, $lte: end }
            }).sort({ date: 1 });

            res.status(200).json({
                success: true,
                count: totals.length,
                data: totals
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    /**
     * Get weekly summary
     * GET /api/logs/totals/weekly
     */
    async getWeeklySummary(req, res) {
        try {
            let weekStart = new Date();
            const day = weekStart.getDay();
            const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
            weekStart.setDate(diff);
            weekStart.setHours(0, 0, 0, 0);

            if (req.query.weekStart) {
                weekStart = new Date(req.query.weekStart);
            }

            const start = getStartOfDay(weekStart);
            const end = new Date(start);
            end.setDate(end.getDate() + 7);

            const totals = await DailyTotals.find({
                userId: req.user._id,
                date: { $gte: start, $lt: end }
            });

            const summary = {
                weekStart: start,
                daysLogged: totals.length,
                averageCalories: 0,
                averageProtein: 0,
                averageCarbs: 0,
                averageFats: 0,
                totalMeals: 0
            };

            if (totals.length > 0) {
                const sums = totals.reduce((acc, day) => {
                    acc.calories += day.totalCalories;
                    acc.protein += day.totalProtein;
                    acc.carbs += day.totalCarbs;
                    acc.fats += day.totalFats;
                    acc.meals += day.mealsCount;
                    return acc;
                }, { calories: 0, protein: 0, carbs: 0, fats: 0, meals: 0 });

                summary.averageCalories = Math.round(sums.calories / totals.length);
                summary.averageProtein = Math.round(sums.protein / totals.length * 10) / 10;
                summary.averageCarbs = Math.round(sums.carbs / totals.length * 10) / 10;
                summary.averageFats = Math.round(sums.fats / totals.length * 10) / 10;
                summary.totalMeals = sums.meals;
            }

            res.status(200).json({
                success: true,
                data: summary
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
    LogController,
    TotalsController
};
