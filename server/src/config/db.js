const mongoose = require('mongoose');

let mongodInstance = null;

async function connectDB() {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || mongoUri.trim() === '') {
      console.log('⚡ No MONGODB_URI provided in environment. Starting embedded MongoDB Memory Server for seamless dev/testing...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      mongoUri = mongodInstance.getUri();
      console.log(`📦 Embedded MongoDB started at: ${mongoUri}`);
    }

    await mongoose.connect(mongoUri);
    console.log(`✅ Connected to MongoDB successfully at ${mongoUri.split('@')[1] || mongoUri}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

async function closeDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongodInstance) {
    await mongodInstance.stop();
  }
}

module.exports = { connectDB, closeDB };
