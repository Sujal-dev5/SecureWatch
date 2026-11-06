import React from "react";
import MonitoringStatus from "./MonitoringStatus";

const formatDate = (date) => {
  if (!date) return "Not available";

  return new Date(date).toLocaleString();
};

const getScheduleLabel = (frequency) => {
  switch (frequency) {
    case "daily":
      return "Daily";

    case "weekly":
      return "Weekly";

    case "demo":
      return "Demo (2 minutes)";

    default:
      return frequency;
  }
};

const MonitoringCard = ({ monitoring, onToggle, onScheduleChange }) => {
  const website = monitoring.websiteId;

  return (
    <div className="monitoring-card">
      <div className="monitoring-card-header">
        <div>
          <h2>{website?.name || "Website"}</h2>

          <p className="monitoring-url">{website?.url || "URL unavailable"}</p>
        </div>

        <MonitoringStatus enabled={monitoring.enabled} />
      </div>

      <div className="monitoring-details">
        <div className="monitoring-detail">
          <span>Schedule</span>

          <strong>{getScheduleLabel(monitoring.frequency)}</strong>
        </div>

        <div className="monitoring-detail">
          <span>Last Scan</span>

          <strong>{formatDate(monitoring.lastRunAt)}</strong>
        </div>

        <div className="monitoring-detail">
          <span>Next Scan</span>

          <strong>
            {monitoring.enabled
              ? formatDate(monitoring.nextRunAt)
              : "Monitoring stopped"}
          </strong>
        </div>
      </div>

      <div className="monitoring-actions">
        <button
          className={
            monitoring.enabled
              ? "monitoring-stop-button"
              : "monitoring-start-button"
          }
          onClick={() => onToggle(monitoring._id, !monitoring.enabled)}
        >
          {monitoring.enabled ? "Stop Monitoring" : "Start Monitoring"}
        </button>

        <select
          value={monitoring.frequency}
          onChange={(event) =>
            onScheduleChange(monitoring._id, event.target.value)
          }
        >
          <option value="daily">Daily</option>

          <option value="weekly">Weekly</option>

          <option value="demo">Demo (2 minutes)</option>
        </select>
      </div>
    </div>
  );
};

export default MonitoringCard;
