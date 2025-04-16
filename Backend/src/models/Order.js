const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  items: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Email Sent', 'Completed'],
    default: 'Pending'
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to generate order ID
orderSchema.pre('save', async function(next) {
  try {
    if (!this.orderId) {
      const count = await this.constructor.countDocuments();
      this.orderId = `ORD${String(count + 1).padStart(4, '0')}`;
      console.log(`Generated order ID: ${this.orderId}`);
    }
    next();
  } catch (error) {
    console.error('Error generating order ID:', error);
    next(error);
  }
});

// Pre-save middleware to calculate total amount
orderSchema.pre('save', function(next) {
  try {
    if (this.items && this.items.length > 0) {
      this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
      console.log(`Calculated total amount: ${this.totalAmount}`);
    }
    next();
  } catch (error) {
    console.error('Error calculating total amount:', error);
    next(error);
  }
});

// Ensure items are populated when querying
orderSchema.pre('find', function() {
  this.populate('items.item', 'name category unit price');
});

orderSchema.pre('findOne', function() {
  this.populate('items.item', 'name category unit price');
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 