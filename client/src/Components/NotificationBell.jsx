import React, { useEffect, useState } from "react";
import api from "../Services/api";
import NotificationPanel from "./NotificationPanel";

const NotificationBell = () => {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const response = await api.get("/monitoring/events");

      setEvents(response.data.events || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    const interval = setInterval(() => {
      fetchEvents();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const unreadCount = events.filter((event) => !event.read).length;

  const handleBellClick = () => {
    setOpen((previous) => !previous);
  };

  return (
    <div className="notification-container">
      <button
        className="notification-bell"
        onClick={handleBellClick}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationPanel
          events={events}
          loading={loading}
          onRefresh={fetchEvents}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
