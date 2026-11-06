const express = require("express");

const protect =
    require("../middleware/authMiddleware");

const {
    getScanResults
} = require("../controllers/scanResultController");

const router = express.Router();

router.get(
    "/:id",
    protect,
    getScanResults
);

module.exports = router;