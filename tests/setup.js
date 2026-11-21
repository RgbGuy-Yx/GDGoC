const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const setupDB = () => {
  beforeAll(async () => {
    // If local MongoDB is actively listening on port 27017, connect directly
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/gdgoc_test', {
        serverSelectionTimeoutMS: 1500
      });
      return;
    } catch (e) {
      // Otherwise spin up MongoMemoryServer
    }

    mongoServer = await MongoMemoryServer.create({
      instance: {
        launchTimeout: 120000
      }
    });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  }, 120000);

  afterEach(async () => {
    if (mongoose.connection.readyState === 1) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });
};

module.exports = {
  setupDB
};
