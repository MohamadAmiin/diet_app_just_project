/**
 * Log Routes
 * Handles meal logging and daily totals
 */

const express = require('express');
const router = express.Router();
const { LogController, TotalsController } = require('../controllers/logController');
const authMiddleware = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// ==================== Totals Routes ====================

router.get('/totals/today', TotalsController.getTodayTotals);
router.get('/totals/weekly', TotalsController.getWeeklySummary);
router.get('/totals/range', TotalsController.getTotalsRange);
router.get('/totals/date/:date', TotalsController.getTotalsByDate);

// ==================== Meal Log Routes ====================

router.get('/today', LogController.getTodayLogs);
router.get('/range', LogController.getLogsRange);
router.get('/date/:date', LogController.getLogsByDate);
router.get('/', LogController.getAllLogs);
router.post('/', LogController.createLog);
router.put('/:id', LogController.updateLog);
router.delete('/:id', LogController.deleteLog);

module.exports = router;
