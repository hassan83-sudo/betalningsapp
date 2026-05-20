const mongoose = require("mongoose");

const debtSchema = new mongoose.Schema(
  {
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
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium"
    },
    monthlyPayment: {
      type: Number,
      default: 0
    },

    // 🔥 LÄGG TILL DENNA
    userId: {
      type: String,
      default: null,
      index: true
    },

    requestedMoreTime: {
      type: Boolean,
      default: false
    },
    timeStatus: {
      type: String,
      default: null
    },
    timeApproved: {
      type: Boolean,
      default: false
    },
    deadline: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Debt", debtSchema);