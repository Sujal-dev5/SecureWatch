function IntelligenceCard({ finding }) {
    return (
        <article>

            <h3>
                {finding.title || "Unknown Vulnerability"}
            </h3>

            <p>
                <strong>Category:</strong>{" "}
                {finding.category || "Other"}
            </p>

            <p>
                <strong>Severity:</strong>{" "}
                {finding.severity || "Unknown"}
            </p>

            <p>
                <strong>Confidence:</strong>{" "}
                {finding.confidence || "Unknown"}
            </p>

            <p>
                <strong>Priority:</strong>{" "}
                {finding.priority || "Informational"}
            </p>

            <p>
                <strong>Priority Score:</strong>{" "}
                {finding.priorityScore ?? "N/A"}
            </p>

            <p>
                <strong>Occurrences:</strong>{" "}
                {finding.occurrences || 1}
            </p>

            <p>
                <strong>URL:</strong>{" "}
                {finding.url || "N/A"}
            </p>

        </article>
    );
}


export default IntelligenceCard;