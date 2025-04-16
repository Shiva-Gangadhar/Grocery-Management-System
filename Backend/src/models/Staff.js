const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
  staffId: {
    type: String,
    unique: true,
    sparse: true, // This allows multiple documents to have null values
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['Cashier', 'Salesperson'],
    default: 'Salesperson'
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'Staff'
});

// Generate a unique staffId before saving
staffSchema.pre('save', async function(next) {
  // Only generate staffId for new documents
  if (this.isNew && !this.staffId) {
    try {
      // Find the highest staffId and increment it
      const lastStaff = await this.constructor.findOne({}, {}, { sort: { 'staffId': -1 } });
      let newStaffId = 'S001';
      
      if (lastStaff && lastStaff.staffId) {
        const lastIdNumber = parseInt(lastStaff.staffId.substring(1));
        newStaffId = 'S' + String(lastIdNumber + 1).padStart(3, '0');
      }
      
      this.staffId = newStaffId;
    } catch (error) {
      console.error('Error generating staffId:', error);
      // Continue without staffId if there's an error
    }
  }
  
  // Hash password if it's modified
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

// Method to compare password
staffSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Staff', staffSchema); 