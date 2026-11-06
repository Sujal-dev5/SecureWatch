import React, { useEffect, useState } from "react";
import api from "../Services/api";

import MonitoringForm from "../Components/MonitoringForm";
import MonitoringCard from "../Components/MonitoringCard";

const Monitoring = () => {
  const [monitorings, setMonitorings] = useState([]);
  const [websites, setWebsites] = useState([]);

  const [loading, setLoading] = useState(true);
  const [websitesLoading, setWebsitesLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH MONITORINGS
  // ==========================================

  const fetchMonitorings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/monitoring");

      setMonitorings(response.data.monitorings || []);
    } catch (error) {
      console.error("Failed to fetch monitorings:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load monitoring data"
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH WEBSITES
  // ==========================================

  const fetchWebsites = async () => {
    try {
      setWebsitesLoading(true);

      const response = await api.get("/websites");

      console.log("WEBSITES API RESPONSE:", response.data);

      setWebsites(response.data.websites || []);
    } catch (error) {
      console.error("Failed to fetch websites:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load websites"
      );
    } finally {
      setWebsitesLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchMonitorings();
    fetchWebsites();
  }, []);

  // ==========================================
// AUTO REFRESH ACTIVE MONITORING
// ==========================================

  useEffect(() => {
     const hasActiveMonitoring = monitorings.some(
       (monitoring) => monitoring.enabled
      );

      if (!hasActiveMonitoring) {
        return;
      }

      const interval = setInterval(() => {
        fetchMonitorings();
      }, 10000);

      return () => {
       clearInterval(interval);
      };
  }, [monitorings]);

  // ==========================================
  // START / STOP MONITORING
  // ==========================================

  const toggleMonitoring = async (monitoringId, enabled) => {
    try {
      setError("");

      await api.patch(
        `/monitoring/${monitoringId}/toggle`,
        {
          enabled,
        }
      );

      await fetchMonitorings();
    } catch (error) {
      console.error(
        "Failed to toggle monitoring:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update monitoring"
      );
    }
  };

  // ==========================================
  // CHANGE MONITORING SCHEDULE
  // ==========================================

  const changeSchedule = async (
    monitoringId,
    frequency
  ) => {
    try {
      setError("");

      await api.put(
        `/monitoring/${monitoringId}`,
        {
          frequency,
        }
      );

      await fetchMonitorings();
    } catch (error) {
      console.error(
        "Failed to change monitoring schedule:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to change monitoring schedule"
      );
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading && websitesLoading) {
    return (
      <div className="monitoring-page">
        <div className="monitoring-page-header">
          <h1>Continuous Monitoring</h1>

          <p>
            Automatically scan your websites and detect
            security changes over time.
          </p>
        </div>

        <p>Loading monitoring data...</p>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="monitoring-page">

      {/* PAGE HEADER */}

      <div className="monitoring-page-header">
        <h1>Continuous Monitoring</h1>

        <p>
          Automatically scan your websites and detect
          new security vulnerabilities over time.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="monitoring-error">
          {error}
        </div>
      )}

      {/* CREATE MONITORING */}

      {!websitesLoading && websites.length > 0 && (
        <MonitoringForm
          websites={websites}
          onCreated={fetchMonitorings}
        />
      )}

      {/* NO WEBSITES */}

      {!websitesLoading && websites.length === 0 && (
        <div className="monitoring-empty">
          <h2>No websites available</h2>

          <p>
            Add a website first before setting up
            continuous monitoring.
          </p>
        </div>
      )}

      {/* MONITORING LIST */}

      {monitorings.length > 0 && (
        <div className="monitoring-section">

          <div className="monitoring-section-header">
            <h2>Your Monitoring Tasks</h2>

            <p>
              Manage scheduled security scans for your
              websites.
            </p>
          </div>

          <div className="monitoring-list">
            {monitorings.map((monitoring) => (
              <MonitoringCard
                key={monitoring._id}
                monitoring={monitoring}
                onToggle={toggleMonitoring}
                onScheduleChange={changeSchedule}
              />
            ))}
          </div>

        </div>
      )}

      {/* NO MONITORING */}

      {monitorings.length === 0 &&
        websites.length > 0 &&
        !loading && (
          <div className="monitoring-empty">

            <h2>No monitoring configured</h2>

            <p>
              Select a website above and create a
              monitoring task to get started.
            </p>

          </div>
        )}

    </div>
  );
};

export default Monitoring;