const express = require("express");
const {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaignStats,
  deleteCampaign,
  sendCampaignEmail,
  trackCampaignClick,
} = require("../controllers/campaignController");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Public tracking route with unique recipient token
router.get("/track-click/:id/:token", trackCampaignClick);

// Admin-only campaign routes
router.post("/", protect, adminOnly, createCampaign);
router.get("/", protect, adminOnly, getCampaigns);
router.post("/:id/send-email", protect, adminOnly, sendCampaignEmail);
router.get("/:id", protect, adminOnly, getCampaignById);
router.put("/:id", protect, adminOnly, updateCampaignStats);
router.delete("/:id", protect, adminOnly, deleteCampaign);

module.exports = router;