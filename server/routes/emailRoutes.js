const express = require("express");
const { sendCampaignEmail } = require("../controllers/emailController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/send-campaign", protect, sendCampaignEmail);

module.exports = router;