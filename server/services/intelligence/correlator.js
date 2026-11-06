const hasCategory = (findings, category) => {
    return findings.some(
        finding => finding.category === category
    );
};


const correlateFindings = (findings = []) => {
    const correlations = [];

    const hasAuthentication =
        hasCategory(findings, "Authentication");

    const hasAccessControl =
        hasCategory(findings, "Broken Access Control");

    const hasInjection =
        hasCategory(findings, "Injection");

    const hasInformationDisclosure =
        hasCategory(findings, "Information Disclosure");

    const hasMisconfiguration =
        hasCategory(findings, "Security Misconfiguration");

    const hasVulnerableComponents =
        hasCategory(findings, "Vulnerable Components");


    // Rule 1:
    // Authentication + Broken Access Control

    if (hasAuthentication && hasAccessControl) {
        correlations.push({
            type: "Potential Attack Chain",
            title: "Authentication and Access Control Weakness",
            severity: "High",
            description:
                "Authentication and access-control weaknesses were detected together. This may indicate a potential path for unauthorized access to protected resources.",
            categories: [
                "Authentication",
                "Broken Access Control"
            ]
        });
    }


    // Rule 2:
    // Injection + Information Disclosure

    if (hasInjection && hasInformationDisclosure) {
        correlations.push({
            type: "Potential Attack Chain",
            title: "Potential Data Exposure Path",
            severity: "High",
            description:
                "Injection-related vulnerabilities were detected together with information disclosure findings. This combination may increase the risk of sensitive data exposure.",
            categories: [
                "Injection",
                "Information Disclosure"
            ]
        });
    }


    // Rule 3:
    // Misconfiguration + Vulnerable Components

    if (hasMisconfiguration && hasVulnerableComponents) {
        correlations.push({
            type: "Potential Attack Surface Weakness",
            title: "Configuration and Component Weakness",
            severity: "Medium",
            description:
                "Security misconfiguration and vulnerable components were detected together. This combination may increase the application's attack surface.",
            categories: [
                "Security Misconfiguration",
                "Vulnerable Components"
            ]
        });
    }


    return correlations;
};


module.exports = {
    correlateFindings
};