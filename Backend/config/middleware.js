const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');

// CORS options
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Setup middleware
const setupMiddleware = (app) => {
  // Security middleware
  app.use(helmet());
  
  // CORS
  app.use(cors(corsOptions));
  
  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Logging
  app.use(morgan('dev'));
  
  // Rate limiting
  app.use(limiter);
  
  // Static files
  app.use(express.static('public'));
  
  return app;
};

module.exports = setupMiddleware; 