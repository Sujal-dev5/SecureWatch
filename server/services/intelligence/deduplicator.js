const createFingerprint = (finding) => {
    return [
        finding.title || "",
        finding.url || "",
        finding.method || "",
        finding.parameter || ""
    ]
        .map(value => value.toLowerCase().trim())
        .join("|");
};


const deduplicateFindings = (findings = []) => {
    const uniqueFindings = new Map();

    for (const finding of findings) {
        const fingerprint = createFingerprint(finding);

        if (uniqueFindings.has(fingerprint)) {
            const existingFinding = uniqueFindings.get(fingerprint);

            existingFinding.occurrences += 1;
        } else {
            uniqueFindings.set(fingerprint, {
                ...finding,
                findingId: fingerprint,
                occurrences: finding.occurrences || 1
            });
        }
    }

    return Array.from(uniqueFindings.values());
};


module.exports = {
    createFingerprint,
    deduplicateFindings
};