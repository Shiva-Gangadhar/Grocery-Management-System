const Order = require('../models/Order');
const Inventory = require('../models/Inventory');

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.item', 'name price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.item', 'name price');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { items, customerName, notes } = req.body;

    // Validate and update inventory
    for (const orderItem of items) {
      const inventoryItem = await Inventory.findById(orderItem.item);
      if (!inventoryItem) {
        return res.status(404).json({ message: `Item ${orderItem.item} not found` });
      }
      if (inventoryItem.quantity < orderItem.quantity) {
        return res.status(400).json({ message: `Insufficient stock for item ${inventoryItem.name}` });
      }
      
      // Update inventory quantity
      inventoryItem.quantity -= orderItem.quantity;
      await inventoryItem.save();
      
      // Set price from inventory
      orderItem.price = inventoryItem.price;
    }

    const order = new Order({
      customerName,
      items,
      notes
    });

    await order.save();
    
    // Populate item details
    await order.populate('items.item', 'name price');
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('items.item', 'name price');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Restore inventory quantities
    for (const orderItem of order.items) {
      const inventoryItem = await Inventory.findById(orderItem.item);
      if (inventoryItem) {
        inventoryItem.quantity += orderItem.quantity;
        await inventoryItem.save();
      }
    }

    await order.remove();
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder
}; 