const normalizeFinding = (alert) => {
    return {
        title:
            alert.name ||
            alert.alert ||
            alert.title ||
            "Unknown Vulnerability",

        // Supports both:
        // Raw ZAP alert -> alert.risk
        // ScanFinding   -> alert.severity
        severity:
            alert.risk ||
            alert.severity ||
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
            alert.parameter ||
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

        occurrences:
            alert.occurrences ||
            1
    };
};


const normalizeFindings = (alerts = []) => {
    return alerts.map(normalizeFinding);
};


module.exports = {
    normalizeFinding,
    normalizeFindings
};