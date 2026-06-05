const express = require("express");
const router = express.Router();

const {
  analyzeEmail,
  analyzeUrl,
} = require("../controllers/phishingController");

router.post("/analyze-email", analyzeEmail);
router.post("/analyze-url", analyzeUrl);

module.exports = router;