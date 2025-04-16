const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const mongoose = require('mongoose');
const { sendOrderEmail } = require('../services/emailService');

// Get all orders
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all orders...');
    
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
    
    const orders = await Order.find().sort({ createdAt: -1 });
    console.log(`Found ${orders.length} orders`);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get a single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order' });
  }
});

// Create a new order
router.post('/', async (req, res) => {
  try {
    console.log('Creating new order with data:', req.body);
    
    // Generate a unique order ID
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderId = `ORD${timestamp}${random}`;
    
    // Create order data with the generated orderId
    const orderData = {
      ...req.body,
      orderId,
      status: req.body.status || 'Pending' // Ensure status is capitalized
    };
    
    console.log('Final order data:', orderData);
    
    const order = new Order(orderData);
    const savedOrder = await order.save();
    
    // Populate the order with item details
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('items.item', 'name category unit price');
    
    // Send email to suppliers
    try {
      console.log('Attempting to send email for new order...');
      await sendOrderEmail(populatedOrder);
      console.log('Email sent successfully for new order');
    } catch (emailError) {
      console.error('Error sending email for new order:', emailError);
      // Don't fail the order creation if email fails
    }
    
    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', Object.values(error.errors).map(err => err.message));
    }
    res.status(400).json({ message: error.message });
  }
});

// Update an order
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    console.log(`Updating order status to: ${status}`);
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update order fields
    order.status = status;
    if (req.body.notes) order.notes = req.body.notes;
    
    const updatedOrder = await order.save();
    
    // Populate the updated order
    const populatedOrder = await Order.findById(updatedOrder._id)
      .populate('items.item', 'name category unit price');
    
    // Send email if status is changed to Email Sent
    if (status === 'Email Sent') {
      try {
        console.log('Attempting to send email for status update...');
        await sendOrderEmail(populatedOrder);
        console.log('Email sent successfully for status update');
      } catch (emailError) {
        console.error('Error sending email for status update:', emailError);
        // Don't fail the status update if email fails
      }
    }
    
    res.json(populatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete an order
router.delete('/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create automatic orders for low stock items
router.post('/auto-create', async (req, res) => {
  try {
    console.log('Checking for low stock items...');
    
    // Find all items that are below minimum stock
    const lowStockItems = await Inventory.find({
      $expr: {
        $lte: ['$quantity', '$minimumStock']
      },
      isActive: true
    }).populate('category', 'name');

    console.log('Found low stock items:', lowStockItems.length);

    if (lowStockItems.length === 0) {
      return res.json({ 
        message: 'No low stock items found',
        orders: []
      });
    }

    const createdOrders = [];
    for (const item of lowStockItems) {
      try {
        // Check if an order for this item already exists
        const existingOrder = await Order.findOne({
          'items.item': item._id,
          status: 'pending'
        });

        if (!existingOrder) {
          // Create a new order with default quantity of 100
          const orderData = {
            items: [{
              item: item._id,
              quantity: 100,
              price: item.price,
              name: item.name,
              category: item.category?.name || 'Uncategorized',
              unit: item.unit || 'pcs'
            }],
            status: 'pending',
            notes: `Automatic order created for low stock item: ${item.name}`
          };

          const newOrder = new Order(orderData);
          await newOrder.save();
          createdOrders.push(newOrder);
          console.log(`Created order for low stock item: ${item.name}`);
        }
      } catch (itemError) {
        console.error(`Error processing item ${item.name}:`, itemError);
        // Continue with next item even if one fails
      }
    }

    res.json({
      message: `Created ${createdOrders.length} new orders for low stock items`,
      orders: createdOrders
    });
  } catch (error) {
    console.error('Error in auto-create orders:', error);
    res.status(500).json({ 
      message: 'Error creating automatic orders',
      error: error.message 
    });
  }
});

module.exports = router; 