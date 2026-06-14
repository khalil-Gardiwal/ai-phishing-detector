const express = require("express");
const router = express.Router();

const {
  testAI,
  analyzeEmailAI,
} = require("../controllers/aiController");

router.get("/test", testAI);
router.post("/analyze-email", analyzeEmailAI);

module.exports = router;