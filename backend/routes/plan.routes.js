/**
 * Plan Routes
 * Handles diet plans and food management
 */

const express = require('express');
const router = express.Router();
const { PlanController, FoodController } = require('../controllers/plan.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

// ==================== Food Routes ====================

router.get('/foods', authMiddleware, FoodController.getAllFoods);
router.get('/foods/:id', authMiddleware, FoodController.getFood);
router.post('/foods', authMiddleware, isAdmin, FoodController.createFood);
router.put('/foods/:id', authMiddleware, isAdmin, FoodController.updateFood);
router.delete('/foods/:id', authMiddleware, isAdmin, FoodController.deleteFood);

// ==================== Plan Routes ====================

router.get('/plans/calculate-calories', authMiddleware, PlanController.calculateCalories);
router.get('/plans/active', authMiddleware, PlanController.getActivePlan);
router.get('/plans', authMiddleware, PlanController.getUserPlans);
router.get('/plans/:id', authMiddleware, PlanController.getPlan);
router.post('/plans', authMiddleware, PlanController.createPlan);
router.put('/plans/:id', authMiddleware, PlanController.updatePlan);
router.put('/plans/:id/activate', authMiddleware, PlanController.setActivePlan);
router.post('/plans/:id/items', authMiddleware, PlanController.addItem);
router.delete('/plans/:id/items/:itemId', authMiddleware, PlanController.removeItem);
router.delete('/plans/:id', authMiddleware, PlanController.deletePlan);

module.exports = router;
