const express = require("express");
const {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaignStats,
  sendCampaignEmail,
} = require("../controllers/campaignController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create campaign
router.post("/", protect, createCampaign);

// Get all campaigns for logged-in user
router.get("/", protect, getCampaigns);

// Send campaign email to one or many recipients
router.post("/:id/send-email", protect, sendCampaignEmail);

// Get one campaign details
router.get("/:id", protect, getCampaignById);

// Update campaign statistics
router.put("/:id", protect, updateCampaignStats);

module.exports = router;