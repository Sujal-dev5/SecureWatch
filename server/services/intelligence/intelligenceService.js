const Scan = require("../../models/scan");
const ScanFinding = require("../../models/scanFinding");

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
    correlateFindings,
} = require("./correlator");

const {
    calculateHealthScore,
    getHealthStatus,
    getUniqueFindings,
} = require("./healthScore");

const {
    compareScans,
} = require("./scanComparator");


// ==================================================
// Get findings for a scan
// ==================================================
//
// IMPORTANT:
// Keep this query lightweight.
//
// We intentionally do NOT load:
// - description
// - evidence
// - solution
// - reference
//
// This keeps the VIE processing fast even when a scan
// contains thousands of findings.
// ==================================================

const getScanFindings = async (
    scanId,
    userId
) => {

    return await ScanFinding.find({
        scanId,
        userId,
    })
        .select(
            [
                "title",
                "severity",
                "confidence",
                "url",
                "method",
                "parameter",
                "pluginId",
                "occurrences",
            ].join(" ")
        )
        .lean();
};


// ==================================================
// Add remediation information
// ==================================================
//
// Remediation is only required for the unique findings
// that will be used in the final security report.
//
// We therefore avoid loading "solution" for all raw
// findings during the main VIE pipeline.
//
// Example:
//
// 15,500 raw findings
//        ↓
// VIE processing
//        ↓
// 14 unique findings
//        ↓
// remediation lookup for those findings
//
// This keeps the main intelligence processing efficient.
// ==================================================

const addRemediationToFindings = async (
    scanId,
    userId,
    findings = []
) => {

    // ----------------------------------------------
    // Nothing to enrich
    // ----------------------------------------------

    if (
        !Array.isArray(findings) ||
        findings.length === 0
    ) {

        return findings;

    }


    // ----------------------------------------------
    // Collect unique plugin IDs
    // ----------------------------------------------

    const pluginIds =
        [
            ...new Set(
                findings
                    .map(
                        (finding) =>
                            finding.pluginId
                    )
                    .filter(Boolean)
            )
        ];


    // ----------------------------------------------
    // No plugin IDs available
    // ----------------------------------------------

    if (
        pluginIds.length === 0
    ) {

        return findings.map(
            (finding) => ({

                ...finding,

                remediation:
                    "",

            })
        );

    }


    // ----------------------------------------------
    // Retrieve remediation records
    // ----------------------------------------------
    //
    // Only matching plugin IDs are requested.
    //
    // We only select:
    // - pluginId
    // - solution
    //
    // No unnecessary fields are loaded.
    // ----------------------------------------------

    const remediationRecords =
        await ScanFinding.find({

            scanId,

            userId,

            pluginId: {
                $in:
                    pluginIds,
            },

        })
            .select(
                "pluginId solution"
            )
            .lean();


    // ----------------------------------------------
    // Create plugin → remediation lookup
    // ----------------------------------------------

    const remediationMap =
        new Map();


    for (
        const record
        of remediationRecords
    ) {

        if (
            !record.pluginId
        ) {

            continue;

        }


        // Keep the first non-empty
        // remediation we find.

        const existing =
            remediationMap.get(
                record.pluginId
            );


        if (
            existing
        ) {

            continue;

        }


        const solution =
            record.solution ||
            "";


        if (
            solution
        ) {

            remediationMap.set(
                record.pluginId,
                solution
            );

        }

    }


    // ----------------------------------------------
    // Attach remediation to unique findings
    // ----------------------------------------------

    return findings.map(
        (finding) => ({

            ...finding,

            remediation:
                remediationMap.get(
                    finding.pluginId
                ) || "",

        })
    );

};


// ==================================================
// Process raw findings through VIE pipeline
// ==================================================

const processFindings = (
    alerts
) => {

    // ----------------------------------------------
    // NORMALIZATION
    // ----------------------------------------------

    const normalizedFindings =
        normalizeFindings(
            alerts
        );


    // ----------------------------------------------
    // DEDUPLICATION
    // ----------------------------------------------

    const deduplicatedFindings =
        deduplicateFindings(
            normalizedFindings
        );


    // ----------------------------------------------
    // CATEGORIZATION
    // ----------------------------------------------

    const categorizedFindings =
        categorizeFindings(
            deduplicatedFindings
        );


    // ----------------------------------------------
    // VIE RISK SCORING
    // ----------------------------------------------

    const vieFindings =
        scoreFindings(
            categorizedFindings
        );


    return vieFindings;

};


// ==================================================
// Generate Vulnerability Intelligence
// ==================================================

