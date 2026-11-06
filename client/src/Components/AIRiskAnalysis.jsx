function AIRiskAnalysis({ overallRisk, healthScore, healthStatus }) {
  return (
    <section className="card ai-card">
      <div className="ai-card-header">
        <div>
          <span className="ai-label">RISK ASSESSMENT</span>

          <h2>Overall Risk</h2>
        </div>
      </div>

      <div className="ai-risk-layout">
        <div className="ai-risk-score">
          <span>{healthScore}</span>

          <small>/100</small>
        </div>

        <div>
          <div
            className={`ai-risk-badge ${overallRisk
              ?.toLowerCase()
              .replace(/\s+/g, "-")}`}
          >
            {overallRisk}
          </div>

          <p className="ai-status-text">
            VIE Health Status: <strong>{healthStatus}</strong>
          </p>
        </div>
      </div>
    </section>
  );
}

export default AIRiskAnalysis;
