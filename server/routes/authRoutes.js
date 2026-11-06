const express = require("express");

const {
    authRateLimiter,
} = require("../middleware/rateLimiter");

const {
    registerUser,
    loginUser
} = require("../controllers/authController");

const router = express.Router();

router.post(
    "/register",
    authRateLimiter,
    registerUser
);

router.post(
    "/login",
    authRateLimiter,
    loginUser
);

module.exports = router;