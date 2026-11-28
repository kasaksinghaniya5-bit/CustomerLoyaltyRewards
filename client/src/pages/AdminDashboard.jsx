
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState("");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get("/admin/dashboard");
        setStats(response.data.stats);
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentActivity = async () => {
  try {
    const response = await api.get("/admin/activity");
    setActivities(response.data.activities);
  } catch (error) {
    setActivityError(
      error.response?.data?.message ||
      "Unable to load recent activities."
    );
  } finally {
    setActivityLoading(false);
  }
};

    fetchDashboardStats();
    fetchRecentActivity();
  }, []);

  const formatNumber = (value) =>
    (value ?? 0).toLocaleString("en-IN");

  const getActivityIcon = (type) => {
  const icons = {
    customer_registered: "👤",
    code_claimed: "🎟️",
    points_earned: "⭐",
    reward_redeemed: "🎁",
    reward_collected: "✅",
    customer_suspended: "🚫",
    customer_reactivated: "🔓",
  };

  return icons[type] || "◈";
};

const formatActivityDate = (date) =>
  new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-icon">◆</span>
          <div>
            <h2>Admin Portal</h2>
            <span>Rewards Management</span>
          </div>
        </div>

        <nav className="admin-nav">
          <Link to="/admin/dashboard" className="active">
            ◈ Dashboard
          </Link>
          <Link to="/admin/customers">◎ Customers</Link>
          <Link to="/admin/product-codes">◇ Product Codes</Link>
          <Link to="/admin/rewards">🎁 Rewards</Link>
          <Link to="/admin/redemptions">↗ Redemptions</Link>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/">← Back to Home</Link>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <span className="admin-eyebrow">ADMIN CONTROL CENTER</span>
            <h1>Dashboard</h1>
            <p>Monitor and manage your customer loyalty program.</p>
          </div>

          <div className="admin-profile">
            <span className="admin-avatar">A</span>
            <div>
              <strong>Administrator</strong>
              <span>System Admin</span>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="admin-empty-state">
            <h3>Loading dashboard statistics...</h3>
          </div>
        ) : error ? (
          <div className="admin-empty-state">
            <h3>Unable to load dashboard</h3>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <section className="admin-stats-grid">
              <div className="admin-stat-card">
                <span className="admin-stat-icon">◎</span>
                <div>
                  <span>Total Customers</span>
                  <strong>{formatNumber(stats.totalCustomers)}</strong>
                </div>
              </div>

              <div className="admin-stat-card">
                <span className="admin-stat-icon">◇</span>
                <div>
                  <span>Product Codes</span>
                  <strong>{formatNumber(stats.totalProductCodes)}</strong>
                </div>
              </div>

              <div className="admin-stat-card">
                <span className="admin-stat-icon">🎁</span>
                <div>
                  <span>Active Rewards</span>
                  <strong>{formatNumber(stats.activeRewards)}</strong>
                </div>
              </div>

              <div className="admin-stat-card">
                <span className="admin-stat-icon">↗</span>
                <div>
                  <span>Pending Redemptions</span>
                  <strong>{formatNumber(stats.pendingRedemptions)}</strong>
                </div>
              </div>
            </section>

            <section className="admin-overview-grid">
              <div className="admin-panel">
                <div className="admin-panel-heading">
                  <div>
                    <span className="admin-section-label">
                      PROGRAM OVERVIEW
                    </span>
                    <h2>Loyalty Program</h2>
                  </div>
                </div>

                <div className="admin-overview-content">
                  <div>
                    <span>Points issued</span>
                    <strong>{formatNumber(stats.pointsIssued)}</strong>
                  </div>

                  <div>
                    <span>Points redeemed</span>
                    <strong>{formatNumber(stats.pointsRedeemed)}</strong>
                  </div>

                  <div>
                    <span>Available rewards</span>
                    <strong>{formatNumber(stats.availableRewards)}</strong>
                  </div>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-heading">
                  <div>
                    <span className="admin-section-label">
                      QUICK ACTIONS
                    </span>
                    <h2>Manage System</h2>
                  </div>
                </div>

                <div className="admin-quick-actions">
                  <Link to="/admin/product-codes">
                    <span>◇</span>
                    Generate Product Codes →
                  </Link>

                  <Link to="/admin/rewards">
                    <span>🎁</span>
                    Manage Rewards →
                  </Link>

                  <Link to="/admin/redemptions">
                    <span>↗</span>
                    Review Redemptions →
                  </Link>
                </div>
              </div>
            </section>

            <section className="admin-recent-section">
              <div className="admin-panel-heading">
                <div>
                  <span className="admin-section-label">RECENT ACTIVITY</span>
                  <h2>Latest System Activity</h2>
                </div>
              </div>

              {activityLoading ? (
  <div className="admin-empty-state">
    <h3>Loading recent activities...</h3>
  </div>
) : activityError ? (
  <div className="admin-empty-state">
    <h3>Unable to load activities</h3>
    <p>{activityError}</p>
  </div>
) : activities.length === 0 ? (
  <div className="admin-empty-state">
    <div>◌</div>
    <h3>No recent activity</h3>
    <p>
      Customer claims, redemptions, and other system activity
      will appear here.
    </p>
  </div>
) : (
  <div className="admin-activity-list">
    {activities.map((activity) => (
      <div className="admin-activity-item" key={activity._id}>
        <span className="admin-activity-icon">
          {getActivityIcon(activity.type)}
        </span>

        <div className="admin-activity-details">
          <p>{activity.description}</p>
          <span>{formatActivityDate(activity.createdAt)}</span>
        </div>
      </div>
    ))}
  </div>
)}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
