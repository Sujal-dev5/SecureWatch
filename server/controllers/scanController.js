const mongoose = require("mongoose");

const Scan = require("../models/scan");
const ScanFinding = require("../models/scanFinding");
const Website = require("../models/website");

const {
    runScan
} = require("../services/scan/scanService");

const {
    stopSpider,
    stopActiveScan,
} = require("../services/zap/zapService");


// --------------------------------------------------
// Start Scan
// --------------------------------------------------

const startScan = async (req, res) => {

    try {

        const {
            websiteId
        } = req.body;


        // ----------------------------------------------
        // Validate Website ID
        // ----------------------------------------------

        if (!websiteId) {

            return res.status(400).json({
                message:
                    "Website ID is required",
            });

        }


        if (
            !mongoose.Types.ObjectId.isValid(
                websiteId
            )
        ) {

            return res.status(400).json({
                message:
                    "Invalid website ID",
            });

        }


        // ----------------------------------------------
        // Find user's website
        // ----------------------------------------------

        const website =
            await Website.findOne({
                _id: websiteId,
                userId: req.userId,
            });


        if (!website) {

            return res.status(404).json({
                message:
                    "Website not found",
            });

        }


        // ----------------------------------------------
        // Prevent multiple active scans
        // ----------------------------------------------

        const existingScan =
            await Scan.findOne({

                userId:
                    req.userId,

                websiteId:
                    website._id,

                status: {
                    $in: [
                        "pending",
                        "running",
                    ],
                },

            });


        if (existingScan) {

            return res.status(409).json({

                message:
                    "A scan is already running for this website",

                scanId:
                    existingScan._id,

            });

        }


        // ----------------------------------------------
        // Create Scan
        // ----------------------------------------------

        const scan =
            await Scan.create({

                userId:
                    req.userId,

                websiteId:
                    website._id,

                status:
                    "pending",

                progress:
                    0,

            });


        // ----------------------------------------------
        // Start scan in background
        // ----------------------------------------------

        runScan(
            scan._id
        );


        // ----------------------------------------------
        // Return immediately
        // ----------------------------------------------

        return res.status(202).json({

            message:
                "Scan started",

            scanId:
                scan._id,

        });

    } catch (error) {

        console.error(
            "Create scan error:",
            error
        );

        return res.status(500).json({

            message:
                "Failed to start scan",

        });

    }
};


// --------------------------------------------------
// Terminate Scan
// --------------------------------------------------

const terminateScan = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;


        console.log(
            "\n========== TERMINATE REQUEST =========="
        );

        console.log(
            "SecureWatch Scan ID:",
            id
        );

        console.log(
            "User ID:",
            req.userId
        );


        // ----------------------------------------------
        // Validate ID
        // ----------------------------------------------

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {

            return res.status(400).json({
                message:
                    "Invalid scan ID",
            });

        }


        // ----------------------------------------------
        // Find user's scan
        // ----------------------------------------------

        const scan =
            await Scan.findOne({

                _id: id,

                userId:
                    req.userId,

            });


        if (!scan) {

            console.log(
                "Scan not found"
            );

            return res.status(404).json({

                message:
                    "Scan not found",

            });

        }


        console.log(
            "Scan status:",
            scan.status
        );

        console.log(
            "ZAP Spider ID:",
            scan.zapSpiderId
        );

        console.log(
            "ZAP Active Scan ID:",
            scan.zapActiveScanId
        );


        // ----------------------------------------------
        // Check status
        // ----------------------------------------------

        if (
            scan.status !== "pending" &&
            scan.status !== "running"
        ) {

            return res.status(400).json({

                message:
                    `Cannot terminate a ${scan.status} scan`,

            });

        }


        // ----------------------------------------------
        // Mark SecureWatch scan as cancelled
        // ----------------------------------------------

        await Scan.findByIdAndUpdate(
            id,
            {
                status:
                    "cancelled",

                completedAt:
                    new Date(),
            }
        );


        console.log(
            "SecureWatch scan marked as CANCELLED"
        );


        // ----------------------------------------------
        // Stop ZAP Spider
        // ----------------------------------------------

        if (
            scan.zapSpiderId
        ) {

            console.log(
                `Sending STOP request to ZAP Spider ID: ${scan.zapSpiderId}`
            );


            try {

                const result =
                    await stopSpider(
                        scan.zapSpiderId
                    );


                console.log(
                    "ZAP Spider stop response:",
                    result
                );

            } catch (error) {

                console.error(
                    "ZAP Spider stop failed:",
                    error.response?.data ||
                    error.message
                );

            }

        }


        // ----------------------------------------------
        // Stop ZAP Active Scan
        // ----------------------------------------------

        if (
            scan.zapActiveScanId
        ) {

            console.log(
                `Sending STOP request to ZAP Active Scan ID: ${scan.zapActiveScanId}`
            );


            try {

                const result =
                    await stopActiveScan(
                        scan.zapActiveScanId
                    );


                console.log(
                    "ZAP Active Scan stop response:",
                    result
                );

            } catch (error) {

                console.error(
                    "ZAP Active Scan stop failed:",
                    error.response?.data ||
                    error.message
                );

            }

        }


        console.log(
            "========== TERMINATE COMPLETE ==========\n"
        );


        return res.status(200).json({

            message:
                "Scan terminated successfully",

            scanId:
                scan._id,

        });

    } catch (error) {

        console.error(
            "Terminate scan error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to terminate scan",

        });

    }
};


