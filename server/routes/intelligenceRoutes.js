const express = require("express");

const router = express.Router();

const {
    getIntelligence
} = require("../controllers/intelligenceController");

const protect =
    require("../middleware/authMiddleware");


router.get(
    "/scans/:scanId/intelligence",
    protect,
    getIntelligence
);


module.exports = router;