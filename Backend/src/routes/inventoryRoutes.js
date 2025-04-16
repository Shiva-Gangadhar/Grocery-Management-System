const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    console.log('Fetching inventory items...');
    
    // Check if MongoDB connection is established
    if (!mongoose.connection.readyState) {
      console.log('MongoDB connection not ready, waiting...');
      // Wait for connection to be established
      await new Promise(resolve => {
        const checkConnection = () => {
          if (mongoose.connection.readyState) {
            resolve();
          } else {
            setTimeout(checkConnection, 1000);
          }
        };
        checkConnection();
      });
    }
    
    // Log available collections
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Available collections:', collections.map(c => c.name));
    } catch (err) {
      console.error('Error listing collections:', err);
    }
    
    const inventory = await Inventory.find({ isActive: true });
    console.log(`Found ${inventory.length} inventory items`);
    
    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory items'
    });
  }
});

// Get a single inventory item
router.get('/:id', async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory item'
    });
  }
});

// Create a new inventory item
router.post('/', async (req, res) => {
  try {
    console.log('Creating new inventory item with data:', req.body);
    
    // Check if MongoDB connection is established
    if (!mongoose.connection.readyState) {
      console.log('MongoDB connection not ready, waiting...');
      // Wait for connection to be established
      await new Promise(resolve => {
        const checkConnection = () => {
          if (mongoose.connection.readyState) {
            resolve();
          } else {
            setTimeout(checkConnection, 1000);
          }
        };
        checkConnection();
      });
    }
    
    const inventory = await Inventory.create(req.body);
    
    console.log('Successfully created inventory item:', inventory);
    
    res.status(201).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    
    // Provide more detailed error messages
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    } else if (error.code === 11000) {
      // Duplicate key error (unique constraint violation)
      return res.status(400).json({
        success: false,
        message: 'An item with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating inventory item',
      error: error.message
    });
  }
});

// Update an inventory item
router.put('/:id', async (req, res) => {
  try {
    console.log(`Updating inventory item ${req.params.id} with data:`, req.body);
    
    // Check if MongoDB connection is established
    if (!mongoose.connection.readyState) {
      console.log('MongoDB connection not ready, waiting...');
      // Wait for connection to be established
      await new Promise(resolve => {
        const checkConnection = () => {
          if (mongoose.connection.readyState) {
            resolve();
          } else {
            setTimeout(checkConnection, 1000);
          }
        };
        checkConnection();
      });
    }
    
    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true,
        runValidators: true
      }
    );
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    console.log('Successfully updated inventory item:', inventory);
    
    res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    
    // Provide more detailed error messages
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    } else if (error.code === 11000) {
      // Duplicate key error (unique constraint violation)
      return res.status(400).json({
        success: false,
        message: 'An item with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating inventory item',
      error: error.message
    });
  }
});

// Delete an inventory item
router.delete('/:id', async (req, res) => {
  try {
    console.log(`Attempting to delete inventory item ${req.params.id}`);
    
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    
    if (!inventory) {
      console.log(`Inventory item ${req.params.id} not found`);
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }
    
    console.log(`Successfully deleted inventory item ${req.params.id}`);
    res.status(200).json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting inventory item',
      error: error.message
    });
  }
});

// Get inventory by category
router.get('/category/:category', async (req, res) => {
  try {
    const items = await Inventory.find({
      category: req.params.category,
      isActive: true
    });
    
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Error fetching inventory by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory by category'
    });
  }
});

// Get low stock items
router.get('/low-stock', async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: {
        $lte: ['$quantity', '$minimumStock']
      },
      isActive: true
    });
    res.json({
      success: true,
      data: lowStockItems
    });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock items'
    });
  }
});

// Check for low stock items and create orders
router.get('/check-low-stock', async (req, res) => {
  try {
    console.log('Checking for low stock items...');
    
    // Find all items where quantity is less than minimumStock
    const lowStockItems = await Inventory.find({
      $expr: {
        $lt: ['$quantity', '$minimumStock']
      }
    });

    console.log('Found low stock items:', lowStockItems);

    if (!lowStockItems || lowStockItems.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No low stock items found',
        data: []
      });
    }

    // Create orders for each low stock item
    const createdOrders = [];
    for (const item of lowStockItems) {
      try {
        // Calculate the quantity needed
        const quantityNeeded = item.minimumStock - item.quantity;
        
        // Calculate total amount
        const totalAmount = quantityNeeded * item.price;
        
        // Create order data
        const orderData = {
          items: [{
            item: item._id,
            quantity: quantityNeeded,
            price: item.price
          }],
          totalAmount: totalAmount,
          status: 'pending',
          notes: `Automatic order created for low stock item: ${item.name}`
        };

        console.log('Creating order with data:', orderData);

        // Create the order
        const order = new Order(orderData);
        await order.save();

        // Populate the order with item details
        const populatedOrder = await Order.findById(order._id)
          .populate({
            path: 'items.item',
            select: 'name category unit price'
          });

        createdOrders.push(populatedOrder);
        console.log(`Created order for item: ${item.name}`);
      } catch (itemError) {
        console.error(`Error creating order for item ${item.name}:`, itemError);
        // Continue with other items even if one fails
      }
    }

    res.status(200).json({
      success: true,
      message: `Created ${createdOrders.length} orders for low stock items`,
      data: createdOrders
    });
  } catch (error) {
    console.error('Error in check-low-stock route:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking low stock items',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

// This file is a wrapper to fix casing issues
const inventoryRoutes = require('./inventoryRoutes');
module.exports = inventoryRoutes; 
