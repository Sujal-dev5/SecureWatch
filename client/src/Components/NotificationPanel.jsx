import React from "react";
import api from "../Services/api";
import { useNavigate } from "react-router-dom";

const getEventIcon = (type) => {
  switch (type) {
    case "NEW_VULNERABILITY":
      return "🔴";

    case "HEALTH_SCORE_DROP":
      return "⚠️";

    case "SCAN_FAILED":
      return "❌";

    case "SCAN_COMPLETED":
      return "✅";

    default:
      return "🔔";
  }
};

const getEventTitle = (type) => {
  switch (type) {
    case "NEW_VULNERABILITY":
      return "New Vulnerability Detected";

    case "HEALTH_SCORE_DROP":
      return "Security Health Score Dropped";

    case "SCAN_FAILED":
      return "Scheduled Scan Failed";

    case "SCAN_COMPLETED":
      return "Scheduled Scan Completed";

    default:
      return "Security Monitoring Update";
  }
};

const formatDate = (date) => {
  if (!date) return "";

  return new Date(date).toLocaleString();
};

const NotificationPanel = ({ events, loading, onRefresh, onClose }) => {
  const navigate = useNavigate();
  const markAsRead = async (eventId) => {
    try {
      await api.patch(`/monitoring/events/${eventId}/read`);

      await onRefresh();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <div className="notification-panel">
      <div className="notification-panel-header">
        <div>
          <h3>Notifications</h3>

          <p>Security monitoring updates</p>
        </div>

        <button className="notification-close" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="notification-list">
        {loading ? (
          <div className="notification-empty">Loading notifications...</div>
        ) : events.length === 0 ? (
          <div className="notification-empty">No notifications yet.</div>
        ) : (
          events.map((event) => (
            <div
              key={event._id}
              className={`notification-item ${event.read ? "read" : "unread"}`}
            >
              <div className="notification-icon">
                {getEventIcon(event.type)}
              </div>

              <div className="notification-content">
                <div className="notification-title">
                  {getEventTitle(event.type)}
                </div>

                <div className="notification-message">{event.message}</div>

                <div className="notification-meta">
                  {event.websiteId?.name || "Website"}

                  {" • "}

                  {formatDate(event.createdAt)}
                </div>

                {!event.read && (
                  <button
                    className="notification-read-button"
                    onClick={() => markAsRead(event._id)}
                  >
                    Mark as read
                  </button>
                )}
                {event.scanId?._id && (
                  <button
                    className="notification-view-button"
                    onClick={() => navigate(`/scans/${event.scanId._id}`)}
                  >
                    View Scan
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
