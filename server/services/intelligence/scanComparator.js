const getFindingId = (finding) => {
    /*
     * For vulnerability comparison, we consider
     * the vulnerability type rather than the
     * individual occurrence/URL.
     *
     * Example:
     *
     * User Agent Fuzzer + Other
     *
     * is treated as ONE vulnerability even if
     * it appears on 100 different URLs.
     */

    const title = (
        finding.title ||
        finding.name ||
        finding.alert ||
        ""
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


const mergeFindings = (findings = []) => {

    const map = new Map();

    for (const finding of findings) {

        const findingId =
            getFindingId(finding);

        if (!map.has(findingId)) {

            map.set(findingId, {
                ...finding,

                findingId,

                occurrences:
                    finding.occurrences || 1,

                affectedEndpoints:
                    finding.url
                        ? [finding.url]
                        : []
            });

            continue;
        }

        const existing =
            map.get(findingId);

        /*
         * Combine occurrences
         */
        existing.occurrences +=
            finding.occurrences || 1;


        /*
         * Combine affected endpoints
         */
        if (finding.url) {

            if (
                !existing.affectedEndpoints.includes(
                    finding.url
                )
            ) {
                existing.affectedEndpoints.push(
                    finding.url
                );
            }
        }


        /*
         * Keep the highest priority
         * information for the vulnerability.
         */
        if (
            (finding.priorityScore || 0) >
            (existing.priorityScore || 0)
        ) {

            existing.severity =
                finding.severity ||
                existing.severity;

            existing.priority =
                finding.priority ||
                existing.priority;

            existing.priorityScore =
                finding.priorityScore ||
                existing.priorityScore;

            existing.confidence =
                finding.confidence ||
                existing.confidence;

            existing.description =
                finding.description ||
                existing.description;

            existing.evidence =
                finding.evidence ||
                existing.evidence;

            existing.solution =
                finding.solution ||
                existing.solution;

            existing.url =
                finding.url ||
                existing.url;

            existing.method =
                finding.method ||
                existing.method;

            existing.parameter =
                finding.parameter ||
                existing.parameter;
        }
    }

    return Array.from(map.values());
};


const compareScans = (
    previousFindings = [],
    currentFindings = []
) => {

    /*
     * Convert both scans into UNIQUE
     * vulnerability types.
     */
    const uniquePreviousFindings =
        mergeFindings(previousFindings);

    const uniqueCurrentFindings =
        mergeFindings(currentFindings);


    const previousMap = new Map();
    const currentMap = new Map();


    /*
     * Previous scan
     */
    for (
        const finding of uniquePreviousFindings
    ) {

        const findingId =
            getFindingId(finding);

        previousMap.set(
            findingId,
            finding
        );
    }


    /*
     * Current scan
     */
    for (
        const finding of uniqueCurrentFindings
    ) {

        const findingId =
            getFindingId(finding);

        currentMap.set(
            findingId,
            finding
        );
    }


    const newFindings = [];
    const resolvedFindings = [];
    const persistentFindings = [];


    /*
     * Find NEW and PERSISTENT vulnerabilities
     */
    for (
        const [findingId, finding]
        of currentMap
    ) {

        if (
            previousMap.has(findingId)
        ) {

            persistentFindings.push(
                finding
            );

        } else {

            newFindings.push(
                finding
            );
        }
    }


    /*
     * Find RESOLVED vulnerabilities
     */
    for (
        const [findingId, finding]
        of previousMap
    ) {

        if (
            !currentMap.has(findingId)
        ) {

            resolvedFindings.push(
                finding
            );
        }
    }


    return {

        newFindings,

        resolvedFindings,

        persistentFindings,

        summary: {
            new:
                newFindings.length,

            resolved:
                resolvedFindings.length,

            persistent:
                persistentFindings.length
        }
    };
};


module.exports = {
    getFindingId,
    mergeFindings,
    compareScans
};