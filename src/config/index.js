const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/gdgoc_recruitment',
  jwtSecret: process.env.JWT_SECRET || 'gdgoc_vjit_fallback_secret_key_2025',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  defaultAdminCode: process.env.DEFAULT_ADMIN_ACCESS_CODE || 'NEXUS-815',
  clientOrigin: process.env.CLIENT_ORIGIN || '*'
};
