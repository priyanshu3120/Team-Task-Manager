const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = (process.env.MONGO_URI || '').trim().replace(/^["']+|["']+$/g, '');
    if (!uri) {
      throw new Error('MONGO_URI environment variable is not set');
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
