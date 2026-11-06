import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../Services/api";

import AIExecutiveSummary from "../Components/AIExecutiveSummary";
import AIRiskAnalysis from "../Components/AIRiskAnalysis";
import AIKeyRisks from "../Components/AIKeyRisks";
import AIBusinessImpact from "../Components/AIBusinessImpact";
import AIRemediation from "../Components/AIRemediation";
import AIAttackPaths from "../Components/AIAttackPaths";

function AISecurityAnalysis() {
  const { scanId } = useParams();

  const [analysis, setAnalysis] = useState(null);
  const [healthScore, setHealthScore] = useState(0);
  const [healthStatus, setHealthStatus] = useState("");
  const [error, setError] = useState("");
  const requestedScanRef = useRef(null);

 useEffect(() => {
  if (!scanId) {
    return;
  }

  // Prevent duplicate requests for the same scan.
  if (requestedScanRef.current === scanId) {
    return;
  }

  requestedScanRef.current = scanId;

  const fetchAnalysis = async () => {
    try {
      setError("");

      const response = await api.get(`/ai/scans/${scanId}`);

      setAnalysis(response.data.analysis);
      setHealthScore(response.data.healthScore);
      setHealthStatus(response.data.healthStatus);
    } catch (error) {
      console.error("Failed to fetch AI analysis:", error);

      // Allow retry if the request failed.
      requestedScanRef.current = null;

      setError(
        error.response?.data?.message ||
          "Failed to load AI security analysis",
      );
    }
   };

  fetchAnalysis();
  }, [scanId]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!analysis) {
    return <p>Loading AI security analysis...</p>;
  }

  return (
    <div>
      <AIExecutiveSummary summary={analysis.executiveSummary} />

      <AIRiskAnalysis
        overallRisk={analysis.overallRisk}
        healthScore={healthScore}
        healthStatus={healthStatus}
      />

      <AIKeyRisks risks={analysis.keyRisks} />

      <AIBusinessImpact impacts={analysis.businessImpact} />

      <AIRemediation remediation={analysis.remediation} />

      <AIAttackPaths attackPaths={analysis.attackPaths} />
    </div>
  );
}

export default AISecurityAnalysis;
