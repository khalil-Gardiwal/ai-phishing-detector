const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    campaignName: {
      type: String,
      required: true,
      trim: true,
    },

    targetGroup: {
      type: String,
      required: true,
      trim: true,
    },

    fakeEmailSubject: {
      type: String,
      required: true,
      trim: true,
    },

    fakeEmailContent: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Draft", "Active", "Completed"],
      default: "Draft",
    },

    totalTargets: {
      type: Number,
      default: 0,
    },

    openedCount: {
      type: Number,
      default: 0,
    },

    clickedCount: {
      type: Number,
      default: 0,
    },

    ignoredCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Campaign", campaignSchema);