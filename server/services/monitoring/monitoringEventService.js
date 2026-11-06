const MonitoringEvent = require("../../models/MonitoringEvent");

const createMonitoringEvent = async ({
  userId,
  websiteId,
  scanId,
  type,
  message,
  severity = "Informational",
}) => {
  return MonitoringEvent.create({
    userId,
    websiteId,
    scanId,
    type,
    message,
    severity,
    read: false,
  });
};

const createScanCompletedEvent = async ({
  userId,
  websiteId,
  scanId,
  findingsCount,
}) => {
  return createMonitoringEvent({
    userId,
    websiteId,
    scanId,
    type: "SCAN_COMPLETED",
    message: `Scheduled scan completed. ${findingsCount} finding(s) detected.`,
    severity: "Informational",
  });
};

const createScanFailedEvent = async ({
  userId,
  websiteId,
  scanId,
  errorMessage,
}) => {
  return createMonitoringEvent({
    userId,
    websiteId,
    scanId,
    type: "SCAN_FAILED",
    message:
      `Scheduled scan failed` +
      (errorMessage ? `: ${errorMessage}` : "."),
    severity: "High",
  });
};

const createNewVulnerabilityEvent = async ({
  userId,
  websiteId,
  scanId,
  count,
}) => {
  return createMonitoringEvent({
    userId,
    websiteId,
    scanId,
    type: "NEW_VULNERABILITY",
    message: `${count} new vulnerability finding(s) detected since the previous scan.`,
    severity: "High",
  });
};

const createHealthScoreDropEvent = async ({
  userId,
  websiteId,
  scanId,
  previousScore,
  currentScore,
}) => {
  const drop = Number(
    (previousScore - currentScore).toFixed(1)
  );

  return createMonitoringEvent({
    userId,
    websiteId,
    scanId,
    type: "HEALTH_SCORE_DROP",
    message: `Security Health Score dropped by ${drop} points (${previousScore} → ${currentScore}).`,
    severity: "High",
  });
};

module.exports = {
  createMonitoringEvent,
  createScanCompletedEvent,
  createScanFailedEvent,
  createNewVulnerabilityEvent,
  createHealthScoreDropEvent,
};