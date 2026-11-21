const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();

// Enable Cross-Origin Resource Sharing with production origin configuration
const corsOptions = {
  origin: config.clientOrigin === '*' ? '*' : config.clientOrigin.split(',').map((o) => o.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Parse incoming JSON and URL-encoded payloads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const path = require('path');
const fs = require('fs');

// Base API routes (mounted under /api and root fallback for client resilience)
app.use('/api', routes);
app.use('/', routes);

// Serve built frontend assets if present
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Root greeting & status
  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'Welcome to GDGoC VJIT Recruitment Management System API',
      version: '1.0.0',
      documentation: '/api/health'
    });
  });
}

// Centralized 404 handler
app.use(notFoundHandler);

// Centralized Error handler
app.use(errorHandler);

module.exports = app;
