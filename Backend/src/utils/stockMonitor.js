const http = require('http');
const config = require('../../config/config');
const Inventory = require('../models/Inventory');
const Order = require('../models/Order');

const checkLowStockAndCreateOrders = async () => {
  try {
    console.log('Checking for low stock items...');
    
    // Find all items that are below minimum stock
    const lowStockItems = await Inventory.find({
      $expr: {
        $lte: ['$quantity', '$minimumStock']
      },
      isActive: true
    });

    if (lowStockItems.length === 0) {
      console.log('No low stock items found');
      return;
    }

    // Create orders for each low stock item
    const createdOrders = [];
    for (const item of lowStockItems) {
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
            quantity: 100, // Default quantity
            price: item.price
          }],
          status: 'pending',
          notes: `Automatic order created for low stock item: ${item.name}`
        };

        const newOrder = new Order(orderData);
        await newOrder.save();
        createdOrders.push(newOrder);
        console.log(`Created order for low stock item: ${item.name}`);
      }
    }

    console.log(`Created ${createdOrders.length} new orders for low stock items`);
  } catch (error) {
    console.error('Error in stock monitoring:', error.message);
  }
};

// Run the check every hour
const startStockMonitoring = () => {
  // Run immediately on startup
  checkLowStockAndCreateOrders();
  
  // Then run every hour
  setInterval(checkLowStockAndCreateOrders, 60 * 60 * 1000);
};

module.exports = {
  startStockMonitoring
}; 