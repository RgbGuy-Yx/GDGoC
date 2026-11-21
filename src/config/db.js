const dns = require('dns');
const mongoose = require('mongoose');
const config = require('./index');

// Ensure reliable DNS resolution for MongoDB Atlas SRV records on Windows
if (dns && typeof dns.setServers === 'function') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (err) {
    // Ignore fallback
  }
}

const connectDB = async (customUri) => {
  const uri = customUri || config.mongoUri;
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error (${uri}): ${error.message}`);
    console.log('--------------------------------------------------------------------------------');
    console.log('💡 TIP: Check your network connection or verify your MongoDB Atlas credentials:');
    console.log('   Ensure IP address is whitelisted (0.0.0.0/0) in MongoDB Atlas Network Access.');
    console.log('--------------------------------------------------------------------------------');
    if (config.nodeEnv !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[MongoDB] Connection closed.');
  } catch (error) {
    console.error(`[MongoDB] Error disconnecting: ${error.message}`);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
