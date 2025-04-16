const express = require('express');
const config = require('./config');

// Import routes
const authRoutes = require('../src/routes/authRoutes');
const inventoryRoutes = require('../src/routes/inventoryRoutes');
const orderRoutes = require('../src/routes/orderRoutes');
const customerRoutes = require('../src/routes/customerRoutes');
const dashboardRoutes = require('../src/routes/dashboardRoutes');
const staffRoutes = require('../src/routes/staffRoutes');
const supplierRoutes = require('../src/routes/supplierRoutes');

// Setup routes
const setupRoutes = (app) => {
  // API routes
  app.use(`${config.apiPrefix}/auth`, authRoutes);
  app.use(`${config.apiPrefix}/inventory`, inventoryRoutes);
  app.use(`${config.apiPrefix}/orders`, orderRoutes);
  app.use(`${config.apiPrefix}/customers`, customerRoutes);
  app.use(`${config.apiPrefix}/dashboard`, dashboardRoutes);
  app.use(`${config.apiPrefix}/staff`, staffRoutes);
  app.use(`${config.apiPrefix}/suppliers`, supplierRoutes);
  
  // Health check route
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
  
  // Error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
      message: config.nodeEnv === 'development' ? err.message : 'Internal server error' 
    });
  });
  
  return app;
};

module.exports = setupRoutes; 