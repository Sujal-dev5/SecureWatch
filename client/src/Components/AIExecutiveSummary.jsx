function AIExecutiveSummary({ summary }) {
  return (
    <section className="card ai-card">
      <div className="ai-card-header">
        <div>
          <span className="ai-label">
            AI SECURITY ANALYSIS
          </span>

          <h2>Executive Summary</h2>
        </div>
      </div>

      <div className="ai-summary-section">
        <h3>Overview</h3>

        <p className="ai-summary-text">
          {summary?.overview}
        </p>
      </div>

      <div className="ai-summary-section">
        <h3>Main Concern</h3>

        <p className="ai-summary-text">
          {summary?.mainConcern}
        </p>
      </div>

      <div className="ai-summary-section">
        <h3>What to Focus On</h3>

        {Array.isArray(summary?.focusAreas) &&
        summary.focusAreas.length > 0 ? (
          <ol className="ai-focus-list">
            {summary.focusAreas.map(
              (area, index) => (
                <li key={index}>
                  {area}
                </li>
              )
            )}
          </ol>
        ) : (
          <p className="ai-summary-text">
            No specific focus areas were identified.
          </p>
        )}
      </div>
    </section>
  );
}

export default AIExecutiveSummary;
