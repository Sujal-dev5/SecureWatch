function AIBusinessImpact({ impacts = [] }) {
  return (
    <section className="card ai-card">
      <div className="ai-card-header">
        <div>
          <span className="ai-label">
            IMPACT ASSESSMENT
          </span>

          <h2>Business Impact</h2>
        </div>
      </div>

      {impacts.length === 0 ? (
        <p className="empty-state">
          No business impacts identified.
        </p>
      ) : (
        <div className="ai-impact-list">
          {impacts.map((item, index) => (
            <article
              className="ai-impact-item"
              key={index}
            >
              <div className="ai-impact-section">
                <h3>IMPACT</h3>

                <p>
                  {item.impact}
                </p>
              </div>

              <div className="ai-impact-section">
                <h3>EXPLANATION</h3>

                <p>
                  {item.explanation}
                </p>
              </div>

              <div className="ai-impact-section ai-simple-example">
                <h3>SIMPLE EXAMPLE</h3>

                <p>
                  {item.simpleExample}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default AIBusinessImpact;