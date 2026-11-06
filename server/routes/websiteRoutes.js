const express = require("express");
const websiteRateLimiter = require("../middleware/rateLimiter");

const protect = require("../middleware/authMiddleware");

const {
  addWebsite,
  getWebsites,
  getWebsite,
  deleteWebsite,
} = require("../controllers/websiteController");

const router = express.Router();
router.post("/", protect, websiteRateLimiter, addWebsite);

router.get("/", protect, websiteRateLimiter, getWebsites);

router.get("/:id", protect, websiteRateLimiter, getWebsite);

router.delete("/:id", protect, websiteRateLimiter, deleteWebsite);

module.exports = router;
