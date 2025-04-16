const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Supplier = require('../models/Supplier');

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    console.log('Fetching suppliers...');
    
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
    
    const suppliers = await Supplier.find({ isActive: true })
      .sort({ name: 1 });
    
    console.log(`Found ${suppliers.length} suppliers`);
    
    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching suppliers'
    });
  }
});

// Get a single supplier
router.get('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching supplier'
    });
  }
});

// Create a new supplier
router.post('/', async (req, res) => {
  try {
    console.log('Creating new supplier with data:', req.body);
    
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
    
    const supplier = await Supplier.create(req.body);
    
    console.log('Successfully created supplier:', supplier);
    
    res.status(201).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    
    // Provide more detailed error messages
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating supplier',
      error: error.message
    });
  }
});

// Update a supplier
router.put('/:id', async (req, res) => {
  try {
    console.log(`Updating supplier ${req.params.id} with data:`, req.body);
    
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
    
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true,
        runValidators: true
      }
    );
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    console.log('Successfully updated supplier:', supplier);
    
    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    
    // Provide more detailed error messages
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating supplier',
      error: error.message
    });
  }
});

// Delete a supplier (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting supplier'
    });
  }
});

module.exports = router; 