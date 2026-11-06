import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../Services/api";

function Scans() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const fetchScans = async () => {
    try {
      setError("");

      const response = await api.get("/scans");

      setScans(response.data.scans || []);
    } catch (error) {
      console.error("Failed to load scans:", error);

      setError(
        error.response?.data?.message ||
        "Failed to load scans"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  // ----------------------------------------------
  // Status styling
  // ----------------------------------------------

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "status-completed";

      case "running":
        return "status-running";

      case "pending":
        return "status-pending";

      case "cancelled":
        return "status-cancelled";

      case "failed":
        return "status-failed";

      default:
        return "";
    }
  };

  // ----------------------------------------------
  // Format date
  // ----------------------------------------------

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString();
  };

  // ----------------------------------------------
  // Calculate scan duration
  // ----------------------------------------------

  const getDuration = (scan) => {
    if (!scan.startedAt) {
      return "—";
    }

    const start = new Date(scan.startedAt);

    const end = scan.completedAt
      ? new Date(scan.completedAt)
      : null;

    if (!end) {
      return scan.status === "running"
        ? "In progress"
        : "—";
    }

    const durationMs = end - start;

    if (durationMs < 1000) {
      return "< 1 sec";
    }

    const totalSeconds = Math.floor(
      durationMs / 1000
    );

    const minutes = Math.floor(
      totalSeconds / 60
    );

    const seconds = totalSeconds % 60;

    if (minutes === 0) {
      return `${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
  };

  // ----------------------------------------------
  // View scan details
  // ----------------------------------------------

  const handleViewDetails = (scanId) => {
    navigate(`/scans/${scanId}`);
  };

  return (
    <div className="page">

      {/* ----------------------------------------
          Page Header
      ---------------------------------------- */}

      <div className="page-header">

        <h1>Scans</h1>

        <p className="page-subtitle">
          View your website security scan history.
        </p>

      </div>


      {/* ----------------------------------------
          Error
      ---------------------------------------- */}

      {error && (
        <div className="alert error-alert">
          {error}
        </div>
      )}


      {/* ----------------------------------------
          Scan History
      ---------------------------------------- */}

      <section className="card">

        <div className="card-header">

          <h2>Scan History</h2>

          <p>
            Review previous security scans and
            vulnerability assessment results.
          </p>

        </div>


        {/* Loading */}

        {loading ? (

          <p className="empty-state">
            Loading scans...
          </p>

        ) : scans.length === 0 ? (

          /* Empty */

          <div className="empty-state">

            <p>
              No scans found. Add a website and
              start a security scan.
            </p>

          </div>

        ) : (

          /* Scan List */

          <div className="scan-history-list">

            {scans.map((scan) => (

              <div
                className="scan-history-card"
                key={scan._id}
              >

                {/* --------------------------------
                    Main Information
                -------------------------------- */}

                <div className="scan-history-main">

                  <div className="scan-history-title">

                    <strong>
                      {scan.websiteId?.name ||
                        "Unknown Website"}
                    </strong>

                    <span
                      className={`scan-status ${getStatusClass(
                        scan.status
                      )}`}
                    >
                      {scan.status}
                    </span>

                  </div>


                  <div className="scan-history-url">

                    {scan.websiteId?.url ||
                      "URL unavailable"}

                  </div>


                  <div className="scan-history-date">

                    Scanned:{" "}
                    {formatDate(
                      scan.startedAt ||
                        scan.createdAt
                    )}

                  </div>

                </div>


                {/* --------------------------------
                    Scan Statistics
                -------------------------------- */}

                <div className="scan-history-stats">

                  <div className="scan-history-stat">

                    <span>Findings</span>

                    <strong>
                      {scan.vulnerabilities ?? 0}
                    </strong>

                  </div>


                  <div className="scan-history-stat">

                    <span>Progress</span>

                    <strong>
                      {scan.progress ?? 0}%
                    </strong>

                  </div>


                  <div className="scan-history-stat">

                    <span>Duration</span>

                    <strong>
                      {getDuration(scan)}
                    </strong>

                  </div>

                </div>


                {/* --------------------------------
                    Timing / Error
                -------------------------------- */}

                <div className="scan-history-meta">

                  <div>

                    <span>Started</span>

                    <strong>
                      {formatDate(
                        scan.startedAt
                      )}
                    </strong>

                  </div>


                  {scan.completedAt && (

                    <div>

                      <span>Completed</span>

                      <strong>
                        {formatDate(
                          scan.completedAt
                        )}
                      </strong>

                    </div>

                  )}


                  {scan.errorMessage && (

                    <div className="scan-history-error">

                      <span>Error</span>

                      <strong>
                        {scan.errorMessage}
                      </strong>

                    </div>

                  )}

                </div>


                {/* --------------------------------
                    Action
                -------------------------------- */}

                <div className="scan-history-action">

                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      handleViewDetails(
                        scan._id
                      )
                    }
                  >
                    View Details
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}

export default Scans;