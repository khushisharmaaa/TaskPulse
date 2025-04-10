const mongoose = require('mongoose');
require('dotenv').config();
  
const connectDB = async () => {
  try {
    const dbURL = process.env.ATLASDB_URL;
    await mongoose.connect( dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