// --------------------------------------------------
// Get One Scan
// --------------------------------------------------
//
// IMPORTANT:
// Findings are no longer returned here.
//
// This endpoint now returns only scan metadata.
// Findings are retrieved through:
// GET /scans/:id/findings
//
// This prevents large scans from sending thousands
// of findings to the browser at once.
// --------------------------------------------------

const getScan = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;


        // ----------------------------------------------
        // Validate Scan ID
        // ----------------------------------------------

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {

            return res.status(400).json({

                message:
                    "Invalid scan ID",

            });

        }


        // ----------------------------------------------
        // Find user's scan
        // ----------------------------------------------

        const scan =
            await Scan.findOne({

                _id:
                    id,

                userId:
                    req.userId,

            })
            .populate(
                "websiteId",
                "name url"
            )
            .lean();


        if (!scan) {

            return res.status(404).json({

                message:
                    "Scan not found",

            });

        }


        // ----------------------------------------------
        // Return scan metadata only
        // ----------------------------------------------

        return res.status(200).json({

            scan,

        });

    } catch (error) {

        console.error(
            "Get scan error:",
            error
        );


        return res.status(500).json({

            message:
                "Server error",

        });

    }
};


// --------------------------------------------------
// Get Scan Findings
// --------------------------------------------------
//
// Paginated retrieval of ScanFinding documents.
//
// Example:
// /api/scans/:id/findings?page=1&limit=50
// --------------------------------------------------

const getScanFindings = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;


        // ----------------------------------------------
        // Validate Scan ID
        // ----------------------------------------------

        if (
            !mongoose.Types.ObjectId.isValid(
                id
            )
        ) {

            return res.status(400).json({

                message:
                    "Invalid scan ID",

            });

        }


        // ----------------------------------------------
        // Verify scan ownership
        // ----------------------------------------------

        const scan =
            await Scan.findOne({

                _id:
                    id,

                userId:
                    req.userId,

            })
            .select(
                "_id vulnerabilities"
            )
            .lean();


        if (!scan) {

            return res.status(404).json({

                message:
                    "Scan not found",

            });

        }


        // ----------------------------------------------
        // Pagination
        // ----------------------------------------------

        const page =
            Math.max(
                parseInt(
                    req.query.page
                ) || 1,
                1
            );


        const limit =
            Math.min(
                Math.max(
                    parseInt(
                        req.query.limit
                    ) || 50,
                    1
                ),
                100
            );


        const skip =
            (page - 1) * limit;


        // ----------------------------------------------
        // Query
        // ----------------------------------------------

        const query = {

            scanId:
                scan._id,

            userId:
                req.userId,

        };


        // ----------------------------------------------
        // Get total finding count
        // ----------------------------------------------

        const total =
            await ScanFinding.countDocuments(
                query
            );


        // ----------------------------------------------
        // Get requested page
        // ----------------------------------------------

        const findings =
            await ScanFinding.find(
                query
            )
            .select(
                [
                    "title",
                    "severity",
                    "confidence",
                    "url",
                    "method",
                    "parameter",
                    "description",
                    "evidence",
                    "solution",
                    "reference",
                    "pluginId",
                    "occurrences",
                    "createdAt",
                ].join(" ")
            )
            .sort({
                createdAt:
                    1,
            })
            .skip(skip)
            .limit(limit)
            .lean();


        // ----------------------------------------------
        // Pagination information
        // ----------------------------------------------

        const totalPages =
            Math.ceil(
                total / limit
            );


        // ----------------------------------------------
        // Return response
        // ----------------------------------------------

        return res.status(200).json({

            findings,

            pagination: {

                page,

                limit,

                total,

                totalPages,

                hasNextPage:
                    page <
                    totalPages,

                hasPreviousPage:
                    page > 1,

            },

        });

    } catch (error) {

        console.error(
            "Get scan findings error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to load scan findings",

        });

    }
};


