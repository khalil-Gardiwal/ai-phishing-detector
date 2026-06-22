const express = require("express");
const {
  sendCampaignEmail,
  trackCampaignClick,
} = require("../controllers/emailController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send-campaign", protect, sendCampaignEmail);
router.get("/click/:campaignId", trackCampaignClick);

module.exports = router;