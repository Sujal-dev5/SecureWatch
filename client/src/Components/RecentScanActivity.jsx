import { Link } from "react-router-dom";

function RecentScanActivity({ scans = [] }) {
  const recentScans = scans.slice(0, 5);

  if (!recentScans.length) {
    return (
      <div className="card recent-scan-activity">
        <div className="card-header">
          <div>
            <h2>Recent Scan Activity</h2>

            <p>
              Your latest security scan activity.
            </p>
          </div>
        </div>

        <p className="empty-state">
          No scans available yet.
        </p>
      </div>
    );
  }

  return (
    <section className="dashboard-section">

      <div className="section-header">

        <div>
          <h2>
            Recent Scan Activity
          </h2>

          <p>
            Your latest security scan activity.
          </p>
        </div>

        <Link
          to="/scans"
          className="section-link"
        >
          View All
        </Link>

      </div>

      <div className="recent-scan-list">

        {recentScans.map((scan) => {

          const websiteName =
            scan.websiteId?.name ||
            "Unknown Website";

          const websiteUrl =
            scan.websiteId?.url ||
            "";

          const vulnerabilityCount =
            scan.vulnerabilities || 0;

          return (
            <div
              key={scan._id}
              className="recent-scan-item"
            >

              <div className="recent-scan-main">

                <div className="recent-scan-icon">
                  ✓
                </div>

                <div className="recent-scan-info">

                  <strong>
                    {websiteName}
                  </strong>

                  <span>
                    {websiteUrl}
                  </span>

                  <small>
                    {scan.completedAt
                      ? new Date(
                          scan.completedAt
                        ).toLocaleString()
                      : "Date unavailable"}
                  </small>

                </div>

              </div>

              <div className="recent-scan-meta">

                <span className="scan-status completed">
                  Completed
                </span>

                <strong>
                  {vulnerabilityCount.toLocaleString()}
                </strong>

                <span>
                  vulnerabilities
                </span>

                <Link
                  to={`/scans/${scan._id}`}
                  className="recent-scan-view"
                >
                  View
                </Link>

              </div>

            </div>
          );
        })}

      </div>

    </section>
  );
}

export default RecentScanActivity;