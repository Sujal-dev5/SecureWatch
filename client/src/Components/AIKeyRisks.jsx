function AIKeyRisks({ risks = [] }) {
  return (
    <section className="card ai-card">
      <div className="ai-card-header">
        <div>
          <span className="ai-label">
            PRIORITY FINDINGS
          </span>

          <h2>Key Risks</h2>
        </div>
      </div>

      {risks.length === 0 ? (
        <p className="empty-state">
          No key risks identified.
        </p>
      ) : (
        <div className="ai-risk-list">
          {risks.map((risk, index) => (
            <article
              className="ai-risk-item"
              key={index}
            >
              <div className="ai-risk-header">
                <div>
                  <h3>
                    {risk.title}
                  </h3>

                  <span
                    className={`ai-priority ai-priority-${risk.priority?.toLowerCase()}`}
                  >
                    Priority: {risk.priority}
                  </span>
                </div>
              </div>

              <div className="ai-risk-section">
                <h4>WHAT WAS FOUND</h4>

                <p>
                  {risk.whatWasFound}
                </p>
              </div>

              <div className="ai-risk-section">
                <h4>TECHNICAL EXPLANATION</h4>

                <p>
                  {risk.technicalExplanation}
                </p>
              </div>

              <div className="ai-risk-section">
                <h4>WHY IT MATTERS</h4>

                <p>
                  {risk.whyItMatters}
                </p>
              </div>

              <div className="ai-risk-section ai-simple-example">
                <h4>SIMPLE EXAMPLE</h4>

                <p>
                  {risk.simpleExample}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default AIKeyRisks;