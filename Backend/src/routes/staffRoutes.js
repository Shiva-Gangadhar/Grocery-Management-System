const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const mongoose = require('mongoose');

// Get all staff members
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all staff members...');
    
    // Check if MongoDB connection is established
    if (!mongoose.connection.readyState) {
      console.log('MongoDB connection not ready, waiting...');
      // Wait for connection to be established
      await new Promise(resolve => {
        const checkConnection = () => {
          if (mongoose.connection.readyState) {
            resolve();
          } else {
            setTimeout(checkConnection, 1000);
          }
        };
        checkConnection();
      });
    }
    
    // Log indexes on the Staff collection
    try {
      const indexes = await mongoose.connection.db.collection('Staff').indexes();
      console.log('Staff collection indexes:', JSON.stringify(indexes, null, 2));
    } catch (indexError) {
      console.error('Error fetching Staff indexes:', indexError);
    }
    
    const staff = await Staff.find().sort({ createdAt: -1 });
    console.log(`Found ${staff.length} staff members`);
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ message: 'Error fetching staff' });
  }
});

// Get staff members with 'staff' role for customer assignment
router.get('/for-assignment', async (req, res) => {
  try {
    console.log('Fetching staff members for customer assignment...');
    
    // Check if MongoDB connection is established
    if (!mongoose.connection.readyState) {
      console.log('MongoDB connection not ready, waiting...');
      // Wait for connection to be established
      await new Promise(resolve => {
        const checkConnection = () => {
          if (mongoose.connection.readyState) {
            resolve();
          } else {
            setTimeout(checkConnection, 1000);
          }
        };
        checkConnection();
      });
    }
    
    // Only fetch staff members with 'staff' role and who are active
    const staff = await Staff.find({ role: 'staff', isActive: true })
      .select('name staffId role')
      .sort({ name: 1 });
    
    console.log(`Found ${staff.length} staff members for assignment`);
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff for assignment:', error);
    res.status(500).json({ message: 'Error fetching staff for assignment' });
  }
});

// Get a single staff member
router.get('/:id', async (req, res) => {
  try {
    console.log(`Fetching staff member with ID: ${req.params.id}`);
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid staff ID format' });
    }
    
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      console.log(`Staff member with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Staff member not found' });
    }
    
    console.log(`Found staff member: ${staff.name}`);
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({ message: 'Error fetching staff member' });
  }
});

// Create a new staff member
router.post('/', async (req, res) => {
  try {
    console.log('Creating new staff member:', { ...req.body, password: '***' });
    
    // Validate required fields
    if (!req.body.name || !req.body.email || !req.body.password) {
      console.log('Missing required fields:', { 
        name: !!req.body.name, 
        email: !!req.body.email, 
        password: !!req.body.password 
      });
      return res.status(400).json({ 
        message: 'Name, email, and password are required' 
      });
    }

    // Validate password length
    if (req.body.password.length < 6) {
      console.log('Password too short:', req.body.password.length);
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if email already exists
    const existingStaff = await Staff.findOne({ email: req.body.email });
    if (existingStaff) {
      console.log(`Email ${req.body.email} already exists`);
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Create new staff member
    const staff = new Staff({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || 'staff',
      phone: req.body.phone || '',
      address: req.body.address || '',
      isActive: true
    });

    // Save staff member
    await staff.save();
    
    // Remove password from response
    const staffResponse = staff.toObject();
    delete staffResponse.password;

    console.log(`Staff member created with ID: ${staff._id}, staffId: ${staff.staffId}`);
    res.status(201).json(staffResponse);
  } catch (error) {
    console.error('Error creating staff member:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.log('Validation errors:', messages);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      console.log('Duplicate key error:', error.keyValue);
      return res.status(400).json({ 
        message: `Duplicate value for ${Object.keys(error.keyValue).join(', ')}` 
      });
    }
    
    // Handle other errors
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'Error creating staff member: ' + error.message });
  }
});

// Update a staff member
router.put('/:id', async (req, res) => {
  try {
    console.log(`Updating staff member with ID: ${req.params.id}`);
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid staff ID format' });
    }
    
    // Check if email is being updated and if it already exists
    if (req.body.email) {
      const existingStaff = await Staff.findOne({ 
        email: req.body.email,
        _id: { $ne: req.params.id }
      });
      
      if (existingStaff) {
        console.log(`Email ${req.body.email} already exists for another staff member`);
        return res.status(400).json({ message: 'Email already exists for another staff member' });
      }
    }
    
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!staff) {
      console.log(`Staff member with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Staff member not found' });
    }
    
    console.log(`Staff member updated: ${staff.name}`);
    res.json(staff);
  } catch (error) {
    console.error('Error updating staff member:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Error updating staff member' });
  }
});

// Delete a staff member
router.delete('/:id', async (req, res) => {
  try {
    console.log(`Deleting staff member with ID: ${req.params.id}`);
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid staff ID format' });
    }
    
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      console.log(`Staff member with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Staff member not found' });
    }
    
    console.log(`Staff member deleted: ${staff.name}`);
    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    res.status(500).json({ message: 'Error deleting staff member' });
  }
});

module.exports = router; 