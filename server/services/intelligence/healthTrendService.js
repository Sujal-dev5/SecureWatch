const {
    normalizeFindings,
} = require("./normalizer");

const {
    deduplicateFindings,
} = require("./deduplicator");

const {
    categorizeFindings,
} = require("./categorizer");

const {
    scoreFindings,
} = require("./riskScorer");

const {
    calculateHealthScore,
    getHealthStatus,
} = require("./healthScore");


// --------------------------------------------------
// Generate Health Trend Data For A Scan
// --------------------------------------------------

const generateHealthTrendData = (
    scan
) => {

    // ----------------------------------------------
    // 1. Normalize
    // ----------------------------------------------

    const normalizedFindings =
        normalizeFindings(
            scan.findings || []
        );


    // ----------------------------------------------
    // 2. Deduplicate
    // ----------------------------------------------

    const deduplicatedFindings =
        deduplicateFindings(
            normalizedFindings
        );


    // ----------------------------------------------
    // 3. Categorize
    // ----------------------------------------------

    const categorizedFindings =
        categorizeFindings(
            deduplicatedFindings
        );


    // ----------------------------------------------
    // 4. Calculate VIE priority
    // ----------------------------------------------

    const vieFindings =
        scoreFindings(
            categorizedFindings
        );


    // ----------------------------------------------
    // 5. Calculate Health Score
    // ----------------------------------------------

    const healthScore =
        calculateHealthScore(
            vieFindings
        );


    // ----------------------------------------------
    // 6. Calculate Health Status
    // ----------------------------------------------

    const healthStatus =
        getHealthStatus(
            healthScore
        );


    // ----------------------------------------------
    // 7. Return trend data
    // ----------------------------------------------

    return {

        scanId:
            scan._id,

        date:
            scan.completedAt,

        healthScore,

        healthStatus,

    };
};


module.exports = {
    generateHealthTrendData,
};