const SEVERITY_WEIGHTS = {
    Critical: 100,
    High: 80,
    Medium: 60,
    Low: 35,
    Informational: 15
};


const CONFIDENCE_MULTIPLIERS = {
    High: 1.00,
    Medium: 0.85,
    Low: 0.70,
    Unknown: 0.60
};


const calculateOccurrenceBonus = (occurrences = 1) => {
    return Math.min(
        (Math.max(occurrences, 1) - 1) * 2,
        10
    );
};


const calculatePriorityScore = (finding) => {
    const severity = finding.severity || "Informational";
    const confidence = finding.confidence || "Unknown";
    const occurrences = finding.occurrences || 1;

    const severityWeight =
        SEVERITY_WEIGHTS[severity] ||
        SEVERITY_WEIGHTS.Informational;

    const confidenceMultiplier =
        CONFIDENCE_MULTIPLIERS[confidence] ||
        CONFIDENCE_MULTIPLIERS.Unknown;

    const baseScore =
        severityWeight * confidenceMultiplier;

    const occurrenceBonus =
        calculateOccurrenceBonus(occurrences);

    const priorityScore = Math.min(
        baseScore + occurrenceBonus,
        100
    );

    return Number(priorityScore.toFixed(2));
};


const getPriorityLevel = (priorityScore) => {
    if (priorityScore >= 80) {
        return "Critical";
    }

    if (priorityScore >= 60) {
        return "High";
    }

    if (priorityScore >= 40) {
        return "Medium";
    }

    if (priorityScore >= 20) {
        return "Low";
    }

    return "Informational";
};


const scoreFinding = (finding) => {
    const priorityScore =
        calculatePriorityScore(finding);

    const priority =
        getPriorityLevel(priorityScore);

    return {
        ...finding,
        priorityScore,
        priority
    };
};


const scoreFindings = (findings = []) => {
    return findings.map(scoreFinding);
};


module.exports = {
    calculateOccurrenceBonus,
    calculatePriorityScore,
    getPriorityLevel,
    scoreFinding,
    scoreFindings
};