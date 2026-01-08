/**
 * Progress Routes
 * Handles weight tracking and progress monitoring
 */

const express = require('express');
const router = express.Router();
const { WeightController, ProgressController } = require('../controllers/progress.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// All routes require authentication
router.use(authMiddleware);

// ==================== Progress Summary Routes ====================

router.get('/summary', ProgressController.getProgressSummary);
router.get('/weight-progress', ProgressController.getWeightProgressSummary);
router.get('/nutrition', ProgressController.getNutritionProgressSummary);
router.get('/goal', ProgressController.getGoalProgress);

// ==================== Weight Tracking Routes ====================

router.get('/weight/latest', WeightController.getLatestWeight);
router.get('/weight/range', WeightController.getWeightRange);
router.get('/weight', WeightController.getWeightHistory);
router.post('/weight', WeightController.logWeight);
router.put('/weight/:id', WeightController.updateWeight);
router.delete('/weight/:id', WeightController.deleteWeight);

module.exports = router;
