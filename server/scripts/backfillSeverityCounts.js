require("dotenv").config();

const connectDB = require("../config/db");
const Scan = require("../models/scan");

const {
    normalizeFindings,
} = require("../services/intelligence/normalizer");


// --------------------------------------------------
// Calculate Severity Counts
// --------------------------------------------------

const calculateSeverityCounts = (
    findings = []
) => {

    const normalizedFindings =
        normalizeFindings(
            findings
        );


    const severityCounts = {

        critical: 0,

        high: 0,

        medium: 0,

        low: 0,

        informational: 0,

    };


    for (
        const finding
        of normalizedFindings
    ) {

        switch (
            finding.severity
        ) {

            case "Critical":

                severityCounts.critical++;

                break;


            case "High":

                severityCounts.high++;

                break;


            case "Medium":

                severityCounts.medium++;

                break;


            case "Low":

                severityCounts.low++;

                break;


            case "Informational":

            default:

                severityCounts.informational++;

                break;
        }
    }


    return severityCounts;
};


// --------------------------------------------------
// Backfill Existing Scans
// --------------------------------------------------

const backfillSeverityCounts = async () => {

    try {

        console.log(
            "\n========================================"
        );

        console.log(
            "SecureWatch AI - Severity Backfill"
        );

        console.log(
            "========================================\n"
        );


        await connectDB();


        console.log(
            "MongoDB connected."
        );


        // ----------------------------------------------
        // Get completed scans
        // ----------------------------------------------

        const scans =
            await Scan.find({
                status: "completed",
            })
            .select(
                "_id findings"
            )
            .lean();


        console.log(
            `Found ${scans.length} completed scans.`
        );


        if (
            scans.length === 0
        ) {

            console.log(
                "No completed scans require backfilling."
            );

            process.exit(0);

        }


        // ----------------------------------------------
        // Process scans
        // ----------------------------------------------

        let processed = 0;


        for (
            const scan
            of scans
        ) {

            const severityCounts =
                calculateSeverityCounts(
                    scan.findings || []
                );


            await Scan.updateOne(

                {
                    _id:
                        scan._id,
                },

                {
                    $set: {
                        severityCounts,
                    },
                }

            );


            processed++;


            console.log(
                `[${processed}/${scans.length}] Scan ${scan._id} →`,
                severityCounts
            );

        }


        // ----------------------------------------------
        // Complete
        // ----------------------------------------------

        console.log(
            "\n========================================"
        );

        console.log(
            `Backfill completed successfully. ${processed} scans updated.`
        );

        console.log(
            "========================================\n"
        );


        process.exit(0);


    } catch (error) {

        console.error(
            "\nSeverity backfill failed:"
        );

        console.error(
            error
        );


        process.exit(1);

    }
};


backfillSeverityCounts();