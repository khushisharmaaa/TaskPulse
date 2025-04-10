// db.js
const mongoose = require('mongoose');
/*
if(process.env.NODE_ENV != "production"){  // .env file ko hum bas development phase mai use karte hai , production phase mai use nahi karte , mtlb jb hum inn files ko deploy karenge , ya github pr upload karenge , tb .env file ko bilkul upload nahi karna hai , kyuki uske andar hamare important credentials hote hai. 
  require('dotenv').config();             
  } 
  */
 
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
