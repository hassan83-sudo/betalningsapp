const mongoose = require("mongoose");

const DEFAULT_MONGODB_URI = "mongodb://127.0.0.1:27017/kronopay";

async function connectDatabase() {
  const mongoUri =
    process.env.MONGODB_URI || process.env.MONGO_URI || DEFAULT_MONGODB_URI;

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}

module.exports = connectDatabase;
