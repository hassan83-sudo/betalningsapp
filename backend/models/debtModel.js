const mongoose = require("mongoose");

const debtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paid: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Debt", debtSchema);