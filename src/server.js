const app = require('./app');
const config = require('./config');
const { connectDB } = require('./config/db');

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    const PORT = config.port;
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`🚀 GDGoC VJIT Recruitment API running on port ${PORT}`);
      console.log(`   Environment: ${config.nodeEnv}`);
      console.log(`   Healthcheck: http://127.0.0.1:${PORT}/api/health`);
      console.log(`=======================================================`);
    });

    // Graceful shutdown
    const handleShutdown = (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));
  } catch (error) {
    console.error(`[Server] Startup failed: ${error.message}`);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[Process] Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught Exception:', err);
  process.exit(1);
});

if (require.main === module) {
  startServer();
}

module.exports = startServer;
