const mongoose = require("mongoose");

const Scan = require("../models/scan");

const {
    generateIntelligence,
} = require("../services/intelligence/intelligenceService");

const {
    generateSecurityReport,
} = require("../services/report/pdfReportService");


// --------------------------------------------------
// Generate Security Report
// --------------------------------------------------

const generateReport = async (
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
        // Report only available for completed scans
        // ----------------------------------------------

        if (
            scan.status !== "completed"
        ) {

            return res.status(400).json({

                message:
                    "Security report is available only for completed scans",

            });

        }


        // ----------------------------------------------
        // Generate VIE intelligence
        // ----------------------------------------------

        console.log(
            `Generating security report for scan ${id}`
        );


        const intelligence =
            await generateIntelligence({

                scanId:
                    scan._id,

                userId:
                    req.userId,

            });


        // ----------------------------------------------
        // Prepare report data
        // ----------------------------------------------

        const uniqueFindings =
            Array.isArray(
                intelligence.uniqueFindings
            )
                ? [
                    ...intelligence.uniqueFindings
                ]
                : [];


        // ----------------------------------------------
        // Sort findings by priority score
        // ----------------------------------------------

        uniqueFindings.sort(
            (
                a,
                b
            ) =>
                (
                    b.priorityScore || 0
                ) -
                (
                    a.priorityScore || 0
                )
        );


        const reportData = {

            // ------------------------------------------
            // Website information
            // ------------------------------------------

            websiteName:
                scan.websiteId?.name ||
                "Unknown Website",

            websiteUrl:
                scan.websiteId?.url ||
                "Unknown URL",


            // ------------------------------------------
            // Scan information
            // ------------------------------------------

            scanId:
                scan._id.toString(),

            scanDate:
                scan.completedAt
                    ? new Date(
                        scan.completedAt
                    ).toLocaleString()
                    : "Unknown",


            // ------------------------------------------
            // Security health
            // ------------------------------------------

            healthScore:
                intelligence.healthScore,

            healthStatus:
                intelligence.healthStatus,


            // ------------------------------------------
            // VIE priority summary
            // ------------------------------------------

            summary:
                intelligence.summary,


            // ------------------------------------------
            // Scan statistics
            // ------------------------------------------

            totalFindings:
                scan.vulnerabilities || 0,

            uniqueFindingsCount:
                uniqueFindings.length,


            // ------------------------------------------
            // Historical comparison
            // ------------------------------------------

            changes:
                intelligence.changes,


            // ------------------------------------------
            // Prioritized findings
            // ------------------------------------------

            uniqueFindings,

        };


        // ----------------------------------------------
        // Configure PDF response
        // ----------------------------------------------

        const safeWebsiteName =
            (
                scan.websiteId?.name ||
                "security-report"
            )
                .replace(
                    /[^a-z0-9-_]/gi,
                    "_"
                );


        const filename =
            `SecureWatch_${safeWebsiteName}_Security_Report.pdf`;


        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${filename}"`
        );


        // ----------------------------------------------
        // Generate PDF
        // ----------------------------------------------

        generateSecurityReport({

            reportData,

            outputStream:
                res,

        });


        console.log(
            `Security report generated successfully for scan ${id}`
        );

    } catch (error) {

        console.error(
            "Generate security report error:",
            error
        );


        // ----------------------------------------------
        // Prevent sending JSON after PDF stream starts
        // ----------------------------------------------

        if (
            res.headersSent
        ) {

            return res.end();

        }


        return res.status(
            error.statusCode || 500
        ).json({

            message:
                error.message ||
                "Failed to generate security report",

        });

    }

};


// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {

    generateReport,

};