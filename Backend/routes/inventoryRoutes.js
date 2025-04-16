const express = require('express');
const router = express.Router();
const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getLowStockItems
} = require('../controllers/inventoryController');
const { auth, isAdmin } = require('../middleware/auth');

// Protected routes
router.use(auth);

// Get all items
router.get('/', getAllItems);

// Get low stock items
router.get('/low-stock', getLowStockItems);

// Get single item
router.get('/:id', getItemById);

// Admin only routes
router.use(isAdmin);

// Create item
router.post('/', createItem);

// Update item
router.put('/:id', updateItem);

// Delete item
router.delete('/:id', deleteItem);

module.exports = router; 