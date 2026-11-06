const MAX_HIGH_MEDIUM_FINDINGS = 20;
const MAX_LOW_FINDINGS = 5;


const truncate = (
    text,
    maxLength = 500
) => {

    if (!text) {
        return "";
    }


    const value =
        String(text);


    if (
        value.length <= maxLength
    ) {
        return value;
    }


    return (
        value.substring(
            0,
            maxLength
        ) + "..."
    );
};


const buildAIContext = ({
    healthScore,
    healthStatus,
    summary,
    findings = [],
    correlations = [],
    changes = {}
}) => {


    // --------------------------------------------------
    // Sort findings by priority score
    // --------------------------------------------------

    const sortedFindings =
        [...findings].sort(
            (a, b) =>
                (b.priorityScore || 0) -
                (a.priorityScore || 0)
        );


    // --------------------------------------------------
    // Important findings
    // --------------------------------------------------

    const importantFindings =
        sortedFindings.filter(
            (finding) =>
                [
                    "Critical",
                    "High",
                    "Medium"
                ].includes(
                    finding.priority
                )
        );


    // --------------------------------------------------
    // Low priority findings
    // --------------------------------------------------

    const lowFindings =
        sortedFindings.filter(
            (finding) =>
                finding.priority === "Low"
        );


    const selectedFindings = [

        ...importantFindings.slice(
            0,
            MAX_HIGH_MEDIUM_FINDINGS
        ),

        ...lowFindings.slice(
            0,
            MAX_LOW_FINDINGS
        )

    ];


    // --------------------------------------------------
    // Build compact finding objects
    // --------------------------------------------------

    const aiFindings =
        selectedFindings.map(
            (finding) => ({

                title:
                    finding.title,

                category:
                    finding.category,

                severity:
                    finding.severity,

                priority:
                    finding.priority,

                priorityScore:
                    finding.priorityScore,

                confidence:
                    finding.confidence,

                occurrences:
                    finding.occurrences || 1,

                affectedEndpoints:
                    finding.affectedEndpoints || 0,

                description:
                    truncate(
                        finding.description,
                        400
                    ),

                evidence:
                    truncate(
                        finding.evidence,
                        300
                    ),

                remediation:
                    truncate(
                        finding.remediation ||
                        finding.solution,
                        400
                    )
            })
        );


    // --------------------------------------------------
    // Return AI context
    // --------------------------------------------------

    return {

        scan: {
            healthScore,
            healthStatus
        },


        summary: {

            critical:
                summary?.critical || 0,

            high:
                summary?.high || 0,

            medium:
                summary?.medium || 0,

            low:
                summary?.low || 0,

            informational:
                summary?.informational || 0
        },


        changes: {

            new:
                changes?.new || 0,

            resolved:
                changes?.resolved || 0,

            persistent:
                changes?.persistent || 0
        },


        findings:
            aiFindings,


        correlations:
            correlations
                .slice(0, 10)
                .map(
                    (correlation) => ({

                        title:
                            correlation.title,

                        description:
                            truncate(
                                correlation.description,
                                500
                            ),

                        findings:
                            correlation.findings ||
                            []
                    })
                )
    };
};


module.exports = {
    buildAIContext
};