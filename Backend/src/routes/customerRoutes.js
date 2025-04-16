const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Staff = require('../models/Staff');
const Customer = require('../models/Customer');

// Get all customers
router.get('/', async (req, res) => {
  try {
    if (!mongoose.connection.readyState) {
      return res.status(500).json({ message: 'Database connection not established' });
    }

    const customers = await Customer.find()
      .populate({
        path: 'assignedStaff',
        select: 'name staffId role',
        model: 'Staff'
      })
      .sort({ createdAt: -1 });

    // Log the customers to check if assignedStaff is properly populated
    console.log('Fetched customers with assigned staff:', 
      customers.map(c => ({
        id: c._id,
        name: c.name,
        assignedStaff: c.assignedStaff ? {
          id: c.assignedStaff._id,
          name: c.assignedStaff.name,
          staffId: c.assignedStaff.staffId,
          role: c.assignedStaff.role
        } : null
      }))
    );

    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
});

// Get a single customer
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.connection.readyState) {
      return res.status(500).json({ message: 'Database connection not established' });
    }

    const customer = await Customer.findById(req.params.id)
      .populate('assignedStaff', 'name staffId role');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Error fetching customer', error: error.message });
  }
});

// Create a new customer
router.post('/', async (req, res) => {
  try {
    if (!mongoose.connection.readyState) {
      return res.status(500).json({ message: 'Database connection not established' });
    }

    const { name, email, phone, address, assignedStaff } = req.body;

    // If no staff is assigned, randomly assign a salesperson
    let staffId = assignedStaff;
    if (!staffId) {
      console.log('No staff assigned, finding a random Salesperson...');
      const availableStaff = await Staff.find({ 
        role: 'Salesperson',
        isActive: true 
      });
      
      if (availableStaff.length === 0) {
        return res.status(400).json({ message: 'No available Salesperson found for assignment' });
      }
      
      const randomIndex = Math.floor(Math.random() * availableStaff.length);
      staffId = availableStaff[randomIndex]._id;
      console.log(`Randomly assigned Salesperson: ${availableStaff[randomIndex].name} (${staffId})`);
    } else {
      // Verify that the assigned staff is a salesperson
      const staff = await Staff.findById(staffId);
      if (!staff || staff.role !== 'Salesperson') {
        return res.status(400).json({ message: 'Only Salesperson role members can be assigned to customers' });
      }
    }

    const customer = new Customer({
      name,
      email,
      phone,
      address,
      assignedStaff: staffId
    });

    await customer.save();
    
    // Ensure we return the populated customer data
    const populatedCustomer = await Customer.findById(customer._id)
      .populate('assignedStaff', 'name staffId role');

    res.status(201).json(populatedCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Error creating customer', error: error.message });
  }
});

// Update a customer
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.connection.readyState) {
      return res.status(500).json({ message: 'Database connection not established' });
    }

    const { name, email, phone, address, assignedStaff } = req.body;

    // If no staff is assigned, randomly assign a salesperson
    let staffId = assignedStaff;
    if (!staffId) {
      console.log('No staff assigned, finding a random Salesperson...');
      const availableStaff = await Staff.find({ 
        role: 'Salesperson',
        isActive: true 
      });
      
      if (availableStaff.length === 0) {
        return res.status(400).json({ message: 'No available Salesperson found for assignment' });
      }
      
      const randomIndex = Math.floor(Math.random() * availableStaff.length);
      staffId = availableStaff[randomIndex]._id;
      console.log(`Randomly assigned Salesperson: ${availableStaff[randomIndex].name} (${staffId})`);
    } else {
      // Verify that the assigned staff is a salesperson
      const staff = await Staff.findById(staffId);
      if (!staff || staff.role !== 'Salesperson') {
        return res.status(400).json({ message: 'Only Salesperson role members can be assigned to customers' });
      }
    }

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address, assignedStaff: staffId },
      { new: true }
    ).populate('assignedStaff', 'name staffId role');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ message: 'Error updating customer', error: error.message });
  }
});

// Delete a customer
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.connection.readyState) {
      return res.status(500).json({ message: 'Database connection not established' });
    }

    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Error deleting customer', error: error.message });
  }
});

// Get available salespersons for assignment
router.get('/available-salespersons', async (req, res) => {
  try {
    if (!mongoose.connection.readyState) {
      return res.status(500).json({ message: 'Database connection not established' });
    }

    const salespersons = await Staff.find({ 
      role: 'Salesperson',
      isActive: true 
    }).select('name staffId role');

    res.json(salespersons);
  } catch (error) {
    console.error('Error fetching available Salespersons:', error);
    res.status(500).json({ message: 'Error fetching available Salespersons', error: error.message });
  }
});

module.exports = router; 