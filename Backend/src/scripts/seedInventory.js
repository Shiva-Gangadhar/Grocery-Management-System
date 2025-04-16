require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
const config = require('../../config/config');

const inventoryItems = [
  {
    name: 'Rice',
    category: 'Groceries',
    quantity: 100,
    unit: 'kg',
    price: 60,
    minimumStock: 20,
    supplier: {
      name: 'ABC Suppliers',
      contact: '1234567890',
      email: 'abc@suppliers.com'
    },
    description: 'Premium quality rice'
  },
  {
    name: 'Sugar',
    category: 'Groceries',
    quantity: 50,
    unit: 'kg',
    price: 45,
    minimumStock: 10,
    supplier: {
      name: 'XYZ Suppliers',
      contact: '9876543210',
      email: 'xyz@suppliers.com'
    },
    description: 'Refined sugar'
  },
  {
    name: 'Cooking Oil',
    category: 'Groceries',
    quantity: 30,
    unit: 'l',
    price: 180,
    minimumStock: 15,
    supplier: {
      name: 'Oil Suppliers',
      contact: '5555555555',
      email: 'oil@suppliers.com'
    },
    description: 'Pure vegetable oil'
  },
  {
    name: 'Salt',
    category: 'Groceries',
    quantity: 20,
    unit: 'kg',
    price: 20,
    minimumStock: 10,
    supplier: {
      name: 'Salt Suppliers',
      contact: '4444444444',
      email: 'salt@suppliers.com'
    },
    description: 'Iodized salt'
  },
  {
    name: 'Tea',
    category: 'Beverages',
    quantity: 15,
    unit: 'kg',
    price: 300,
    minimumStock: 8,
    supplier: {
      name: 'Tea Suppliers',
      contact: '3333333333',
      email: 'tea@suppliers.com'
    },
    description: 'Premium tea leaves'
  }
];

const seedInventory = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing inventory
    await Inventory.deleteMany({});
    console.log('Cleared existing inventory');

    // Insert new inventory
    const result = await Inventory.insertMany(inventoryItems);
    console.log(`Successfully inserted ${result.length} inventory items`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding inventory:', error);
    process.exit(1);
  }
};

seedInventory(); 