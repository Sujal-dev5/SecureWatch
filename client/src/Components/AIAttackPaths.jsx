function AIAttackPaths({ attackPaths = [] }) {
  return (
    <section className="card ai-card">
      <div className="ai-card-header">
        <div>
          <span className="ai-label">
            SECURITY REASONING
          </span>

          <h2>Potential Attack Paths</h2>
        </div>
      </div>

      {attackPaths.length === 0 ? (
        <p className="empty-state">
          No potential attack paths identified.
        </p>
      ) : (
        <div className="ai-attack-list">
          {attackPaths.map((path, index) => (
            <article
              className="ai-attack-item"
              key={index}
            >
              <div className="ai-attack-header">
                <div>
                  <h3>{path.title}</h3>

                  <span className="ai-likelihood">
                    Likelihood: {path.likelihood}
                  </span>
                </div>
              </div>

              <div className="ai-attack-section">
                <h4>WHAT COULD HAPPEN</h4>

                <p>
                  {path.whatCouldHappen}
                </p>
              </div>

              <div className="ai-attack-section">
                <h4>TECHNICAL EXPLANATION</h4>

                <p>
                  {path.technicalExplanation}
                </p>
              </div>

              <div className="ai-attack-section ai-simple-example">
                <h4>SIMPLE EXAMPLE</h4>

                <p>
                  {path.simpleExample}
                </p>
              </div>

              {Array.isArray(path.findings) &&
              path.findings.length > 0 ? (
                <div className="ai-attack-section">
                  <h4>RELATED FINDINGS</h4>

                  <ul>
                    {path.findings.map(
                      (finding, findingIndex) => (
                        <li key={findingIndex}>
                          {finding}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default AIAttackPaths;