const generateIntelligence = async ({
    scanId,
    userId,
}) => {

    // ==============================================
    // FIND CURRENT SCAN
    // ==============================================

    const currentScan =
        await Scan.findOne({
            _id: scanId,
            userId,
        })
            .select(
                "_id userId websiteId status"
            )
            .lean();


    if (!currentScan) {

        const error =
            new Error(
                "Scan not found"
            );

        error.statusCode = 404;

        throw error;

    }


    // ==============================================
    // INTELLIGENCE ONLY FOR COMPLETED SCANS
    // ==============================================

    if (
        currentScan.status !==
        "completed"
    ) {

        const error =
            new Error(
                "Intelligence is available only for completed scans"
            );

        error.statusCode = 400;

        throw error;

    }


    // ==============================================
    // CURRENT SCAN FINDINGS
    // ==============================================

    const currentAlerts =
        await getScanFindings(
            currentScan._id,
            userId
        );


    console.log(
        `VIE: Loaded ${currentAlerts.length} findings for scan ${currentScan._id}`
    );


    // ==============================================
    // PROCESS CURRENT FINDINGS
    // ==============================================

    const vieFindings =
        processFindings(
            currentAlerts
        );


    // ==============================================
    // UNIQUE FINDINGS
    // ==============================================

    let uniqueFindings =
        getUniqueFindings(
            vieFindings
        );


    // ==============================================
    // ADD REMEDIATION
    // ==============================================
    //
    // Only unique findings are enriched.
    //
    // This prevents the large raw finding collection
    // from unnecessarily loading solution text.
    // ==============================================

    uniqueFindings =
        await addRemediationToFindings(
            currentScan._id,
            userId,
            uniqueFindings
        );


    // ==============================================
    // SECURITY HEALTH SCORE
    // ==============================================

    const healthScore =
        calculateHealthScore(
            vieFindings
        );


    const healthStatus =
        getHealthStatus(
            healthScore
        );


    // ==============================================
    // PRIORITY SUMMARY
    // ==============================================

    const summary = {

        critical: 0,

        high: 0,

        medium: 0,

        low: 0,

        informational: 0,

    };


    for (
        const finding
        of uniqueFindings
    ) {

        const priority =
            (
                finding.priority ||
                "Informational"
            ).toLowerCase();


        if (
            summary[priority] !==
            undefined
        ) {

            summary[priority]++;

        }

    }


    // ==============================================
    // FIND PREVIOUS COMPLETED SCAN
    // ==============================================

    const previousScan =
        await Scan.findOne({

            websiteId:
                currentScan.websiteId,

            userId,

            status:
                "completed",

            _id: {
                $ne:
                    currentScan._id,
            },

        })
            .select(
                "_id websiteId completedAt"
            )
            .sort({
                completedAt: -1,
            })
            .lean();


    // ==============================================
    // DEFAULT SCAN COMPARISON
    // ==============================================

    let changes = {

        new: 0,

        resolved: 0,

        persistent: 0,

    };


    let newFindings = [];

    let resolvedFindings = [];

    let persistentFindings = [];


    // ==============================================
    // COMPARE WITH PREVIOUS SCAN
    // ==============================================

    if (
        previousScan
    ) {

        const previousAlerts =
            await getScanFindings(
                previousScan._id,
                userId
            );


        console.log(
            `VIE: Loaded ${previousAlerts.length} findings from previous scan ${previousScan._id}`
        );


        // ------------------------------------------
        // Process previous findings
        // ------------------------------------------

        const previousVieFindings =
            processFindings(
                previousAlerts
            );


        // ------------------------------------------
        // Compare scans
        // ------------------------------------------

        const comparison =
            compareScans(
                previousVieFindings,
                vieFindings
            );


        changes =
            comparison.summary;


        newFindings =
            comparison.newFindings;


        resolvedFindings =
            comparison.resolvedFindings;


        persistentFindings =
            comparison.persistentFindings;

    }


    // ==============================================
    // VULNERABILITY CORRELATIONS
    // ==============================================

    const correlations =
        correlateFindings(
            vieFindings
        );


    // ==============================================
    // RETURN INTELLIGENCE RESULT
    // ==============================================

    return {

        scanId:
            currentScan._id,

        healthScore,

        healthStatus,

        summary,

        changes,

        newFindings,

        resolvedFindings,

        persistentFindings,

        findings:
            vieFindings,

        uniqueFindings,

        correlations,

    };

};


// ==================================================
// EXPORTS
// ==================================================

module.exports = {

    generateIntelligence,

};