const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  analyzeEmail,
  analyzeUrl,
  getScanHistory,
} = require("../controllers/phishingController");

router.post("/analyze-email", protect, analyzeEmail);

router.post("/analyze-url", protect, analyzeUrl);

router.get("/history", protect, getScanHistory);

module.exports = router;