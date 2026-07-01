const mongoose = require("mongoose");

const recipientSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
    },
    token: {
      type: String,
      required: true,
    },
    clicked: {
      type: Boolean,
      default: false,
    },
    clickedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

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

    clickedCount: {
      type: Number,
      default: 0,
    },

    notClickedCount: {
      type: Number,
      default: 0,
    },

    recipients: {
      type: [recipientSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Campaign", campaignSchema);