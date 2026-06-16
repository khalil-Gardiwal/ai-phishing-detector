const express = require("express");
const {
  createCampaign,
  getCampaigns,
} = require("../controllers/campaignController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createCampaign);
router.get("/", protect, getCampaigns);

module.exports = router;