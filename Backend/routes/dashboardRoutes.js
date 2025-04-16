const express = require('express');
const router = express.Router();
const {
  getStats,
  getSalesData,
  getTopItems
} = require('../controllers/dashboardController');
const { auth } = require('../middleware/auth');

// Protected routes
router.use(auth);

// Get dashboard statistics
router.get('/stats', getStats);

// Get sales data
router.get('/sales', getSalesData);

// Get top items
router.get('/top-items', getTopItems);

module.exports = router; 