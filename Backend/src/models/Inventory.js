const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    index: true,
    unique: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Groceries', 'Household', 'Snacks', 'Beverages', 'Personal Care', 'Other'],
    index: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    index: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'g', 'l', 'ml', 'pcs', 'box', 'pack']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: function(v) {
        // Check if the number has at most 2 decimal places
        return Number.isFinite(v) && Math.floor(v * 100) === v * 100;
      },
      message: 'Price must have at most 2 decimal places'
    }
  },
  minimumStock: {
    type: Number,
    required: [true, 'Minimum stock is required'],
    min: [0, 'Minimum stock cannot be negative']
  },
  supplier: {
    name: {
      type: String,
      trim: true,
      default: null
    },
    contact: {
      type: String,
      trim: true,
      default: null
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'Inventory'
});

// Add compound index for category and isActive
inventorySchema.index({ category: 1, isActive: 1 });

// Add compound index for name and isActive
inventorySchema.index({ name: 1, isActive: 1 });

// Add method to check if item is low on stock
inventorySchema.methods.isLowStock = function() {
  return this.quantity <= this.minimumStock;
};

// Update lastUpdated field before saving
inventorySchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Add static method to find low stock items
inventorySchema.statics.findLowStock = function() {
  return this.find({
    $expr: {
      $lte: ['$quantity', '$minimumStock']
    },
    isActive: true
  });
};

// Add method to update quantity
inventorySchema.methods.updateQuantity = function(amount) {
  this.quantity += amount;
  if (this.quantity < 0) {
    this.quantity = 0;
  }
  return this.save();
};

module.exports = mongoose.model('Inventory', inventorySchema); 