// --------------------------------------------------
// Get User's Scans
// --------------------------------------------------

const getScans = async (
    req,
    res
) => {

    try {

        // ----------------------------------------------
        // Optional limit
        // ----------------------------------------------

        const requestedLimit =
            parseInt(req.query.limit);

        const limit =
            requestedLimit > 0
                ? Math.min(requestedLimit, 50)
                : null;


        // ----------------------------------------------
        // Get user's scans
        // Only return fields required by scan lists
        // ----------------------------------------------

        let query =
            Scan.find({
                userId:
                    req.userId,
            })
            .select(
                 "websiteId status vulnerabilities severityCounts healthScore healthStatus progress startedAt completedAt createdAt errorMessage"
            )
            .populate(
                "websiteId",
                "name url"
            )
            .sort({
                createdAt:
                    -1,
            });


        // ----------------------------------------------
        // Apply limit when requested
        // ----------------------------------------------

        if (limit) {

            query =
                query.limit(limit);

        }


        // ----------------------------------------------
        // Execute query
        // ----------------------------------------------

        const scans =
            await query.lean();


        // ----------------------------------------------
        // Return response
        // ----------------------------------------------

        return res.status(200).json({

            scans,

        });

    } catch (error) {

        console.error(
            "Get scans error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to load scans",

        });

    }
};


// --------------------------------------------------
// Get Scan History
// --------------------------------------------------

const getScanHistory = async (
    req,
    res
) => {

    try {

        // ----------------------------------------------
        // Pagination
        // ----------------------------------------------

        const page =
            Math.max(
                parseInt(req.query.page) || 1,
                1
            );

        const limit =
            Math.min(
                Math.max(
                    parseInt(req.query.limit) || 10,
                    1
                ),
                50
            );

        const skip =
            (page - 1) * limit;


        // ----------------------------------------------
        // Find user's scans
        // ----------------------------------------------

        const query = {
            userId:
                req.userId,
        };


        // ----------------------------------------------
        // Get total scan count
        // ----------------------------------------------

        const total =
            await Scan.countDocuments(
                query
            );


        // ----------------------------------------------
        // Get scan history
        // ----------------------------------------------

        const scans =
            await Scan.find(query)
                .populate(
                    "websiteId",
                    "name url"
                )
                .sort({
                    createdAt:
                        -1,
                })
                .skip(skip)
                .limit(limit);


        // ----------------------------------------------
        // Return response
        // ----------------------------------------------

        return res.status(200).json({

            scans,

            pagination: {

                page,

                limit,

                total,

                totalPages:
                    Math.ceil(
                        total / limit
                    ),

                hasNextPage:
                    page <
                    Math.ceil(
                        total / limit
                    ),

                hasPreviousPage:
                    page > 1,

            },

        });

    } catch (error) {

        console.error(
            "Get scan history error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to load scan history",

        });

    }
};


// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {

    startScan,
    getScans,
    getScan,
    getScanFindings,
    getScanHistory,
    terminateScan,

};