const Order = require('../models/Order');
const Inventory = require('../models/Inventory');

const checkAndCreateOrders = async () => {
  try {
    console.log('Checking for low stock items...');
    const lowStockItems = await Inventory.find({
      $expr: {
        $lt: ['$quantity', '$minimumStock']
      },
      isActive: true
    });

    if (!lowStockItems || lowStockItems.length === 0) {
      console.log('No low stock items found');
      return;
    }

    console.log(`Found ${lowStockItems.length} low stock items`);

    // Get all pending orders to check for existing items
    const pendingOrders = await Order.find({ status: 'Pending' })
      .populate('items.item');

    // Create a set of item IDs that are already in pending orders
    const itemsInPendingOrders = new Set();
    pendingOrders.forEach(order => {
      order.items.forEach(item => {
        itemsInPendingOrders.add(item.item._id.toString());
      });
    });

    // Create a map to track items and their quantities
    const orderItemsMap = new Map();

    // First pass: aggregate quantities for each item
    for (const item of lowStockItems) {
      // Skip if item is already in a pending order
      if (itemsInPendingOrders.has(item._id.toString())) {
        console.log(`Skipping item ${item.name} as it's already in a pending order`);
        continue;
      }

      // Skip if item is already in the current order
      if (orderItemsMap.has(item._id.toString())) {
        console.log(`Skipping duplicate item ${item.name} in current order`);
        continue;
      }

      const quantityNeeded = item.minimumStock - item.quantity;
      // Add item to the map
      orderItemsMap.set(item._id.toString(), {
        item: item._id,
        quantity: quantityNeeded,
        price: item.price
      });
    }

    // If no items to order after filtering, return
    if (orderItemsMap.size === 0) {
      console.log('No new items to order after checking pending orders');
      return;
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = Array.from(orderItemsMap.values());
    for (const item of orderItems) {
      totalAmount += item.quantity * item.price;
    }

    // Generate a unique order ID using timestamp and random number
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderId = `ORD${timestamp}${random}`;

    const orderData = {
      orderId,
      items: orderItems,
      totalAmount,
      status: 'Pending', // Using the correct case as defined in the schema
      notes: 'Automatic order created for low stock items'
    };

    console.log('Creating order with data:', orderData);

    const order = new Order(orderData);
    await order.save();

    console.log('Successfully created order with consolidated items');
  } catch (error) {
    console.error('Error in checkAndCreateOrders:', error);
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', Object.values(error.errors).map(err => err.message));
    }
  }
};

// Run the check every 5 minutes
const startAutoOrderService = () => {
  console.log('Starting automatic inventory check service...');
  // Run immediately on startup
  checkAndCreateOrders();
  // Then run every 5 minutes
  setInterval(checkAndCreateOrders, 5 * 60 * 1000);
};

module.exports = {
  startAutoOrderService
}; 