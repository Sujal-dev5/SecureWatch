import React, { useState } from "react";
import api from "../Services/api";

const MonitoringForm = ({ websites, onCreated }) => {
  const [websiteId, setWebsiteId] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!websiteId) {
      setError("Please select a website");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await api.post("/monitoring", {
        websiteId,
        frequency,
      });

      setWebsiteId("");
      setFrequency("daily");

      if (onCreated) {
        await onCreated();
      }
    } catch (error) {
      console.error("Failed to create monitoring:", error);

      setError(
        error.response?.data?.message ||
          "Failed to create monitoring"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="monitoring-form">

      <div className="monitoring-form-header">
        <div>
          <h2>Set Up Monitoring</h2>
          <p>
            Choose a website and configure its automatic
            security scan schedule.
          </p>
        </div>
      </div>

      {error && (
        <div className="monitoring-form-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        <div className="monitoring-form-fields">

          {/* Website */}

          <div className="monitoring-form-group">
            <label htmlFor="monitoring-website">
              Website
            </label>

            <select
              id="monitoring-website"
              value={websiteId}
              onChange={(event) =>
                setWebsiteId(event.target.value)
              }
              disabled={loading}
            >
              <option value="">
                Select a website
              </option>

              {websites.map((website) => (
                <option
                  key={website._id}
                  value={website._id}
                >
                  {website.name} — {website.url}
                </option>
              ))}
            </select>
          </div>

          {/* Frequency */}

          <div className="monitoring-form-group">
            <label htmlFor="monitoring-frequency">
              Scan Frequency
            </label>

            <select
              id="monitoring-frequency"
              value={frequency}
              onChange={(event) =>
                setFrequency(event.target.value)
              }
              disabled={loading}
            >
              <option value="daily">
                Daily
              </option>

              <option value="weekly">
                Weekly
              </option>

              <option value="demo">
                Demo — Every 2 Minutes
              </option>
            </select>
          </div>

        </div>

        <button
          type="submit"
          className="monitoring-create-button"
          disabled={loading || websites.length === 0}
        >
          {loading
            ? "Creating..."
            : "Create Monitoring"}
        </button>

      </form>
    </div>
  );
};

export default MonitoringForm;