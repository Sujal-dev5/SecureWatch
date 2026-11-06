const rateLimit = require("express-rate-limit");


// --------------------------------------------------
// Rate Limiter Factory
// --------------------------------------------------

const createRateLimiter = (
    windowMs,
    max
) =>
    rateLimit({
        windowMs,
        max,

        message: {
            message:
                "Too many requests, please try again later.",
        },

        standardHeaders: true,
        legacyHeaders: false,
    });


// --------------------------------------------------
// Configuration
// --------------------------------------------------
//
// Environment variables allow production limits
// to be changed without modifying application code.
//
// Defaults are used when variables are not set.
//

const RATE_LIMIT_WINDOW_MINUTES =
    Number(
        process.env.RATE_LIMIT_WINDOW_MINUTES || 15
    );

const RATE_LIMIT_WINDOW_MS =
    RATE_LIMIT_WINDOW_MINUTES *
    60 *
    1000;


// General website/API operations
const WEBSITE_RATE_LIMIT =
    Number(
        process.env.WEBSITE_RATE_LIMIT || 100
    );


// Authentication
const AUTH_RATE_LIMIT =
    Number(
        process.env.AUTH_RATE_LIMIT || 10
    );


// Starting vulnerability scans
const SCAN_RATE_LIMIT =
    Number(
        process.env.SCAN_RATE_LIMIT || 5
    );


// AI security analysis
const AI_RATE_LIMIT =
    Number(
        process.env.AI_RATE_LIMIT || 10
    );


// PDF report generation
const REPORT_RATE_LIMIT =
    Number(
        process.env.REPORT_RATE_LIMIT || 10
    );


// --------------------------------------------------
// Rate Limiters
// --------------------------------------------------


// General website/API operations
const websiteRateLimiter =
    createRateLimiter(
        RATE_LIMIT_WINDOW_MS,
        WEBSITE_RATE_LIMIT
    );


// Authentication
const authRateLimiter =
    createRateLimiter(
        RATE_LIMIT_WINDOW_MS,
        AUTH_RATE_LIMIT
    );


// Starting vulnerability scans
const scanRateLimiter =
    createRateLimiter(
        RATE_LIMIT_WINDOW_MS,
        SCAN_RATE_LIMIT
    );


// AI security analysis
const aiRateLimiter =
    createRateLimiter(
        RATE_LIMIT_WINDOW_MS,
        AI_RATE_LIMIT
    );


// PDF report generation
const reportRateLimiter =
    createRateLimiter(
        RATE_LIMIT_WINDOW_MS,
        REPORT_RATE_LIMIT
    );


// --------------------------------------------------
// Exports
// --------------------------------------------------

// Keep the existing default export working.
module.exports =
    websiteRateLimiter;


// Make the other limiters available.
module.exports.websiteRateLimiter =
    websiteRateLimiter;

module.exports.authRateLimiter =
    authRateLimiter;

module.exports.scanRateLimiter =
    scanRateLimiter;

module.exports.aiRateLimiter =
    aiRateLimiter;

module.exports.reportRateLimiter =
    reportRateLimiter;