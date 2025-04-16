const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  tokenNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  assignedStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'Customer'
});

// Generate token number before saving
customerSchema.pre('save', function(next) {
  if (!this.tokenNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.tokenNumber = `TKN${timestamp}${random}`;
  }
  next();
});

// Static method to generate token number
customerSchema.statics.generateTokenNumber = async function() {
  let tokenNumber;
  let isUnique = false;
  
  while (!isUnique) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    tokenNumber = `TKN${timestamp}${random}`;
    
    // Check if token number already exists
    const existingCustomer = await this.findOne({ tokenNumber });
    if (!existingCustomer) {
      isUnique = true;
    }
  }
  
  return tokenNumber;
};

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer; 