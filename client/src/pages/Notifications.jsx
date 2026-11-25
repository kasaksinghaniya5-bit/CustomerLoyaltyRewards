import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/customer/notifications");
      setNotifications(response.data.notifications);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (notificationId) => {
    try {
      await api.patch(
        `/customer/notifications/${notificationId}/read`
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to update notification."
      );
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="notifications-page">
      <Link to="/customer/dashboard" className="notifications-back">
        ← Back to dashboard
      </Link>

      <header className="notifications-header">
        <span>YOUR UPDATES</span>
        <h1>Notifications.</h1>
        <p>
          Important updates about your points, rewards and account.
        </p>
      </header>

      <div className="notifications-summary">
        <div>
          <strong>{notifications.length}</strong>
          <span>Total notifications</span>
        </div>

        <div>
          <strong>{unreadCount}</strong>
          <span>Unread notifications</span>
        </div>
      </div>

      <section className="notifications-content">
        {loading && <p>Loading notifications...</p>}

        {error && (
          <p className="notifications-error">{error}</p>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="notifications-empty">
            <span>🔔</span>
            <h2>You're all caught up!</h2>
            <p>
              Your important updates will appear here.
            </p>
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <article
                key={notification._id}
                className={`notification-card ${
                  notification.read ? "is-read" : "is-unread"
                }`}
              >
                <div className="notification-icon">
                  {notification.type === "redemption"
                    ? "🎁"
                    : notification.type === "cancellation"
                    ? "↩️"
                    : "🔔"}
                </div>

                <div className="notification-details">
                  <div className="notification-top">
                    <h2>{notification.title}</h2>

                    {!notification.read && (
                      <span className="unread-indicator">
                        NEW
                      </span>
                    )}
                  </div>

                  <p>{notification.message}</p>

                  <span className="notification-date">
                    {new Date(
                      notification.createdAt
                    ).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>

                  {!notification.read && (
                    <button
                      type="button"
                      onClick={() =>
                        handleMarkRead(notification._id)
                      }
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Notifications;