const mongoose = require("mongoose");

const scanSchema = new mongoose.Schema(
  {
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