const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "Demoanvändare",
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  personalNumber: {
    type: String,
    default: "YYYYMMDD-XXXX",
    trim: true
  },

  language: {
    type: String,
    enum: ["sv", "en"],
    default: "sv"
  },

  currency: {
    type: String,
    enum: ["SEK", "EUR"],
    default: "SEK"
  },

  password: {
    type: String,
    required: true
  },

  isAdmin: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
