const mongoose = require('mongoose');
const { MONGO_URI } = require('./config');

const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
