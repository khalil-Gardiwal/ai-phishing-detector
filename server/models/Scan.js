const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      required: true,
    },

    riskScore: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Scan", scanSchema);