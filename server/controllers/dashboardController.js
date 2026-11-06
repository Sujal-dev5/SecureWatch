const mongoose = require("mongoose");

const Website = require("../models/website");
const Scan = require("../models/scan");
const Monitoring = require("../models/Monitoring");

const {
    generateHealthTrendData,
} = require("../services/intelligence/healthTrendService");

// --------------------------------------------------
// Dashboard Overview
// --------------------------------------------------

const getDashboardOverview = async (
    req,
    res
) => {

    try {

        // ----------------------------------------------
        // Get total websites
        // ----------------------------------------------

        const totalWebsites =
            await Website.countDocuments({
                userId:
                    req.userId,
            });


        // ----------------------------------------------
        // Get user's completed scans
        // ----------------------------------------------

        // IMPORTANT:
        // We no longer load the large "findings" array.
        // Severity counts are already stored in each Scan.
        const scans =
            await Scan.find({
                userId:
                    req.userId,

                status:
                    "completed",
            })
            .select(
                "severityCounts vulnerabilities completedAt websiteId createdAt"
            )
            .sort({
                createdAt:
                    -1,
            })
            .lean();


        // ----------------------------------------------
        // Total scans
        // ----------------------------------------------

        const totalScans =
            scans.length;


        // ----------------------------------------------
        // Initialize severity counts
        // ----------------------------------------------

        const severityCounts = {

            Critical: 0,

            High: 0,

            Medium: 0,

            Low: 0,

            Informational: 0,

        };


        // ----------------------------------------------
        // Calculate dashboard totals
        // ----------------------------------------------

        let totalVulnerabilities = 0;


        for (
            const scan
            of scans
        ) {

            // ------------------------------------------
            // Total vulnerability occurrences
            // ------------------------------------------

            totalVulnerabilities +=
                scan.vulnerabilities || 0;


            // ------------------------------------------
            // Add stored severity counts
            // ------------------------------------------

            const scanSeverity =
                scan.severityCounts || {};


            severityCounts.Critical +=
                scanSeverity.critical || 0;


            severityCounts.High +=
                scanSeverity.high || 0;


            severityCounts.Medium +=
                scanSeverity.medium || 0;


            severityCounts.Low +=
                scanSeverity.low || 0;


            severityCounts.Informational +=
                scanSeverity.informational || 0;

        }


        // ----------------------------------------------
        // Latest scan
        // ----------------------------------------------

        const latestScan =
            scans[0] || null;


        // ----------------------------------------------
        // Response
        // ----------------------------------------------

        return res.status(200).json({

            totalWebsites,

            totalScans,

            totalVulnerabilities,

            severity: {

                critical:
                    severityCounts.Critical,

                high:
                    severityCounts.High,

                medium:
                    severityCounts.Medium,

                low:
                    severityCounts.Low,

                informational:
                    severityCounts.Informational,

            },

            latestScan: latestScan
                ? {

                    scanId:
                        latestScan._id,

                    websiteId:
                        latestScan.websiteId,

                    vulnerabilities:
                        latestScan.vulnerabilities,

                    completedAt:
                        latestScan.completedAt,

                }
                : null,

        });

    } catch (error) {

        console.error(
            "Get dashboard overview error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to load dashboard overview",

        });

    }
};

// --------------------------------------------------
// Get Security Health Trend
// --------------------------------------------------

const getSecurityTrend = async (
    req,
    res
) => {

    try {

        const {
            websiteId
        } = req.params;


        // ----------------------------------------------
        // Validate website ID
        // ----------------------------------------------

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
        // Verify website ownership
        // ----------------------------------------------

        const website =
            await Website.findOne({

                _id:
                    websiteId,

                userId:
                    req.userId,

            })
            .select(
                "name url"
            )
            .lean();


        if (!website) {

            return res.status(404).json({

                message:
                    "Website not found",

            });

        }


        // ----------------------------------------------
        // Get completed scans
        // ----------------------------------------------

        const scans =
            await Scan.find({

                userId:
                    req.userId,

                websiteId,

                status:
                    "completed",

            })
            .select(
                "findings completedAt"
            )
            .sort({
                completedAt:
                    1,
            })
            .lean();


        // ----------------------------------------------
        // Generate trend data
        // ----------------------------------------------

        const trends =
            scans.map(
                generateHealthTrendData
            );


        // ----------------------------------------------
        // Return response
        // ----------------------------------------------

        return res.status(200).json({

            website: {

                _id:
                    website._id,

                name:
                    website.name,

                url:
                    website.url,

            },

            trends,

        });

    } catch (error) {

        console.error(
            "Get security trend error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to load security trend",

        });

    }
};

