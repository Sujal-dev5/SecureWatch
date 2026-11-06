const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  aiRateLimiter,
} = require("../middleware/rateLimiter");

const {
  getAISecurityAnalysis,
  analyzeVulnerabilityWithAI,
} = require("../controllers/aiController");

const router =
  express.Router();

/*
 * ==========================================================
 * Whole-Scan AI Security Analysis
 * ==========================================================
 *
 * Existing endpoint.
 * DO NOT change its behavior.
 */
router.get(
  "/scans/:scanId",
  protect,
  aiRateLimiter,
  getAISecurityAnalysis
);

/*
 * ==========================================================
 * Individual Vulnerability AI Analysis
 * ==========================================================
 *
 * New endpoint used by:
 *
 * ✨ Analyze with AI
 *
 * in the vulnerability detail panel.
 */
router.post(
  "/vulnerabilities/analyze",
  protect,
  aiRateLimiter,
  analyzeVulnerabilityWithAI
);

module.exports = router;