const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    index: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    index: true
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    trim: true,
    index: true
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'Suppliers'
});

// Add compound index for name and isActive
supplierSchema.index({ name: 1, isActive: 1 });

// Add compound index for email and isActive
supplierSchema.index({ email: 1, isActive: 1 });

// Add compound index for phone and isActive
supplierSchema.index({ phone: 1, isActive: 1 });

// Add compound index for branch and isActive
supplierSchema.index({ branch: 1, isActive: 1 });

// Update lastUpdated field before saving
supplierSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier; 