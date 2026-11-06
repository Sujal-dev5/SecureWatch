import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../Services/api";

function Scan() {
  const { scanId } = useParams();

  const [scan, setScan] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let interval;

    const fetchScan = async () => {
      try {
        setError("");

        const response = await api.get(`/scans/${scanId}`);

        const currentScan = response.data.scan;

        setScan(currentScan);

        if (
          currentScan.status === "completed" ||
          currentScan.status === "failed"
        ) {
          clearInterval(interval);
        }
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load scan");
      }
    };

    fetchScan();

    interval = setInterval(fetchScan, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [scanId]);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Security Scan</h1>
      </div>

      {error && <p>{error}</p>}

      {!scan && !error && <p>Loading scan...</p>}

      {scan && (
        <div className="card">
          <p>Status: {scan.status}</p>

          <p>Progress: {scan.progress || 0}%</p>

          <progress value={scan.progress || 0} max="100" />
        </div>
      )}
    </div>
  );
}

export default Scan;
