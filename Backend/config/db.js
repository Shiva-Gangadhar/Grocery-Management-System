const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    if (!config.mongoURI) {
      throw new Error('MongoDB URI is not defined in configuration');
    }

    // Configure mongoose
    mongoose.set('strictQuery', false);
    
    // Add connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      retryWrites: true,
      w: 'majority'
    };

    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', config.mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')); // Hide credentials
    
    // Try to connect to MongoDB
    let conn;
    try {
      conn = await mongoose.connect(config.mongoURI, options);
      console.log('Connected to MongoDB');
    } catch (connectionError) {
      console.error('Initial MongoDB connection error:', connectionError);
      
      // If connection fails, try to connect to a local MongoDB instance
      if (config.mongoURI.includes('mongodb+srv://')) {
        console.log('Trying to connect to local MongoDB instead...');
        const localUri = 'mongodb://localhost:27017/Kirana';
        conn = await mongoose.connect(localUri, options);
        console.log('Connected to local MongoDB');
      } else {
        throw connectionError;
      }
    }

    // Get all collections
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Available collections:', collections.map(c => c.name));

      // Check if required collections exist, create if they don't
      const requiredCollections = ['Inventory', 'Order', 'Staff', 'Customer'];
      
      for (const collectionName of requiredCollections) {
        const collectionExists = collections.some(c => c.name === collectionName);
        if (!collectionExists) {
          console.log(`Creating ${collectionName} collection...`);
          await mongoose.connection.db.createCollection(collectionName);
          console.log(`${collectionName} collection created`);
        } else {
          console.log(`${collectionName} collection already exists`);
        }
      }
    } catch (collectionError) {
      console.error('Error checking/creating collections:', collectionError);
      // Continue execution even if collection check fails
    }

    // Handle connection errors
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Don't exit the process, let the application handle the error
    throw error;
  }
};

module.exports = connectDB;