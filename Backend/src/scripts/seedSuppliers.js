require('dotenv').config();
const mongoose = require('mongoose');
const Supplier = require('../models/Supplier');
const config = require('../../config/config');

const suppliers = [
  {
    name: 'Karthikeya',
    email: 'msknani07@gmail.com',
    phone: '9788978987',
    branch: 'Venkat nagar',
    address: '',
    isActive: true
  },
  // Add more suppliers as needed
];

const seedSuppliers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing suppliers
    await Supplier.deleteMany({});
    console.log('Cleared existing suppliers');

    // Insert new suppliers
    const result = await Supplier.insertMany(suppliers);
    console.log(`Successfully inserted ${result.length} suppliers`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding suppliers:', error);
    process.exit(1);
  }
};

seedSuppliers(); 