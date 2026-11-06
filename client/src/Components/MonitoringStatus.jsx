import React from "react";

const MonitoringStatus = ({ enabled }) => {
  return (
    <div className={`monitoring-status ${enabled ? "active" : "inactive"}`}>
      <span className="monitoring-status-dot">●</span>

      <span>{enabled ? "Monitoring Active" : "Monitoring Off"}</span>
    </div>
  );
};

export default MonitoringStatus;
