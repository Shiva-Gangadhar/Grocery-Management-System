const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
  staffId: {
    type: String,
    unique: true,
    required: true,
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
  if (this.isNew) {
    try {
      // Find the highest staffId
      const highestStaff = await this.constructor.findOne({}, { staffId: 1 })
        .sort({ staffId: -1 })
        .lean();

      let newStaffId;
      if (highestStaff && highestStaff.staffId) {
        // Extract the number part and increment
        const numPart = parseInt(highestStaff.staffId.replace('STF', ''));
        newStaffId = `STF${String(numPart + 1).padStart(4, '0')}`;
      } else {
        // If no staff exists, start with STF0001
        newStaffId = 'STF0001';
      }

      // Check if the generated ID already exists
      const existingStaff = await this.constructor.findOne({ staffId: newStaffId });
      if (existingStaff) {
        // If exists, try the next number
        const numPart = parseInt(newStaffId.replace('STF', ''));
        newStaffId = `STF${String(numPart + 1).padStart(4, '0')}`;
      }

      this.staffId = newStaffId;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Method to compare password
staffSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Staff', staffSchema); 