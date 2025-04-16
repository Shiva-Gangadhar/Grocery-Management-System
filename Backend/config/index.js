const config = require('./config');
const connectDB = require('./db');
const setupMiddleware = require('./middleware');
const setupRoutes = require('./routes');

module.exports = {
  config,
  connectDB,
  setupMiddleware,
  setupRoutes
}; 