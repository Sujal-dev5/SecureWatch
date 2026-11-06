const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    generateReport,
} = require("../controllers/reportController");

const router = express.Router();


// --------------------------------------------------
// Generate PDF Security Report
// --------------------------------------------------

router.get(
    "/:id/pdf",
    protect,
    generateReport
);


module.exports = router;