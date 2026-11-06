import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../Services/api";


function ScanResults() {
    const { scanId } = useParams();
    const navigate = useNavigate();

    const [scan, setScan] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [terminating, setTerminating] = useState(false);

    const [downloadingReport, setDownloadingReport] =
        useState(false);


    // --------------------------------------------------
    // Fetch scan
    // --------------------------------------------------

    const fetchScan = async () => {

        try {

            const response =
                await api.get(
                    `/scans/${scanId}`
                );


            // Supports:
            // { scan: {...} }
            //
            // and:
            // {...}

            const currentScan =
                response.data.scan ||
                response.data;


            setScan(currentScan);

            setError("");

            return currentScan;

        } catch (error) {

            console.error(
                "Get scan error:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Failed to load scan"
            );


            return null;

        } finally {

            setLoading(false);

        }
    };


    // --------------------------------------------------
    // Initial fetch + polling
    // --------------------------------------------------

    useEffect(() => {

        let interval;


        const loadScan = async () => {

            const currentScan =
                await fetchScan();


            if (!currentScan) {
                return;
            }


            // Stop polling for terminal states

            if (
                currentScan.status ===
                    "completed" ||
                currentScan.status ===
                    "failed" ||
                currentScan.status ===
                    "cancelled"
            ) {

                return;

            }


            interval =
                setInterval(
                    async () => {

                        const updatedScan =
                            await fetchScan();


                        if (
                            updatedScan?.status ===
                                "completed" ||
                            updatedScan?.status ===
                                "failed" ||
                            updatedScan?.status ===
                                "cancelled"
                        ) {

                            clearInterval(
                                interval
                            );

                        }

                    },
                    2000
                );

        };


        loadScan();


        return () => {

            if (interval) {
                clearInterval(interval);
            }

        };

    }, [scanId]);


    // --------------------------------------------------
    // Terminate scan
    // --------------------------------------------------

    const handleTerminate = async () => {

        const confirmed =
            window.confirm(
                "Are you sure you want to terminate this scan?"
            );


        if (!confirmed) {
            return;
        }


        try {

            setTerminating(true);

            setError("");


            await api.post(
                `/scans/${scanId}/terminate`
            );


            // Update UI immediately

            setScan((currentScan) => {

                if (!currentScan) {
                    return currentScan;
                }


                return {

                    ...currentScan,

                    status:
                        "cancelled",

                    completedAt:
                        new Date().toISOString(),

                };

            });


        } catch (error) {

            console.error(
                "Terminate scan error:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Failed to terminate scan"
            );

        } finally {

            setTerminating(false);

        }

    };


    // --------------------------------------------------
    // Download Security Report
    // --------------------------------------------------

    const handleDownloadReport = async () => {

        try {

            setDownloadingReport(true);

            setError("");


            const response =
                await api.get(
                    `/scans/${scanId}/report`,
                    {
                        responseType: "blob",
                    }
                );


            // ------------------------------------------
            // Create temporary browser URL
            // ------------------------------------------

            const blob =
                new Blob(
                    [response.data],
                    {
                        type:
                            "application/pdf",
                    }
                );


            const downloadUrl =
                window.URL.createObjectURL(
                    blob
                );


            // ------------------------------------------
            // Create temporary download link
            // ------------------------------------------

            const link =
                document.createElement(
                    "a"
                );


            link.href =
                downloadUrl;


            link.download =
                "SecureWatch_Security_Report.pdf";


            document.body.appendChild(
                link
            );


            link.click();


            // ------------------------------------------
            // Cleanup
            // ------------------------------------------

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

            setDownloadingReport(false);

        }

    };


    // --------------------------------------------------
    // Loading
    // --------------------------------------------------

    if (loading) {

        return (

            <div className="page">

                <section className="card">

                    <p className="empty-state">
                        Loading scan...
                    </p>

                </section>

            </div>

        );

    }


    // --------------------------------------------------
    // Error / no scan
    // --------------------------------------------------

    if (!scan) {

        return (

            <div className="page">

                <section className="card">

                    <div className="alert error-alert">

                        {error ||
                            "Scan not found"}

                    </div>

                </section>

            </div>

        );

    }


    // --------------------------------------------------
    // Values
    // --------------------------------------------------

    const status =
        scan.status || "pending";


    const progress =
        Number(
            scan.progress || 0
        );


    // --------------------------------------------------
    // Stored scan summary
    // --------------------------------------------------
    //
    // IMPORTANT:
    // We no longer load all ScanFinding documents
    // just to calculate these values.
    //
    // Scan already stores:
    // - vulnerabilities
    // - severityCounts
    //
    // This makes the page much faster for large scans.
    // --------------------------------------------------

    const totalFindings =
        Number(
            scan.vulnerabilities || 0
        );


    const storedSeverityCounts =
        scan.severityCounts || {};


    const severityCounts = {

        Critical:
            Number(
                storedSeverityCounts.critical ||
                0
            ),

        High:
            Number(
                storedSeverityCounts.high ||
                0
            ),

        Medium:
            Number(
                storedSeverityCounts.medium ||
                0
            ),

        Low:
            Number(
                storedSeverityCounts.low ||
                0
            ),

        Informational:
            Number(
                storedSeverityCounts.informational ||
                0
            ),

    };


    // --------------------------------------------------
    // Status display
    // --------------------------------------------------

    const getStatusText = () => {

        switch (status) {

            case "pending":
                return "Pending";

            case "running":
                return "Running";

            case "completed":
                return "Completed";

            case "failed":
                return "Failed";

            case "cancelled":
                return "Cancelled";

            default:
                return status;

        }

    };


    // --------------------------------------------------
    // Status class
    // --------------------------------------------------

    const getStatusClass = () => {

        switch (status) {

            case "completed":
                return "success";

            case "failed":
                return "danger";

            case "cancelled":
                return "warning";

            case "running":
                return "info";

            default:
                return "";

        }

    };


    return (

        <div className="page">

            {/* ==========================================
                Header
            ========================================== */}

            <div className="page-header">

                <div>

                    <h1>
                        Security Scan
                    </h1>

                    <p className="page-subtitle">

                        View the progress and results
                        of your security scan.

                    </p>

                </div>

            </div>


            {/* ==========================================
                Error
            ========================================== */}

            {error && (

                <div className="alert error-alert">

                    {error}

                </div>

            )}


            {/* ==========================================
                Scan Status Card
            ========================================== */}

            <section className="card">

                <div className="card-header">

                    <h2>
                        Scan Status
                    </h2>

                    <p>
                        OWASP ZAP security assessment
                    </p>

                </div>


                {/* Status */}

                <div
                    className={`scan-status ${getStatusClass()}`}
                >

                    <strong>
                        Status:
                    </strong>

                    <span>
                        {getStatusText()}
                    </span>

                </div>


                {/* Progress */}

                {(status === "pending" ||
                    status === "running") && (

                    <div className="scan-progress">

                        <div className="progress-header">

                            <span>
                                Scan Progress
                            </span>

                            <strong>
                                {progress}%
                            </strong>

                        </div>


                        <div className="progress-bar">

                            <div
                                className="progress-fill"
                                style={{
                                    width:
                                        `${progress}%`,
                                }}
                            />

                        </div>

                    </div>

                )}


                {/* Completed progress */}

                {status === "completed" && (

                    <div className="scan-progress">

                        <div className="progress-header">

                            <span>
                                Scan Progress
                            </span>

                            <strong>
                                100%
                            </strong>

                        </div>


                        <div className="progress-bar">

                            <div
                                className="progress-fill"
                                style={{
                                    width: "100%",
                                }}
                            />

                        </div>

                    </div>

                )}


                {/* Cancelled progress */}

                {status === "cancelled" && (

                    <div className="scan-progress">

                        <div className="progress-header">

                            <span>
                                Scan Progress
                            </span>

                            <strong>
                                {progress}%
                            </strong>

                        </div>


                        <div className="progress-bar">

                            <div
                                className="progress-fill"
                                style={{
                                    width:
                                        `${progress}%`,
                                }}
                            />

                        </div>

                    </div>

                )}


                {/* Failed progress */}

                {status === "failed" && (

                    <div className="scan-progress">

                        <div className="progress-header">

                            <span>
                                Scan Progress
                            </span>

                            <strong>
                                {progress}%
                            </strong>

                        </div>


                        <div className="progress-bar">

                            <div
                                className="progress-fill"
                                style={{
                                    width:
                                        `${progress}%`,
                                }}
                            />

                        </div>

                    </div>

                )}


                {/* ======================================
                    Terminate Button
                ====================================== */}

                {(status === "pending" ||
                    status === "running") && (

                    <div
                        className="scan-actions"
                        style={{
                            marginTop: "20px",
                        }}
                    >

                        <button
                            type="button"
                            className="danger-button"
                            onClick={
                                handleTerminate
                            }
                            disabled={
                                terminating
                            }
                        >

                            {terminating
                                ? "Terminating..."
                                : "Terminate Scan"}

                        </button>

                    </div>

                )}


                {/* ======================================
                    Cancelled Message
                ====================================== */}

                {status === "cancelled" && (

                    <div
                        className="alert"
                        style={{
                            marginTop: "20px",
                        }}
                    >

                        The scan was terminated
                        by the user.

                    </div>

                )}


                {/* ======================================
                    Failed Message
                ====================================== */}

                {status === "failed" && (

                    <div
                        className="alert error-alert"
                        style={{
                            marginTop: "20px",
                        }}
                    >

                        {scan.error ||
                            scan.errorMessage ||
                            "The scan failed."}

                    </div>

                )}

            </section>


            {/* ==========================================
                Scan Information
            ========================================== */}

            <section className="card">

                <div className="card-header">

                    <h2>
                        Scan Information
                    </h2>

                </div>


                <div className="scan-info-grid">

                    <div>

                        <span>
                            Scan ID
                        </span>

                        <strong>
                            {scan._id}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Started
                        </span>

                        <strong>

                            {scan.startedAt
                                ? new Date(
                                    scan.startedAt
                                ).toLocaleString()
                                : "Not started"}

                        </strong>

                    </div>


                    <div>

                        <span>
                            Completed
                        </span>

                        <strong>

                            {scan.completedAt
                                ? new Date(
                                    scan.completedAt
                                ).toLocaleString()
                                : "—"}

                        </strong>

                    </div>


                    <div>

                        <span>
                            Total Findings
                        </span>

                        <strong>
                            {totalFindings}
                        </strong>

                    </div>

                </div>

            </section>


            {/* ==========================================
                Vulnerability Summary
            ========================================== */}

            <section className="card">

                <div className="card-header">

                    <h2>
                        Vulnerability Summary
                    </h2>

                    <p>
                        Raw findings reported by
                        OWASP ZAP.
                    </p>

                </div>


                <div className="summary-grid">

                    <div className="summary-card">

                        <span>
                            Critical
                        </span>

                        <strong>
                            {severityCounts.Critical}
                        </strong>

                    </div>


                    <div className="summary-card">

                        <span>
                            High
                        </span>

                        <strong>
                            {severityCounts.High}
                        </strong>

                    </div>


                    <div className="summary-card">

                        <span>
                            Medium
                        </span>

                        <strong>
                            {severityCounts.Medium}
                        </strong>

                    </div>


                    <div className="summary-card">

                        <span>
                            Low
                        </span>

                        <strong>
                            {severityCounts.Low}
                        </strong>

                    </div>


                    <div className="summary-card">

                        <span>
                            Informational
                        </span>

                        <strong>
                            {severityCounts.Informational}
                        </strong>

                    </div>

                </div>

            </section>


            {/* ==========================================
                Security Intelligence
            ========================================== */}

            {status === "completed" && (

                <section className="card">

                    <div className="card-header">

                        <h2>
                            Security Intelligence
                        </h2>

                        <p>

                            Analyze these findings using
                            the SecureWatch Vulnerability
                            Intelligence Engine.

                        </p>

                    </div>


                    <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                            navigate(
                                `/scans/${scanId}/intelligence`
                            )
                        }
                    >

                        View Security Intelligence

                    </button>


                    {/* ==================================
                        Download Security Report
                    ================================== */}

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={
                            handleDownloadReport
                        }
                        disabled={
                            downloadingReport
                        }
                        style={{
                            marginLeft: "12px",
                        }}
                    >

                        {downloadingReport
                            ? "Generating Report..."
                            : "Download Security Report"}

                    </button>

                </section>

            )}


            {/* ==========================================
                Bottom Navigation
            ========================================== */}

            <div
                style={{
                    marginTop: "20px",
                }}
            >

                <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                        navigate("/websites")
                    }
                >

                    Back to Websites

                </button>

            </div>

        </div>

    );

}


export default ScanResults;