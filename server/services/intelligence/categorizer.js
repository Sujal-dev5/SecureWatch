const categoryRules = [
    // --------------------------------------------------
    // SECURITY HEADERS
    // --------------------------------------------------
    {
        category: "Security Headers",
        keywords: [
            "content-security-policy",
            "csp header",
            "csp",
            "x-frame-options",
            "anti-clickjacking",
            "clickjacking",
            "x-content-type-options",
            "strict-transport-security",
            "hsts",
            "referrer-policy",
            "permissions-policy",
            "feature-policy",
            "security header",
            "header missing",
            "header not set",
            "header absent"
        ]
    },

    // --------------------------------------------------
    // INJECTION
    // --------------------------------------------------
    {
        category: "Injection",
        keywords: [
            "sql injection",
            "cross site scripting",
            "cross-site scripting",
            "stored xss",
            "reflected xss",
            "dom xss",
            "xss",
            "command injection",
            "os command injection",
            "code injection",
            "ldap injection",
            "xpath injection",
            "nosql injection",
            "template injection",
            "expression language injection"
        ]
    },

    // --------------------------------------------------
    // BROKEN ACCESS CONTROL
    // --------------------------------------------------
    {
        category: "Broken Access Control",
        keywords: [
            "broken access control",
            "access control",
            "authorization",
            "unauthorized access",
            "privilege escalation",
            "privilege",
            "idor",
            "insecure direct object",
            "forced browsing"
        ]
    },

    // --------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------
    {
        category: "Authentication",
        keywords: [
            "weak authentication",
            "authentication",
            "authentication bypass",
            "login",
            "password",
            "credential",
            "weak password",
            "default password",
            "default credential",
            "brute force",
            "account lockout"
        ]
    },

    // --------------------------------------------------
    // SESSION MANAGEMENT
    // --------------------------------------------------
    {
        category: "Session Management",
        keywords: [
            "session fixation",
            "session management",
            "session cookie",
            "session id",
            "session token",
            "cookie without",
            "cookie missing",
            "cookie not",
            "secure cookie",
            "httponly",
            "same-site",
            "samesite",
            "csrf",
            "cross-site request forgery"
        ]
    },

    // --------------------------------------------------
    // CRYPTOGRAPHIC FAILURE
    // --------------------------------------------------
    {
        category: "Cryptographic Failure",
        keywords: [
            "weak encryption",
            "weak cipher",
            "weak cryptographic",
            "cryptographic failure",
            "plaintext",
            "cleartext",
            "clear text",
            "unencrypted",
            "insecure cipher",
            "ssl certificate",
            "invalid certificate",
            "expired certificate",
            "certificate error",
            "tls version",
            "weak tls"
        ]
    },

    // --------------------------------------------------
    // SECURITY MISCONFIGURATION
    // --------------------------------------------------
    {
        category: "Security Misconfiguration",
        keywords: [
            "security misconfiguration",
            "misconfiguration",
            "misconfigured",
            "configuration",
            "default configuration",
            "directory listing",
            "directory browsing",
            "debug mode",
            "debug enabled",
            "server configuration",
            "server exposes",
            "server information",
            "retrieved from cache",
            "cache-control",
            "cache header",
            "https content available via http",
            "content available via http",
            "http instead of https",
            "mixed content",
            "directory index"
        ]
    },

    // --------------------------------------------------
    // VULNERABLE COMPONENTS
    // --------------------------------------------------
    {
        category: "Vulnerable Components",
        keywords: [
            "vulnerable component",
            "vulnerable library",
            "known vulnerability",
            "outdated",
            "outdated component",
            "outdated library",
            "old version",
            "obsolete library",
            "unsupported version",
            "component with known",
            "third-party component"
        ]
    },

    // --------------------------------------------------
    // INFORMATION DISCLOSURE
    // --------------------------------------------------
    {
        category: "Information Disclosure",
        keywords: [
            "information disclosure",
            "information leak",
            "information leakage",
            "sensitive information",
            "sensitive data",
            "stack trace",
            "error message",
            "error disclosure",
            "internal information",
            "source code disclosure",
            "version disclosure",
            "server banner",
            "directory information",
            "comments in page"
        ]
    },

    // --------------------------------------------------
    // INPUT VALIDATION
    // --------------------------------------------------
    {
        category: "Input Validation",
        keywords: [
            "input validation",
            "improper input validation",
            "invalid input",
            "malformed input",
            "unvalidated input",
            "input reflection"
        ]
    },

    // --------------------------------------------------
    // IDENTIFICATION & AUTHENTICATION
    // --------------------------------------------------
    {
        category: "Identification & Authentication",
        keywords: [
            "account enumeration",
            "username enumeration",
            "user enumeration",
            "user identification",
            "username discovery"
        ]
    }
];


const categorizeFinding = (finding) => {

    // Combine multiple fields instead of checking only title.
    const text = [
        finding.title,
        finding.name,
        finding.alert,
        finding.description
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    for (const rule of categoryRules) {

        const matched = rule.keywords.some(keyword =>
            text.includes(keyword.toLowerCase())
        );

        if (matched) {
            return rule.category;
        }
    }

    return "Other";
};


const categorizeFindings = (findings = []) => {

    return findings.map(finding => ({
        ...finding,
        category: categorizeFinding(finding)
    }));

};


module.exports = {
    categorizeFinding,
    categorizeFindings
};