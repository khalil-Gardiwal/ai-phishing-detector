const express = require("express");
const {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaignStats,
  sendCampaignEmail,
  trackCampaignOpen,
  trackCampaignClick,
} = require("../controllers/campaignController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Public tracking routes
router.get("/track-open/:id", trackCampaignOpen);
router.get("/track-click/:id", trackCampaignClick);

// Protected campaign routes
router.post("/", protect, createCampaign);
router.get("/", protect, getCampaigns);
router.post("/:id/send-email", protect, sendCampaignEmail);
router.get("/:id", protect, getCampaignById);
router.put("/:id", protect, updateCampaignStats);

module.exports = router;