const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    scanRateLimiter,
} = require("../middleware/rateLimiter");

const {
    startScan,
    getScans,
    getScan,
    getScanFindings,
    getScanHistory,
    terminateScan,
} = require("../controllers/scanController");

const {
    generateReport,
} = require("../controllers/reportController");

const {
    reportRateLimiter,
} = require("../middleware/rateLimiter");

const router = express.Router();


// --------------------------------------------------
// Start Scan
// --------------------------------------------------

router.post(
    "/",
    protect,
    scanRateLimiter,
    startScan
);

// --------------------------------------------------
// Get User Scans
// --------------------------------------------------

router.get(
    "/",
    protect,
    getScans
);


// --------------------------------------------------
// Terminate Scan
// --------------------------------------------------

router.post(
    "/:id/terminate",
    protect,
    terminateScan
);


// --------------------------------------------------
// Get Scan History
// --------------------------------------------------

router.get(
    "/history",
    protect,
    getScanHistory
);


// --------------------------------------------------
// Get Paginated Scan Findings
// --------------------------------------------------
//
// Example:
// GET /api/scans/:id/findings?page=1&limit=50
//

router.get(
    "/:id/findings",
    protect,
    getScanFindings
);

// --------------------------------------------------
// Generate Security Report
// --------------------------------------------------

router.get(
    "/:id/report",
    protect,
    reportRateLimiter,
    generateReport
);

// --------------------------------------------------
// Get One Scan
// --------------------------------------------------

router.get(
    "/:id",
    protect,
    getScan
);


module.exports = router;