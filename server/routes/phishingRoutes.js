const express = require("express");
const router = express.Router();

const {
  analyzeEmail,
  analyzeUrl,
  getScanHistory,
} = require("../controllers/phishingController");

router.post("/analyze-email", analyzeEmail);
router.post("/analyze-url", analyzeUrl);
router.get("/history", getScanHistory);

module.exports = router;