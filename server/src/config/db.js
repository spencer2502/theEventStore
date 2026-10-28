const mongoose = require('mongoose');

async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || mongoUri.trim() === '') {
      throw new Error('MONGODB_URI is not set in environment variables. Please check your .env or hosting environment variables.');
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
}

module.exports = { connectDB, closeDB };
