const Order = require('../models/Order');
const Inventory = require('../models/Inventory');

const getStats = async (req, res) => {
  try {
    // Get total sales
    const totalSales = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Get total orders
    const totalOrders = await Order.countDocuments();

    // Get low stock items count
    const lowStockItems = await Inventory.countDocuments({
      isActive: true,
      $expr: { $lte: ['$quantity', '$minimumStock'] }
    });

    // Get total inventory items
    const totalInventory = await Inventory.countDocuments({ isActive: true });

    res.json({
      totalSales: totalSales[0]?.total || 0,
      totalOrders,
      lowStockItems,
      totalInventory
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

const getSalesData = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    let startDate = new Date();
    
    // Set start date based on period
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(salesData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sales data', error: error.message });
  }
};

const getTopItems = async (req, res) => {
  try {
    const topItems = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.item',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'inventories',
          localField: '_id',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      { $unwind: '$itemDetails' },
      {
        $project: {
          _id: 1,
          name: '$itemDetails.name',
          totalQuantity: 1,
          totalRevenue: 1
        }
      }
    ]);

    res.json(topItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching top items', error: error.message });
  }
};

module.exports = {
  getStats,
  getSalesData,
  getTopItems
};