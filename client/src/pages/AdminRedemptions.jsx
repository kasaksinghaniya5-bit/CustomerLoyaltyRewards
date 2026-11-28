
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import "../styles/AdminRedemptions.css";

function AdminRedemptions() {
  const [redemptions, setRedemptions] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRedemptions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/redemptions");
      setRedemptions(response.data.redemptions || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load redemption requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const getStatus = (redemption) => {
    if (
      redemption.status === "active" &&
      new Date(redemption.expiresAt) < new Date()
    ) {
      return "expired";
    }

    return redemption.status;
  };

  const filteredRedemptions = useMemo(() => {
    return redemptions.filter((redemption) => {
      const customerName = redemption.customer?.fullName || "";
      const customerEmail = redemption.customer?.email || "";
      const rewardName = redemption.rewardName || "";
      const code = redemption.redemptionCode || "";
      const status = getStatus(redemption);

      const matchesSearch = [
        customerName,
        customerEmail,
        rewardName,
        code,
      ].some((value) =>
        value.toLowerCase().includes(search.toLowerCase())
      );

      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [redemptions, search, statusFilter]);

  const stats = {
    total: redemptions.length,
    active: redemptions.filter(
      (item) => getStatus(item) === "active"
    ).length,
    used: redemptions.filter(
      (item) => getStatus(item) === "used"
    ).length,
    expired: redemptions.filter(
      (item) => getStatus(item) === "expired"
    ).length,
    cancelled: redemptions.filter(
      (item) => getStatus(item) === "cancelled"
    ).length,
  };

  const handleCollect = async (redemption) => {
    const confirmed = window.confirm(
      `Confirm that "${redemption.rewardName}" has been physically collected by the customer?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(redemption._id);
      setError("");
      setSuccess("");

      const response = await api.patch(
        `/admin/redemptions/${redemption._id}/collect`
      );

      setRedemptions((previous) =>
        previous.map((item) =>
          item._id === redemption._id
            ? { ...item, ...response.data.redemption }
            : item
        )
      );

      setSuccess("Reward successfully marked as collected.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update redemption status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="admin-redemptions-page">
        <Link
  to="/admin/dashboard"
  className="admin-redemptions-back"
>
  ← Back to Dashboard
</Link>
      <div className="admin-redemptions-header">
        <div>
          <p className="admin-redemptions-eyebrow">
            REWARD MANAGEMENT
          </p>
          <h1>Redemption Requests</h1>
          <p>Monitor customer reward claims and verify collections.</p>
        </div>

        <button
          className="admin-redemptions-refresh"
          onClick={fetchRedemptions}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="admin-redemptions-stats">
        <div className="admin-redemption-stat">
          <span>Total Requests</span>
          <strong>{stats.total}</strong>
        </div>

        <div className="admin-redemption-stat">
          <span>Active</span>
          <strong>{stats.active}</strong>
        </div>

        <div className="admin-redemption-stat">
          <span>Collected</span>
          <strong>{stats.used}</strong>
        </div>

        <div className="admin-redemption-stat">
          <span>Expired</span>
          <strong>{stats.expired}</strong>
        </div>

        <div className="admin-redemption-stat">
          <span>Cancelled</span>
          <strong>{stats.cancelled}</strong>
        </div>
      </div>

      <div className="admin-redemptions-toolbar">
        <input
          type="text"
          placeholder="Search customer, reward or redemption code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="used">Collected</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && (
        <div className="admin-redemptions-message error">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-redemptions-message success">
          {success}
        </div>
      )}

      <div className="admin-redemptions-table-container">
        {loading ? (
          <div className="admin-redemptions-empty">
            Loading redemption requests...
          </div>
        ) : filteredRedemptions.length === 0 ? (
          <div className="admin-redemptions-empty">
            No redemption requests found.
          </div>
        ) : (
          <table className="admin-redemptions-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Reward</th>
                <th>Points</th>
                <th>Redemption Code</th>
                <th>Requested On</th>
                <th>Expires On</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredRedemptions.map((redemption) => {
                const status = getStatus(redemption);

                return (
                  <tr key={redemption._id}>
                    <td>
                      <div className="admin-redemption-customer">
                        <strong>
                          {redemption.customer?.fullName || "Unknown"}
                        </strong>
                        <span>
                          {redemption.customer?.email || "—"}
                        </span>
                      </div>
                    </td>

                    <td>{redemption.rewardName}</td>

                    <td>
                      <strong>{redemption.pointsSpent} pts</strong>
                    </td>

                    <td>
                      <span className="admin-redemption-code">
                        {redemption.redemptionCode}
                      </span>
                    </td>

                    <td>{formatDate(redemption.createdAt)}</td>

                    <td>{formatDate(redemption.expiresAt)}</td>

                    <td>
                      <span
                        className={`admin-redemption-status ${status}`}
                      >
                        {status === "used" ? "Collected" : status}
                      </span>
                    </td>

                    <td>
                      {status === "active" ? (
                        <button
                          className="admin-redemption-collect"
                          onClick={() => handleCollect(redemption)}
                          disabled={updatingId === redemption._id}
                        >
                          {updatingId === redemption._id
                            ? "Updating..."
                            : "Mark Collected"}
                        </button>
                      ) : (
                        <span className="admin-redemption-no-action">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="admin-redemptions-count">
        Showing {filteredRedemptions.length} of {redemptions.length} requests
      </p>
    </div>
  );
}

export default AdminRedemptions;
