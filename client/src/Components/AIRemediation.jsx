function AIRemediation({ remediation = [] }) {
  return (
    <section className="card ai-card">
      <div className="ai-card-header">
        <div>
          <span className="ai-label">
            RECOMMENDED ACTIONS
          </span>

          <h2>Remediation</h2>
        </div>
      </div>

      {remediation.length === 0 ? (
        <p className="empty-state">
          No remediation recommendations available.
        </p>
      ) : (
        <div className="ai-remediation-list">
          {remediation.map((item, index) => (
            <article
              className="ai-remediation-item"
              key={index}
            >
              <div className="ai-remediation-header">
                <div>
                  <h3>{item.title}</h3>

                  <span
                    className={`ai-priority ai-priority-${item.priority?.toLowerCase()}`}
                  >
                    Priority: {item.priority}
                  </span>
                </div>
              </div>

              <div className="ai-remediation-section">
                <h4>WHAT TO DO</h4>

                <p>
                  {item.whatToDo}
                </p>
              </div>

              <div className="ai-remediation-section">
                <h4>WHY IT MATTERS</h4>

                <p>
                  {item.whyItMatters}
                </p>
              </div>

              <div className="ai-remediation-section">
                <h4>TECHNICAL STEPS</h4>

                {Array.isArray(item.technicalSteps) &&
                item.technicalSteps.length > 0 ? (
                  <ol>
                    {item.technicalSteps.map(
                      (step, stepIndex) => (
                        <li key={stepIndex}>
                          {step}
                        </li>
                      )
                    )}
                  </ol>
                ) : (
                  <p>
                    No technical steps provided.
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default AIRemediation;
