import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../Services/api";

import { useAuth } from "../context/AuthContext";
import DashboardStats from "../Components/DashboardStats";
import WebsiteSecurityCard from "../Components/WebsiteSecurityCard";
import VulnerabilitySummary from "../Components/VulnerabilitySummary";
import SecurityTrendChart from "../Components/SecurityTrendChart";
import RecentScanActivity from "../Components/RecentScanActivity";

function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [overview, setOverview] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [recentScans, setRecentScans] = useState([]);

  const [selectedWebsiteId, setSelectedWebsiteId] = useState("");
  const [trends, setTrends] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendError, setTrendError] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // Load Dashboard Data
  // --------------------------------------------------

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [
          profileResponse,
          overviewResponse,
          websitesResponse,
          scansResponse,
        ] = await Promise.all([
          api.get("/users/profile"),
          api.get("/dashboard/overview"),
          api.get("/dashboard/websites"),
          api.get("/scans?limit=5"),
        ]);

        setProfile(profileResponse.data.user);
        setOverview(overviewResponse.data);
        setRecentScans(scansResponse.data.scans || []);

        const websiteData =
          websitesResponse.data.websites || [];

        setWebsites(websiteData);

        // Select the first website automatically
        if (websiteData.length > 0) {
          setSelectedWebsiteId(
            websiteData[0]._id
          );
        }
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // --------------------------------------------------
  // Load Security Health Trend
  // --------------------------------------------------

  useEffect(() => {
    if (!selectedWebsiteId) {
      setTrends([]);
      return;
    }

    const fetchSecurityTrend = async () => {
      try {
        setTrendLoading(true);
        setTrendError("");

        const response = await api.get(
          `/dashboard/trends/${selectedWebsiteId}`
        );

        setTrends(
          response.data.trends || []
        );
      } catch (error) {
        setTrendError(
          error.response?.data?.message ||
            "Failed to load security trend"
        );

        setTrends([]);
      } finally {
        setTrendLoading(false);
      }
    };

    fetchSecurityTrend();
  }, [selectedWebsiteId]);

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="page">

      {/* ---------------------------------------------
          Page Header
      --------------------------------------------- */}

      <div className="page-header">
        <h1>Security Dashboard</h1>

        <p className="page-subtitle">
          Monitor your websites and review their security posture.
        </p>
      </div>

      {/* ---------------------------------------------
          Loading
      --------------------------------------------- */}

      {loading && (
        <div className="card">
          <p className="empty-state">
            Loading dashboard...
          </p>
        </div>
      )}

      {/* ---------------------------------------------
          Global Error
      --------------------------------------------- */}

      {error && (
        <div className="alert error-alert">
          {error}
        </div>
      )}

      {/* ---------------------------------------------
          Dashboard Content
      --------------------------------------------- */}

      {!loading && !error && (
        <>

         {/* =========================================
            Welcome
          ========================================= */}

               <section className="dashboard-welcome">

                 <div>
                   <span className="dashboard-welcome-label">
                      SECUREWATCH AI
                   </span>

                    <h1>
                       Welcome back, {user?.name || profile?.name || "User"} 👋
                    </h1>

                     <p>
                       Here's your security overview for today.
                       Monitor your websites and stay ahead of vulnerabilities.
                     </p>
                  </div>

                </section>

          {/* =========================================
              Dashboard Statistics
          ========================================= */}

          <DashboardStats
            overview={overview}
          />


          {/* =========================================
              Vulnerability Overview
          ========================================= */}

          <VulnerabilitySummary
            severity={overview?.severity}
          />


          {/* =========================================
              Security Health Trend
          ========================================= */}

          <section className="dashboard-section">

            <div className="section-header">

              <div>
                <h2>
                  Security Health Trend
                </h2>

                <p>
                  Track how your website security
                  health changes across scans.
                </p>
              </div>

              {websites.length > 0 && (
                <select
                  value={selectedWebsiteId}
                  onChange={(event) =>
                    setSelectedWebsiteId(
                      event.target.value
                    )
                  }
                  className="dashboard-website-select"
                >
                  {websites.map((website) => (
                    <option
                      key={website._id}
                      value={website._id}
                    >
                      {website.name}
                    </option>
                  ))}
                </select>
              )}

            </div>

            <div className="card security-trend-card">

              {trendLoading && (
                <p className="empty-state">
                  Loading security trend...
                </p>
              )}

              {trendError && (
                <div className="alert error-alert">
                  {trendError}
                </div>
              )}

              {!trendLoading &&
                !trendError && (
                  <SecurityTrendChart
                    trends={trends}
                  />
                )}

            </div>

          </section>


          {/* =========================================
              Website Security
          ========================================= */}

          <section className="dashboard-section">

            <div className="section-header">

              <div>
                <h2>
                  Website Security
                </h2>

                <p>
                  Security posture of your monitored websites.
                </p>
              </div>

              <Link
                to="/websites"
                className="section-link"
              >
                Manage Websites
              </Link>

            </div>

            {websites.length === 0 ? (
              <div className="card">

                <p className="empty-state">
                  No websites added yet.
                </p>

              </div>
            ) : (
              <div className="website-security-grid">

                {websites.map((website) => (
                  <WebsiteSecurityCard
                    key={website._id}
                    website={website}
                  />
                ))}

              </div>
            )}

          </section>

          {/* =========================================
              Recent Scan Activity
          ========================================= */}

          <RecentScanActivity
            scans={recentScans}
          />

          {/* =========================================
              Latest Scan
          ========================================= */}

          <section className="card latest-scan-card">

  <div className="card-header">

    <h2>
      Latest Scan
    </h2>

    <p>
      Most recently completed security scan.
    </p>

  </div>

  {overview?.latestScan ? (

    <div className="latest-scan-content">

      <div className="latest-scan-layout">

        {/* ---------------------------------
            Website
        --------------------------------- */}

        <div className="latest-scan-stat">

          <span>
            Website
          </span>

          <strong>
            {websites.find(
              (website) =>
                website._id ===
                overview.latestScan.websiteId
            )?.name || "Unknown Website"}
          </strong>

        </div>


        {/* ---------------------------------
            Status
        --------------------------------- */}

        <div className="latest-scan-stat">

          <span>
            Status
          </span>

          <strong className="latest-scan-status">
            Completed
          </strong>

        </div>


        {/* ---------------------------------
            Vulnerabilities
        --------------------------------- */}

        <div className="latest-scan-stat">

          <span>
            Vulnerabilities
          </span>

          <strong>
            {(
              overview.latestScan
                .vulnerabilities || 0
            ).toLocaleString()}
          </strong>

        </div>


        {/* ---------------------------------
            Completed
        --------------------------------- */}

        <div className="latest-scan-stat">

          <span>
            Completed
          </span>

          <strong>
            {new Date(
              overview.latestScan
                .completedAt
            ).toLocaleString()}
          </strong>

        </div>

      </div>


      {/* ---------------------------------
          View Scan
      --------------------------------- */}

      <div className="latest-scan-action">

        <Link
          to={`/scans/${overview.latestScan.scanId}`}
          className="primary-button"
        >
          View Scan Results
        </Link>

      </div>

    </div>

  ) : (

    <p className="empty-state">
      No completed scans yet.
    </p>

  )}

</section>


          {/* =========================================
              Account
          ========================================= */}

          <section className="card">

            <div className="card-header">

              <h2>
                Account
              </h2>

              <p>
                Your authenticated SecureWatch AI account.
              </p>

            </div>

            <div className="account-info">

              <div>

                <span className="stat-label">
                  Account Status
                </span>

                <strong className="stat-value">
                  Active
                </strong>

              </div>

              <div>

                <span className="stat-label">
                  Authentication
                </span>

                <strong className="stat-value">
                  Secured
                </strong>

              </div>

              <div>

                <span className="stat-label">
                  User ID
                </span>

                <strong className="stat-value stat-value-small">
                  {profile?._id || "N/A"}
                </strong>

              </div>

            </div>

          </section>


          {/* =========================================
              Quick Actions
          ========================================= */}

          <section className="card">

            <div className="card-header">

              <h2>
                Quick Actions
              </h2>

              <p>
                Manage your websites and security workflow.
              </p>

            </div>

            <div className="quick-actions">

              <Link
                to="/websites"
                className="action-card"
              >
                <strong>
                  Manage Websites
                </strong>

                <span>
                  Add or remove websites from your workspace.
                </span>
              </Link>


              <Link
                to="/scans"
                className="action-card"
              >
                <strong>
                  View Scans
                </strong>

                <span>
                  Review your website scan history.
                </span>
              </Link>


              <Link
                to="/reports"
                className="action-card"
              >
                <strong>
                  View Reports
                </strong>

                <span>
                  Access vulnerability reports.
                </span>
              </Link>


              <Link
                to="/monitoring"
                className="action-card"
              >
                <strong>
                  Continuous Monitoring
                </strong>

                <span>
                  Manage automated security monitoring.
                </span>
              </Link>

            </div>

          </section>

        </>
      )}

    </div>
  );
}

export default Dashboard;