const Scan = require("../../models/scan");
const ScanFinding = require("../../models/scanFinding");
const Website = require("../../models/website");

const {
    validateRuntimeTarget,
} = require("../../utils/targetSecurity");

const {
    normalizeFindings,
} = require("../intelligence/normalizer");

const {
    deduplicateFindings,
} = require("../intelligence/deduplicator");

const {
    categorizeFindings,
} = require("../intelligence/categorizer");

const {
    scoreFindings,
} = require("../intelligence/riskScorer");

const {
    calculateHealthScore,
    getHealthStatus,
} = require("../intelligence/healthScore");

const {
    startSpider,
    getSpiderProgress,
    startActiveScan,
    getActiveScanProgress,
    getAlerts,
    stopSpider,
    stopActiveScan,
} = require("../zap/zapService");


// --------------------------------------------------
// Utility
// --------------------------------------------------

const sleep = (ms) => {
    return new Promise((resolve) =>
        setTimeout(resolve, ms)
    );
};


// --------------------------------------------------
// Check whether scan was cancelled
// --------------------------------------------------

const isScanCancelled = async (
    scanId
) => {

    const scan =
        await Scan.findById(
            scanId
        )
        .select("status");

    return scan?.status === "cancelled";
};


// --------------------------------------------------
// Safely update scan progress
// --------------------------------------------------

const updateScanProgress = async (
    scanId,
    progress
) => {

    try {

        await Scan.findByIdAndUpdate(
            scanId,
            {
                progress,
            }
        );

    } catch (error) {

        console.warn(
            `Failed to update scan ${scanId} progress:`,
            error.message
        );

    }
};


// --------------------------------------------------
// Calculate Severity Summary
// --------------------------------------------------

