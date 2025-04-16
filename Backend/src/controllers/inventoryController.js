const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
const { sendOrderEmail } = require('../services/emailService');

// Get all inventory items
const getInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({ isActive: true });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get low stock items
const getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: {
        $lte: ['$quantity', '$minimumStock']
      },
      isActive: true
    });
    res.json(lowStockItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create orders for low stock items
const createOrdersForLowStock = async (req, res) => {
  try {
    // Find all items that are below minimum stock
    const lowStockItems = await Inventory.find({
      $expr: {
        $lte: ['$quantity', '$minimumStock']
      },
      isActive: true
    });

    console.log(`Found ${lowStockItems.length} low stock items`);

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
          status: 'Pending'
        });

        if (!existingOrder) {
          // Calculate quantity needed (minimum stock - current quantity)
          const quantityNeeded = item.minimumStock - item.quantity;
          
          // Get the next order ID
          const count = await Order.countDocuments();
          const orderId = `ORD${String(count + 1).padStart(4, '0')}`;
          
          // Create a new order with all required fields
          const orderData = {
            orderId: orderId,
            items: [{
              item: item._id,
              quantity: quantityNeeded,
              price: item.price
            }],
            status: 'Pending',
            notes: `Automatic order created for low stock item: ${item.name}`,
            totalAmount: item.price * quantityNeeded
          };

          console.log('Creating order with data:', JSON.stringify(orderData, null, 2));

          const newOrder = new Order(orderData);
          const savedOrder = await newOrder.save();
          
          // Populate the order with item details
          const populatedOrder = await Order.findById(savedOrder._id)
            .populate('items.item', 'name category unit price');
            
          createdOrders.push(populatedOrder);
          console.log(`Created order for low stock item: ${item.name} with ID: ${orderId}`);
        } else {
          console.log(`Skipping item ${item.name} as it's already in a pending order`);
        }
      } catch (itemError) {
        console.error(`Error processing item ${item.name}:`, itemError);
        // Continue with next item even if one fails
      }
    }

    if (createdOrders.length === 0) {
      console.log('No new items to order after checking pending orders');
    }

    res.json({
      message: `Created ${createdOrders.length} new orders for low stock items`,
      orders: createdOrders
    });
  } catch (error) {
    console.error('Error in createOrdersForLowStock:', error);
    res.status(500).json({ 
      message: 'Error creating automatic orders',
      error: error.message 
    });
  }
};

module.exports = {
  getInventory,
  getLowStockItems,
  createOrdersForLowStock
}; 