// --------------------------------------------------
// Get Website Security Overview
// --------------------------------------------------

const getWebsiteSecurity = async (
    req,
    res
) => {

    try {

        // ----------------------------------------------
        // Get user's websites
        // ----------------------------------------------

        const websites =
            await Website.find({
                userId:
                    req.userId,
            })
            .select(
                "name url"
            )
            .sort({
                createdAt:
                    -1,
            })
            .lean();


        // ----------------------------------------------
        // Get monitoring records
        // ----------------------------------------------

        const monitorings =
            await Monitoring.find({
                userId:
                    req.userId,
            })
            .lean();


        // ----------------------------------------------
        // Create monitoring lookup
        // ----------------------------------------------

        const monitoringMap =
            new Map();

        for (
            const monitoring
            of monitorings
        ) {

            monitoringMap.set(
                monitoring.websiteId.toString(),
                monitoring
            );

        }


        // ----------------------------------------------
        // Generate security data
        // ----------------------------------------------

        const websiteSecurity =
            await Promise.all(

                websites.map(
                    async (website) => {

                        // ----------------------------------
                        // Find latest completed scan
                        // ----------------------------------

                        const latestScan =
                            await Scan.findOne({

                                userId:
                                    req.userId,

                                websiteId:
                                    website._id,

                                status:
                                    "completed",

                            })
                            .select(
                                "severityCounts healthScore healthStatus vulnerabilities completedAt"
                            )
                            .sort({
                                completedAt:
                                    -1,
                            })
                            .lean();


                        // ----------------------------------
                        // Monitoring information
                        // ----------------------------------

                        const monitoring =
                            monitoringMap.get(
                                website._id.toString()
                            ) || null;


                        // ----------------------------------
                        // No completed scan
                        // ----------------------------------

                        if (!latestScan) {

                            return {

                                _id:
                                    website._id,

                                name:
                                    website.name,

                                url:
                                    website.url,

                                monitoring: monitoring
                                    ? {
                                        enabled:
                                            monitoring.enabled,

                                        frequency:
                                            monitoring.frequency,

                                        nextRunAt:
                                            monitoring.nextRunAt,

                                        lastRunAt:
                                            monitoring.lastRunAt,

                                    }
                                    : null,

                                lastScan: null,

                                healthScore: null,

                                healthStatus:
                                    "Not Scanned",

                                severity: {

                                    critical: 0,

                                    high: 0,

                                    medium: 0,

                                    low: 0,

                                    informational: 0,

                                },

                            };

                        }


                        // ----------------------------------
                        // Stored severity counts
                        // ----------------------------------

                        const scanSeverity =
                            latestScan.severityCounts || {};


                        // ----------------------------------
                        // Return website security data
                        // ----------------------------------

                        return {

                            _id:
                                website._id,

                            name:
                                website.name,

                            url:
                                website.url,

                            monitoring: monitoring
                                ? {

                                    enabled:
                                        monitoring.enabled,

                                    frequency:
                                        monitoring.frequency,

                                    nextRunAt:
                                        monitoring.nextRunAt,

                                    lastRunAt:
                                        monitoring.lastRunAt,

                                }
                                : null,

                            lastScan: {

                                scanId:
                                    latestScan._id,

                                completedAt:
                                    latestScan.completedAt,

                                vulnerabilities:
                                    latestScan.vulnerabilities,

                            },

                            healthScore:
                                latestScan.healthScore,

                            healthStatus:
                                latestScan.healthStatus ||
                                "Not Scored",

                            severity: {

                                critical:
                                    scanSeverity.critical || 0,

                                high:
                                    scanSeverity.high || 0,

                                medium:
                                    scanSeverity.medium || 0,

                                low:
                                    scanSeverity.low || 0,

                                informational:
                                    scanSeverity.informational || 0,

                            },

                        };

                    }
                )

            );


        // ----------------------------------------------
        // Return response
        // ----------------------------------------------

        return res.status(200).json({

            websites:
                websiteSecurity,

        });

    } catch (error) {

        console.error(
            "Get website security error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to load website security data",

        });

    }
};

// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {
    getDashboardOverview,
    getSecurityTrend,
    getWebsiteSecurity,
};