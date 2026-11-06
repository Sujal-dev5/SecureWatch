function WebsiteSecurityCard({ website }) {
  if (!website) {
    return null;
  }

  const {
    name,
    url,
    monitoring,
    lastScan,
    healthScore,
    healthStatus,
    severity,
  } = website;

  const getHealthClass = (status) => {
    switch (status) {
      case "Healthy":
        return "health-healthy";

      case "Moderate":
        return "health-moderate";

      case "At Risk":
        return "health-at-risk";

      case "Critical":
        return "health-critical";

      default:
        return "health-unknown";
    }
  };

  return (
    <div className="card website-security-card">
      {/* Website Header */}

      <div className="website-security-header">
        <div>
          <h3>{name}</h3>

          <p className="website-url">
            {url}
          </p>
        </div>

        <span
          className={`health-status ${getHealthClass(
            healthStatus
          )}`}
        >
          {healthStatus}
        </span>
      </div>

      {/* Health Score */}

      <div className="website-health-section">
        <span className="stat-label">
          Security Health Score
        </span>

        <strong className="website-health-score">
          {healthScore !== null
            ? `${healthScore}/100`
            : "N/A"}
        </strong>
      </div>

      {/* Severity Summary */}

      <div className="website-severity-grid">
        <div>
          <span>Critical</span>

          <strong>
            {severity?.critical || 0}
          </strong>
        </div>

        <div>
          <span>High</span>

          <strong>
            {severity?.high || 0}
          </strong>
        </div>

        <div>
          <span>Medium</span>

          <strong>
            {severity?.medium || 0}
          </strong>
        </div>

        <div>
          <span>Low</span>

          <strong>
            {severity?.low || 0}
          </strong>
        </div>

        <div>
          <span>Info</span>

          <strong>
            {severity?.informational || 0}
          </strong>
        </div>
      </div>

      {/* Last Scan */}

      <div className="website-scan-info">
        <div>
          <span className="stat-label">
            Last Scan
          </span>

          <strong>
            {lastScan
              ? new Date(
                  lastScan.completedAt
                ).toLocaleString()
              : "Never scanned"}
          </strong>
        </div>

        <div>
          <span className="stat-label">
            Vulnerabilities
          </span>

          <strong>
            {lastScan
              ? lastScan.vulnerabilities
              : 0}
          </strong>
        </div>
      </div>

      {/* Monitoring */}

      <div className="website-monitoring-info">
        <span className="stat-label">
          Monitoring
        </span>

        <strong>
          {monitoring?.enabled
            ? `Enabled (${monitoring.frequency})`
            : "Disabled"}
        </strong>
      </div>
    </div>
  );
}

export default WebsiteSecurityCard;