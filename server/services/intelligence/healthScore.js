const PRIORITY_DEDUCTIONS = {
    Critical: 20,
    High: 12,
    Medium: 6,
    Low: 2,
    Informational: 0.5
};


/*
 * Generate a unique vulnerability key.
 *
 * Same vulnerability on multiple URLs is treated
 * as ONE vulnerability for Security Health Score.
 *
 * Example:
 *
 * User Agent Fuzzer + Other
 *
 * remains one vulnerability even if it appears
 * on 100+ endpoints.
 */
const getVulnerabilityKey = (finding) => {

    const title = (
        finding.title ||
        finding.name ||
        finding.alert ||
        "Unknown Vulnerability"
    )
        .toLowerCase()
        .trim();

    const category = (
        finding.category ||
        "Other"
    )
        .toLowerCase()
        .trim();

    return `${title}|${category}`;
};


/*
 * Keep only one representative finding
 * for each unique vulnerability.
 *
 * If the same vulnerability has different
 * priority information, keep the highest
 * priority score.
 */
const getUniqueFindings = (findings = []) => {

    const uniqueMap = new Map();

    for (const finding of findings) {

        const key =
            getVulnerabilityKey(finding);

        if (!uniqueMap.has(key)) {

            uniqueMap.set(key, finding);

            continue;
        }

        const existing =
            uniqueMap.get(key);

        /*
         * Keep the finding with the
         * highest priority score.
         */
        if (
            (finding.priorityScore || 0) >
            (existing.priorityScore || 0)
        ) {
            uniqueMap.set(key, finding);
        }
    }

    return Array.from(
        uniqueMap.values()
    );
};


/*
 * Calculate Security Health Score
 *
 * Score starts at 100.
 *
 * Each UNIQUE vulnerability produces
 * one deduction according to its priority.
 *
 * Occurrences/endpoints do NOT multiply
 * the deduction.
 */
const calculateHealthScore = (
    findings = []
) => {

    const uniqueFindings =
        getUniqueFindings(findings);

    let totalDeduction = 0;

    for (
        const finding
        of uniqueFindings
    ) {

        const priority =
            finding.priority ||
            "Informational";

        const deduction =
            PRIORITY_DEDUCTIONS[
                priority
            ] ??
            PRIORITY_DEDUCTIONS.Informational;

        totalDeduction += deduction;
    }


    const healthScore =
        Math.max(
            0,
            100 - totalDeduction
        );


    return Number(
        healthScore.toFixed(1)
    );
};


/*
 * Convert score into a readable status.
 */
const getHealthStatus = (
    healthScore
) => {

    if (healthScore >= 80) {
        return "Healthy";
    }

    if (healthScore >= 60) {
        return "Moderate";
    }

    if (healthScore >= 40) {
        return "At Risk";
    }

    return "Critical";
};


module.exports = {
    calculateHealthScore,
    getHealthStatus,
    getUniqueFindings
};