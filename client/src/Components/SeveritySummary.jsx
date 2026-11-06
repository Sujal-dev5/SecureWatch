function SeveritySummary({ summary }) {
    return (
        <section>

            <h2>Priority Summary</h2>

            <div>

                <p>
                    <strong>Critical:</strong>{" "}
                    {summary?.critical || 0}
                </p>

                <p>
                    <strong>High:</strong>{" "}
                    {summary?.high || 0}
                </p>

                <p>
                    <strong>Medium:</strong>{" "}
                    {summary?.medium || 0}
                </p>

                <p>
                    <strong>Low:</strong>{" "}
                    {summary?.low || 0}
                </p>

                <p>
                    <strong>Informational:</strong>{" "}
                    {summary?.informational || 0}
                </p>

            </div>

        </section>
    );
}


export default SeveritySummary;