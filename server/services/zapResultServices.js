const normalizeFinding = (alert) => {
    return {
        pluginId: alert.pluginId || "",
        alert: alert.alert || "",
        name: alert.name || "",
        riskCode: alert.riskcode || "",
        risk: alert.risk || "Informational",
        confidence: alert.confidence || "Unknown",
        url: alert.url || "",
        method: alert.method || "",
        description: alert.description || "",
        solution: alert.solution || "",
        reference: alert.reference || "",
        evidence: alert.evidence || "",
        parameter: alert.param || ""
    };
};

const normalizeFindings = (alerts = []) => {
    return alerts.map(normalizeFinding);
};

module.exports = {
    normalizeFinding,
    normalizeFindings
};