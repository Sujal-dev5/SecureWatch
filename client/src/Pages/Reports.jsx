import { useEffect, useState } from "react";
import api from "../Services/api";

function Reports() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get("/scans");

        const completedScans = (
          response.data.scans || []
        ).filter(
          (scan) => scan.status === "completed"
        );

        setScans(completedScans);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load reports"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // --------------------------------------------------
  // Download PDF Security Report
  // --------------------------------------------------

  const downloadReport = async (scan) => {
    try {
      setDownloadingId(scan._id);
      setError("");

      const response = await api.get(
        `/reports/${scan._id}/pdf`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type: "application/pdf",
        }
      );

      const downloadUrl =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = downloadUrl;

      const websiteName =
        scan.websiteId?.name ||
        "security-report";

      const safeWebsiteName =
        websiteName.replace(
          /[^a-z0-9-_]/gi,
          "_"
        );

      link.download =
        `SecureWatch_${safeWebsiteName}_Security_Report.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(
        downloadUrl
      );

    } catch (error) {
      console.error(
        "Download security report error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to download security report"
      );

    } finally {
      setDownloadingId(null);
    }
  };


  // --------------------------------------------------
  // Total Raw Findings
  // --------------------------------------------------

  const totalRawFindings = scans.reduce(
    (total, scan) =>
      total + (scan.vulnerabilities || 0),
    0
  );


  // --------------------------------------------------
  // Health Class
  // --------------------------------------------------

  const getHealthClass = (status) => {
    switch (status) {

      case "Healthy":
        return "report-health-healthy";

      case "Moderate":
        return "report-health-moderate";

      case "At Risk":
        return "report-health-risk";

      case "Critical":
        return "report-health-critical";

      default:
        return "health-unknown";
    }
  };


  return (
    <div className="page">

      {/* --------------------------------------------- */}
      {/* PAGE HEADER */}
      {/* --------------------------------------------- */}

      <div className="page-header">

        <h1>
          Reports
        </h1>

        <p className="page-subtitle">
          Review completed website security assessments
          and vulnerability intelligence.
        </p>

      </div>


      {/* --------------------------------------------- */}
      {/* ERROR */}
      {/* --------------------------------------------- */}

      {error && (
        <div className="alert error-alert">
          {error}
        </div>
      )}


      {loading ? (

        <section className="card">

          <p className="empty-state">
            Loading reports...
          </p>

        </section>

      ) : (

        <>

          {/* ----------------------------------------- */}
          {/* SUMMARY STATISTICS */}
          {/* ----------------------------------------- */}

          <section className="dashboard-grid">

            <div className="stat-card">

              <span className="stat-label">
                Completed Scans
              </span>

              <strong className="stat-value">
                {scans.length}
              </strong>

            </div>


            <div className="stat-card">

              <span className="stat-label">
                Total Raw Findings
              </span>

              <strong className="stat-value">
                {totalRawFindings}
              </strong>

            </div>

          </section>


          {/* ----------------------------------------- */}
          {/* SECURITY REPORTS */}
          {/* ----------------------------------------- */}

          <section className="card">

            <div className="card-header">

              <h2>
                Security Reports
              </h2>

              <p>
                Results from completed security
                assessments.
              </p>

            </div>


            {scans.length === 0 ? (

              <p className="empty-state">
                No completed scan reports available
                yet.
              </p>

            ) : (

              <div className="website-list reports-list">

                {scans.map((scan) => {

                  const severity =
                    scan.severityCounts || {};

                  const healthScore =
                    scan.healthScore;

                  const healthStatus =
                    scan.healthStatus ||
                    "Unknown";

                  const healthClass =
                    getHealthClass(
                      healthStatus
                    );


                  return (

                    <div
                      className="website-item"
                      key={scan._id}
                    >

                      {/* -------------------------------- */}
                      {/* WEBSITE INFORMATION */}
                      {/* -------------------------------- */}

                      <div className="website-info">

                        <strong>
                          {scan.websiteId?.name ||
                            "Unknown Website"}
                        </strong>

                        <span>
                          {scan.websiteId?.url ||
                            "URL unavailable"}
                        </span>

                        <span>
                          Raw Findings:{" "}

                          <strong>
                            {scan.vulnerabilities ||
                              0}
                          </strong>

                        </span>

                        <span>
                          Completed:{" "}

                          {scan.completedAt
                            ? new Date(
                                scan.completedAt
                              ).toLocaleString()
                            : "N/A"}

                        </span>

                      </div>


                      {/* -------------------------------- */}
                      {/* SECURITY HEALTH */}
                      {/* -------------------------------- */}

                      <div className="report-health">

                        <span className="report-health-label">
                          Security Health
                        </span>

                        <strong
                          className={`report-health-value ${healthClass}`}
                        >
                          {healthScore !== null &&
                          healthScore !== undefined
                            ? `${healthScore} / 100`
                            : "N/A"}
                        </strong>

                        <span
                          className={`report-health-value ${healthClass}`}
                        >
                          {healthStatus}
                        </span>

                      </div>


                      {/* -------------------------------- */}
                      {/* SEVERITY SUMMARY */}
                      {/* -------------------------------- */}

                      <div className="report-severity">

                        <span>
                          High:{" "}

                          <strong>
                            {severity.high || 0}
                          </strong>

                        </span>

                        <span>
                          Medium:{" "}

                          <strong>
                            {severity.medium || 0}
                          </strong>

                        </span>

                        <span>
                          Low:{" "}

                          <strong>
                            {severity.low || 0}
                          </strong>

                        </span>

                        <span>
                          Info:{" "}

                          <strong>
                            {severity.informational ||
                              0}
                          </strong>

                        </span>

                      </div>


                      {/* -------------------------------- */}
                      {/* ACTIONS */}
                      {/* -------------------------------- */}

                      <div className="report-actions">

                        <a
                          href={`/scans/${scan._id}/intelligence`}
                          className="report-intelligence-link"
                        >
                          View Security Intelligence
                        </a>


                        <button
                          type="button"
                          className="report-download-link"
                          onClick={() =>
                            downloadReport(scan)
                          }
                          disabled={
                            downloadingId ===
                            scan._id
                          }
                        >
                          {downloadingId ===
                          scan._id
                            ? "Generating PDF..."
                            : "Download PDF"}
                        </button>

                      </div>

                    </div>

                  );

                })}

              </div>

            )}

          </section>

        </>

      )}

    </div>
  );
}

export default Reports;