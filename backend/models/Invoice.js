const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  amount: {
    type: Number,
    required: true,
    min: 0
  },

  paid: {
    type: Boolean,
    default: false
  },

  paidAt: {
    type: Date,
    default: null
  },

  paymentHistory: [
    {
      paidAt: {
        type: Date,
        default: Date.now
      },
      amount: {
        type: Number,
        default: 0
      }
    }
  ],

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },

  monthlyPayment: {
    type: Number,
    default: 0,
    min: 0
  },

  deadline: {
    type: Date,
    default: null
  },

  userId: {
    type: String,
    index: true,
    default: null
  },

  requestedMoreTime: {
    type: Boolean,
    default: false
  },

  timeApproved: {
    type: Boolean,
    default: false
  },

  timeStatus: {
    type: String,
    enum: ["approved", "rejected"],
    default: null
  }

}, {
  timestamps: true
});

module.exports = mongoose.model("Invoice", invoiceSchema);