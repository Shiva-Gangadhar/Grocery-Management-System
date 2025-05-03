require('dotenv').config();

const config = {
  // Server settings
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB connection
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://ShivaGangadhar:******.nwwyhvv.mongodb.net/Kirana?retryWrites=true&w=majority&appName=Cluster0',
  
  // JWT settings
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiration: '24h',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // API settings
  apiPrefix: '/api',
  
  // CORS settings
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  // Pagination defaults
  pagination: {
    defaultLimit: 10,
    maxLimit: 100
  }
};

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`Warning: Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

module.exports = config; 
