const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder
} = require('../controllers/orderController');
const { auth, isAdmin } = require('../middleware/auth');

// Protected routes
router.use(auth);

// Get all orders
router.get('/', getAllOrders);

// Create order
router.post('/', createOrder);

// Admin only routes
router.use(isAdmin);

// Update order status
router.patch('/:id/status', updateOrderStatus);

// Delete order
router.delete('/:id', deleteOrder);

module.exports = router; 