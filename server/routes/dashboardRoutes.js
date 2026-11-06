const express = require("express");

const protect =
    require("../middleware/authMiddleware");

const {
    getDashboardOverview,
    getSecurityTrend,
    getWebsiteSecurity,
} = require("../controllers/dashboardController");


const router =
    express.Router();


router.get(
    "/overview",
    protect,
    getDashboardOverview
);


router.get(
    "/trends/:websiteId",
    protect,
    getSecurityTrend
);

router.get(
    "/websites",
    protect,
    getWebsiteSecurity
);

module.exports = router;