const calculateSeverityCounts = (
    alerts = []
) => {

    const normalizedFindings =
        normalizeFindings(
            alerts
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
// Calculate Security Health
// --------------------------------------------------

const calculateSecurityHealth = (
    alerts = []
) => {

    // ----------------------------------------------
    // Normalize
    // ----------------------------------------------

    const normalizedFindings =
        normalizeFindings(
            alerts
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
// Save ZAP Findings
// --------------------------------------------------

const saveScanFindings = async (
    scanId,
    userId,
    websiteId,
    alerts = []
) => {

    // ----------------------------------------------
    // Convert raw ZAP alerts into ScanFinding
    // documents.
    // ----------------------------------------------

    const findingDocuments =
        alerts.map(
            (alert) => ({
                scanId,

                userId,

                websiteId,

                title:
                    alert.name ||
                    alert.alert ||
                    "Unknown Vulnerability",

                severity:
                    alert.risk ||
                    "Informational",

                confidence:
                    alert.confidence ||
                    "Unknown",

                url:
                    alert.url ||
                    "",

                method:
                    alert.method ||
                    "",

                parameter:
                    alert.param ||
                    "",

                description:
                    alert.description ||
                    "",

                evidence:
                    alert.evidence ||
                    "",

                solution:
                    alert.solution ||
                    "",

                reference:
                    alert.reference ||
                    "",

                pluginId:
                    alert.pluginId ||
                    "",

                occurrences: 1,
            })
        );


    // ----------------------------------------------
    // Nothing to save
    // ----------------------------------------------

    if (
        findingDocuments.length === 0
    ) {

        console.log(
            `No findings to save for scan ${scanId}`
        );

        return 0;

    }


    // ----------------------------------------------
    // Insert findings in batches
    // ----------------------------------------------

    const BATCH_SIZE = 500;

    let savedCount = 0;


    for (
        let i = 0;
        i < findingDocuments.length;
        i += BATCH_SIZE
    ) {

        const batch =
            findingDocuments.slice(
                i,
                i + BATCH_SIZE
            );


        await ScanFinding.insertMany(
            batch,
            {
                ordered: false,
            }
        );


        savedCount += batch.length;


        console.log(
            `Saved scan findings: ${savedCount}/${findingDocuments.length}`
        );

    }


    return savedCount;
};


// --------------------------------------------------
// Run ZAP Scan
// --------------------------------------------------

const runScan = async (
    scanId
) => {

    let spiderId = null;

    let activeScanId = null;


    try {

        // ==============================================
        // LOAD SCAN AND AUTHORITATIVE WEBSITE
        // ==============================================

        const scan =
            await Scan.findById(
                scanId
            )
            .select(
                "websiteId status"
            )
            .lean();


        if (!scan) {

            throw new Error(
                "Scan not found"
            );

        }


        const website =
            await Website.findOne({
                _id:
                    scan.websiteId,
            })
            .select(
                "url"
            )
            .lean();


        if (!website) {

            throw new Error(
                "Website associated with scan was not found"
            );

        }


        // ----------------------------------------------
        // Website URL from database is the authoritative
        // scan target.
        // ----------------------------------------------

        const targetUrl =
            website.url;


        console.log(
            `Scan ${scanId} target loaded from database: ${targetUrl}`
        );


        // ==============================================
        // RUNTIME TARGET SECURITY VALIDATION
        // ==============================================

        console.log(
            `Validating scan target at runtime: ${targetUrl}`
        );


        await validateRuntimeTarget(
            targetUrl
        );


        // ==============================================
        // MARK SCAN AS RUNNING
        // ==============================================

        await Scan.findByIdAndUpdate(
            scanId,
            {
                status:
                    "running",

                progress:
                    0,

                startedAt:
                    new Date(),
            }
        );


        // ----------------------------------------------
        // Check cancellation before starting
        // ----------------------------------------------

        if (
            await isScanCancelled(
                scanId
            )
        ) {

            return;

        }


        // ==============================================
        // SPIDER SCAN
        // ==============================================

        console.log(
            `Starting ZAP spider for: ${targetUrl}`
        );


        const spider =
            await startSpider(
                targetUrl
            );


        spiderId =
            spider.scan;


        if (!spiderId) {

            throw new Error(
                "Failed to start ZAP spider scan"
            );

        }


        console.log(
            `ZAP spider started. ID: ${spiderId}`
        );


        // ----------------------------------------------
        // Store Spider ID
        // ----------------------------------------------

        await Scan.findByIdAndUpdate(
            scanId,
            {
                zapSpiderId:
                    spiderId,
            }
        );


        // ----------------------------------------------
        // Check cancellation
        // ----------------------------------------------

        if (
            await isScanCancelled(
                scanId
            )
        ) {

            try {

                await stopSpider(
                    spiderId
                );


                console.log(
                    `ZAP spider ${spiderId} stopped after cancellation`
                );

            } catch (error) {

                console.warn(
                    "Failed to stop spider after cancellation:",
                    error.message
                );

            }


            return;

        }


        // ==============================================
        // MONITOR SPIDER
        // ==============================================

        let spiderProgress = 0;


        // SecureWatch displayed progress must
        // never move backwards even if ZAP reports
        // a lower value temporarily.

        let displayedSpiderProgress = 0;


        while (
            spiderProgress < 100
        ) {

            await sleep(
                1000
            );


            // ------------------------------------------
            // Check cancellation
            // ------------------------------------------

            if (
                await isScanCancelled(
                    scanId
                )
            ) {

                console.log(
                    `Scan ${scanId} cancelled during spider scan`
                );


                try {

                    await stopSpider(
                        spiderId
                    );


                    console.log(
                        `ZAP spider ${spiderId} stopped`
                    );

                } catch (error) {

                    console.warn(
                        "Failed to stop ZAP spider:",
                        error.message
                    );

                }


                return;

            }


            // ------------------------------------------
            // Get ZAP Spider progress
            // ------------------------------------------

            spiderProgress =
                await getSpiderProgress(
                    spiderId
                );


            console.log(
                `ZAP Spider progress: ${spiderProgress}%`
            );


            // ------------------------------------------
            // Keep SecureWatch progress monotonic
            // ------------------------------------------

            displayedSpiderProgress =
                Math.max(
                    displayedSpiderProgress,
                    spiderProgress
                );


            console.log(
                `SecureWatch Spider progress: ${displayedSpiderProgress}%`
            );


            // ------------------------------------------
            // Spider = 0-40%
            // ------------------------------------------

            const overallProgress =
                Math.min(
                    40,

                    Math.round(
                        displayedSpiderProgress *
                        0.4
                    )
                );


            await updateScanProgress(
                scanId,
                overallProgress
            );

        }


        // ==============================================
        // BEFORE ACTIVE SCAN
        // ==============================================

        if (
            await isScanCancelled(
                scanId
            )
        ) {

            return;

        }


        // ==============================================
        // ACTIVE SCAN
        // ==============================================

        console.log(
            `Starting ZAP active scan for: ${targetUrl}`
        );


        const activeScan =
            await startActiveScan(
                targetUrl
            );


        activeScanId =
            activeScan.scan;


        if (!activeScanId) {

            throw new Error(
                "Failed to start ZAP active scan"
            );

        }


        console.log(
            `ZAP active scan started. ID: ${activeScanId}`
        );


        // ----------------------------------------------
        // Store Active Scan ID
        // ----------------------------------------------

        await Scan.findByIdAndUpdate(
            scanId,
            {
                zapActiveScanId:
                    activeScanId,
            }
        );


        // ----------------------------------------------
        // Check cancellation
        // ----------------------------------------------

        if (
            await isScanCancelled(
                scanId
            )
        ) {

            try {

                await stopActiveScan(
                    activeScanId
                );


                console.log(
                    `ZAP active scan ${activeScanId} stopped after cancellation`
                );

            } catch (error) {

                console.warn(
                    "Failed to stop active scan after cancellation:",
                    error.message
                );

            }


            return;

        }


        // ==============================================
        // MONITOR ACTIVE SCAN
        // ==============================================

        let activeProgress = 0;


        while (
            activeProgress < 100
        ) {

            await sleep(
                2000
            );


            // ------------------------------------------
            // Check cancellation
            // ------------------------------------------

            if (
                await isScanCancelled(
                    scanId
                )
            ) {

                console.log(
                    `Scan ${scanId} cancelled during active scan`
                );


                try {

                    await stopActiveScan(
                        activeScanId
                    );


                    console.log(
                        `ZAP active scan ${activeScanId} stopped`
                    );

                } catch (error) {

                    console.warn(
                        "Failed to stop ZAP active scan:",
                        error.message
                    );

                }


                return;

            }


            // ------------------------------------------
            // Get Active Scan progress
            // ------------------------------------------

            activeProgress =
                await getActiveScanProgress(
                    activeScanId
                );


            console.log(
                `Active scan progress: ${activeProgress}%`
            );


            // ------------------------------------------
            // Active Scan = 40-100%
            // ------------------------------------------

            const overallProgress =
                40 +
                Math.round(
                    activeProgress *
                    0.6
                );


            await updateScanProgress(
                scanId,

                Math.min(
                    100,
                    overallProgress
                )
            );

        }


        // ==============================================
        // BEFORE GETTING FINDINGS
        // ==============================================

        if (
            await isScanCancelled(
                scanId
            )
        ) {

            return;

        }


        // ==============================================
        // GET ZAP FINDINGS
        // ==============================================

        console.log(
            `Getting ZAP findings for: ${targetUrl}`
        );


        const alerts =
            await getAlerts(
                targetUrl
            );


        // ----------------------------------------------
        // Final cancellation check
        // ----------------------------------------------

        if (
            await isScanCancelled(
                scanId
            )
        ) {

            return;

        }


        // ==============================================
        // CALCULATE SEVERITY SUMMARY
        // ==============================================

        const severityCounts =
            calculateSeverityCounts(
                alerts
            );


        console.log(
            "Severity summary:",
            severityCounts
        );


        // ==============================================
        // CALCULATE SECURITY HEALTH
        // ==============================================

        const securityHealth =
            calculateSecurityHealth(
                alerts
            );


        console.log(
            "Security health:",
            securityHealth
        );


        // ==============================================
        // GET LATEST SCAN OWNER INFORMATION
        // ==============================================

        const scanOwner =
            await Scan.findById(
                scanId
            )
            .select(
                "userId websiteId status"
            );


        if (!scanOwner) {

            throw new Error(
                "Scan not found while saving findings"
            );

        }


        // ----------------------------------------------
        // Check cancellation before saving findings
        // ----------------------------------------------

        if (
            scanOwner.status ===
            "cancelled"
        ) {

            console.log(
                `Scan ${scanId} was cancelled before findings were saved`
            );

            return;

        }


        // ==============================================
        // SAVE FINDINGS SEPARATELY
        // ==============================================

        console.log(
            `Saving ${alerts.length} findings for scan ${scanId}`
        );


        const savedFindingCount =
            await saveScanFindings(
                scanId,
                scanOwner.userId,
                scanOwner.websiteId,
                alerts
            );


        console.log(
            `Successfully saved ${savedFindingCount} findings`
        );


        // ==============================================
        // SAVE FINAL SCAN RESULT
        // ==============================================

        await Scan.findByIdAndUpdate(
            scanId,
            {
                status:
                    "completed",

                completedAt:
                    new Date(),

                vulnerabilities:
                    alerts.length,

                severityCounts,

                healthScore:
                    securityHealth.healthScore,

                healthStatus:
                    securityHealth.healthStatus,

                progress:
                    100,

                errorMessage:
                    null,
            }
        );


        console.log(
            `Scan ${scanId} completed. Vulnerabilities: ${alerts.length}`
        );


        console.log(
            `Health Score: ${securityHealth.healthScore}`
        );


        console.log(
            `Health Status: ${securityHealth.healthStatus}`
        );


    } catch (error) {

        console.error(
            "Scan execution failed:",
            error
        );


        // ==============================================
        // CLEANUP ZAP AFTER UNEXPECTED FAILURE
        // ==============================================

        if (
            activeScanId !== null
        ) {

            try {

                console.log(
                    `Stopping ZAP active scan ${activeScanId} after scan failure`
                );


                await stopActiveScan(
                    activeScanId
                );


                console.log(
                    `ZAP active scan ${activeScanId} stopped after failure`
                );


            } catch (stopError) {

                console.warn(
                    "Failed to stop ZAP active scan after failure:",
                    stopError.message
                );

            }

        }


        if (
            spiderId !== null
        ) {

            try {

                console.log(
                    `Stopping ZAP spider ${spiderId} after scan failure`
                );


                await stopSpider(
                    spiderId
                );


                console.log(
                    `ZAP spider ${spiderId} stopped after failure`
                );


            } catch (stopError) {

                console.warn(
                    "Failed to stop ZAP spider after failure:",
                    stopError.message
                );

            }

        }


        // ==============================================
        // NEVER OVERWRITE CANCELLED WITH FAILED
        // ==============================================

        try {

            const currentScan =
                await Scan.findById(
                    scanId
                )
                .select(
                    "status"
                );


            if (
                currentScan?.status ===
                "cancelled"
            ) {

                console.log(
                    `Scan ${scanId} was already cancelled`
                );

                return;

            }


            await Scan.findByIdAndUpdate(
                scanId,
                {
                    status:
                        "failed",

                    errorMessage:
                        error.message,

                    completedAt:
                        new Date(),
                }
            );


        } catch (updateError) {

            console.error(
                "Failed to update scan failure status:",
                updateError.message
            );

        }

    }

};


// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {
    runScan,
};