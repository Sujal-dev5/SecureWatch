import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../Services/api";

const ScanHistory = () => {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        fetchScans();
    }, []);

    const fetchScans = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/scans");

            setScans(response.data.scans || []);
        } catch (error) {
            console.error(
                "Failed to load scan history:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load scan history"
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        return new Date(date).toLocaleString();
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "completed":
                return "status-completed";

            case "running":
                return "status-running";

            case "cancelled":
                return "status-cancelled";

            case "failed":
                return "status-failed";

            case "pending":
                return "status-pending";

            default:
                return "";
        }
    };

    const getHealthScore = async (scanId) => {
        try {
            const response = await api.get(
                `/scans/${scanId}/intelligence`
            );

            return response.data.healthScore ?? null;
        } catch (error) {
            console.error(
                `Failed to load intelligence for scan ${scanId}:`,
                error
            );

            return null;
        }
    };

    const handleViewScan = (scanId) => {
        navigate(`/scans/${scanId}`);
    };

    if (loading) {
        return (
            <div className="page-container">
                <h1>Scan History</h1>
                <p>Loading scan history...</p>
            </div>
        );
    }

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>Scan History</h1>

                    <p>
                        Review previous security scans and
                        vulnerability results.
                    </p>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {!error && scans.length === 0 && (
                <div className="empty-state">
                    <h3>No scans yet</h3>

                    <p>
                        Start a security scan from the
                        Websites page.
                    </p>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                            navigate("/websites")
                        }
                    >
                        Go to Websites
                    </button>
                </div>
            )}

            {scans.length > 0 && (
                <div className="scan-history-container">

                    {scans.map((scan) => (
                        <ScanHistoryCard
                            key={scan._id}
                            scan={scan}
                            formatDate={formatDate}
                            getStatusClass={getStatusClass}
                            getHealthScore={getHealthScore}
                            onView={handleViewScan}
                        />
                    ))}

                </div>
            )}

        </div>
    );
};


// --------------------------------------------------
// Scan History Card
// --------------------------------------------------

const ScanHistoryCard = ({
    scan,
    formatDate,
    getStatusClass,
    getHealthScore,
    onView,
}) => {

    const [healthScore, setHealthScore] = useState(null);
    const [loadingHealth, setLoadingHealth] =
        useState(false);

    useEffect(() => {

        if (scan.status !== "completed") {
            return;
        }

        const loadHealthScore = async () => {

            setLoadingHealth(true);

            const score =
                await getHealthScore(scan._id);

            setHealthScore(score);

            setLoadingHealth(false);
        };

        loadHealthScore();

    }, [scan._id, scan.status]);


    return (
        <div className="scan-history-item">

            {/* Website / Scan Information */}

            <div className="scan-history-info">

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
                    {scan.websiteId?.url || "—"}
                </div>

                <div className="scan-history-date">
                    Scanned:{" "}
                    {formatDate(scan.createdAt)}
                </div>

            </div>


            {/* Health Score */}

            <div className="scan-history-stat">

                <span>Health Score</span>

                {scan.status !== "completed" ? (
                    <strong>—</strong>
                ) : loadingHealth ? (
                    <strong>...</strong>
                ) : (
                    <strong>
                        {healthScore !== null
                            ? `${healthScore}/100`
                            : "—"}
                    </strong>
                )}

            </div>


            {/* Findings */}

            <div className="scan-history-stat">

                <span>Findings</span>

                <strong>
                    {scan.vulnerabilities ?? 0}
                </strong>

            </div>


            {/* Status */}

            <div className="scan-history-stat">

                <span>Progress</span>

                <strong>
                    {scan.progress ?? 0}%
                </strong>

            </div>


            {/* View */}

            <div className="scan-history-action">

                <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                        onView(scan._id)
                    }
                >
                    View Details
                </button>

            </div>

        </div>
    );
};

export default ScanHistory;