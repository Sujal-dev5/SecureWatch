require("dotenv").config();

const connectDB = require("../config/db");
const Scan = require("../models/scan");

const {
    normalizeFindings,
} = require("../services/intelligence/normalizer");

const {
    deduplicateFindings,
} = require("../services/intelligence/deduplicator");

const {
    categorizeFindings,
} = require("../services/intelligence/categorizer");

const {
    scoreFindings,
} = require("../services/intelligence/riskScorer");

const {
    calculateHealthScore,
    getHealthStatus,
} = require("../services/intelligence/healthScore");


// --------------------------------------------------
// Calculate Security Health
// --------------------------------------------------

const calculateSecurityHealth = (
    findings = []
) => {

    // ----------------------------------------------
    // Normalize
    // ----------------------------------------------

    const normalizedFindings =
        normalizeFindings(
            findings
        );


    // ----------------------------------------------
    // Deduplicate
    // ----------------------------------------------

    const deduplicatedFindings =
        deduplicateFindings(
            normalizedFindings
        );


    // ----------------------------------------------
    // Categorize
    // ----------------------------------------------

    const categorizedFindings =
        categorizeFindings(
            deduplicatedFindings
        );


    // ----------------------------------------------
    // VIE Risk / Priority Scoring
    // ----------------------------------------------

    const vieFindings =
        scoreFindings(
            categorizedFindings
        );


    // ----------------------------------------------
    // Security Health Score
    // ----------------------------------------------

    const healthScore =
        calculateHealthScore(
            vieFindings
        );


    // ----------------------------------------------
    // Security Health Status
    // ----------------------------------------------

    const healthStatus =
        getHealthStatus(
            healthScore
        );


    return {
        healthScore,
        healthStatus,
    };
};


// --------------------------------------------------
// Backfill Health Scores
// --------------------------------------------------

const backfillHealthScores = async () => {

    try {

        console.log(
            "\n========================================"
        );

        console.log(
            "SecureWatch AI - Health Score Backfill"
        );

        console.log(
            "========================================\n"
        );


        // ----------------------------------------------
        // Connect MongoDB
        // ----------------------------------------------

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
                "_id findings healthScore healthStatus"
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

            const securityHealth =
                calculateSecurityHealth(
                    scan.findings || []
                );


            // ------------------------------------------
            // Save health information
            // ------------------------------------------

            await Scan.updateOne(
                {
                    _id:
                        scan._id,
                },
                {
                    $set: {

                        healthScore:
                            securityHealth.healthScore,

                        healthStatus:
                            securityHealth.healthStatus,

                    },
                }
            );


            processed++;


            console.log(
                `[${processed}/${scans.length}] Scan ${scan._id} →`,
                securityHealth
            );

        }


        // ----------------------------------------------
        // Completed
        // ----------------------------------------------

        console.log(
            "\n========================================"
        );

        console.log(
            `Health score backfill completed successfully. ${processed} scans updated.`
        );

        console.log(
            "========================================\n"
        );


        process.exit(0);

    } catch (error) {

        console.error(
            "\nHealth score backfill failed:"
        );

        console.error(
            error
        );

        process.exit(1);

    }

};


// --------------------------------------------------
// Run
// --------------------------------------------------

backfillHealthScores();