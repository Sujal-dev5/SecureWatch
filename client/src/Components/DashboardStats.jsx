function DashboardStats({ overview }) {
  if (!overview) {
    return null;
  }

  const {
    totalWebsites,
    totalScans,
    totalVulnerabilities,
    severity,
  } = overview;

  return (
    <section className="dashboard-grid">
      <div className="stat-card">
        <span className="stat-label">Websites</span>

        <strong className="stat-value">
          {totalWebsites}
        </strong>
      </div>

      <div className="stat-card">
        <span className="stat-label">Completed Scans</span>

        <strong className="stat-value">
          {totalScans}
        </strong>
      </div>

      <div className="stat-card">
        <span className="stat-label">Vulnerabilities</span>

        <strong className="stat-value">
          {totalVulnerabilities}
        </strong>
      </div>

      <div className="stat-card">
        <span className="stat-label">High Risk</span>

        <strong className="stat-value">
          {(severity?.critical || 0) + (severity?.high || 0)}
        </strong>
      </div>
    </section>
  );
}

export default DashboardStats;