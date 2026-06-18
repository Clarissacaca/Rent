const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

// paksa Node pakai Google DNS, bypass resolver default yang mungkin diblokir
dns.setServers(['8.8.8.8', '1.1.1.1']);

mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      family: 4
    });
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;