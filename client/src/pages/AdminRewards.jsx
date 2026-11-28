
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/AdminRewards.css";

function AdminRewards() {
  const navigate = useNavigate();

  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    imageUrl: "",
    pointsCost: "",
    stock: "",
  });

  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/rewards");
      setRewards(response.data.rewards || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load rewards."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openCreateForm = () => {
    setEditingReward(null);
    setFormData({
      name: "",
      category: "",
      description: "",
      imageUrl: "",
      pointsCost: "",
      stock: "",
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (reward) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      category: reward.category,
      description: reward.description,
      imageUrl: reward.imageUrl || "",
      pointsCost: String(reward.pointsCost),
      stock: String(reward.stock),
    });
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        ...formData,
        pointsCost: Number(formData.pointsCost),
        stock: Number(formData.stock),
      };

      if (editingReward) {
        await api.patch(
          `/admin/rewards/${editingReward._id}`,
          payload
        );
        setSuccess("Reward updated successfully.");
      } else {
        await api.post("/admin/rewards", payload);
        setSuccess("Reward created successfully.");
      }

      setShowForm(false);
      setEditingReward(null);
      await fetchRewards();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save reward."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (reward) => {
    const newStatus =
      reward.status === "active" ? "inactive" : "active";

    const confirmed = window.confirm(
      `Are you sure you want to ${newStatus === "active" ? "activate" : "deactivate"} "${reward.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.patch(
        `/admin/rewards/${reward._id}/status`,
        { status: newStatus }
      );

      setSuccess(`Reward ${newStatus} successfully.`);
      await fetchRewards();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update reward status."
      );
    }
  };

  const filteredRewards = rewards.filter((reward) => {
    const query = search.toLowerCase();

    return (
      reward.name.toLowerCase().includes(query) ||
      reward.category.toLowerCase().includes(query) ||
      reward.status.toLowerCase().includes(query)
    );
  });

  const activeRewards = rewards.filter(
    (reward) => reward.status === "active"
  ).length;

  const inactiveRewards = rewards.length - activeRewards;

  return (
    <div className="admin-rewards-page">
      <header className="admin-rewards-header">
        <div>
          <button
            className="admin-rewards-back"
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Back to Dashboard
          </button>

          <h1>Rewards Management</h1>
          <p>Create, edit and manage customer rewards.</p>
        </div>

        <button
          className="admin-rewards-add-btn"
          onClick={openCreateForm}
        >
          + Add New Reward
        </button>
      </header>

      {error && <div className="admin-rewards-alert error">{error}</div>}
      {success && (
        <div className="admin-rewards-alert success">{success}</div>
      )}

      <section className="admin-rewards-stats">
        <div className="admin-rewards-stat-card">
          <span>Total Rewards</span>
          <strong>{rewards.length}</strong>
        </div>

        <div className="admin-rewards-stat-card">
          <span>Active Rewards</span>
          <strong>{activeRewards}</strong>
        </div>

        <div className="admin-rewards-stat-card">
          <span>Inactive Rewards</span>
          <strong>{inactiveRewards}</strong>
        </div>
      </section>

      {showForm && (
        <section className="admin-rewards-form-card">
          <div className="admin-rewards-form-heading">
            <h2>{editingReward ? "Edit Reward" : "Create New Reward"}</h2>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="admin-rewards-close-btn"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="admin-rewards-form-grid">
              <label>
                Reward Name
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Wireless Earbuds"
                  required
                />
              </label>

              <label>
                Category
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g. Electronics"
                  required
                />
              </label>

              <label>
                Points Cost
                <input
                  type="number"
                  name="pointsCost"
                  value={formData.pointsCost}
                  onChange={handleInputChange}
                  min="1"
                  step="1"
                  required
                />
              </label>

              <label>
                Available Stock
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  required
                />
              </label>

              <label className="admin-rewards-full-width">
                Image URL (Optional)
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/reward.jpg"
                />
              </label>

              <label className="admin-rewards-full-width">
                Description
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the reward..."
                  rows="3"
                  required
                />
              </label>
            </div>

            <div className="admin-rewards-form-actions">
              <button
                type="button"
                className="admin-rewards-cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-rewards-save-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingReward
                    ? "Update Reward"
                    : "Create Reward"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="admin-rewards-list-card">
        <div className="admin-rewards-list-heading">
          <h2>All Rewards</h2>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search rewards..."
            className="admin-rewards-search"
          />
        </div>

        {loading ? (
          <p className="admin-rewards-message">Loading rewards...</p>
        ) : filteredRewards.length === 0 ? (
          <p className="admin-rewards-message">
            No rewards found.
          </p>
        ) : (
          <div className="admin-rewards-table-wrapper">
            <table className="admin-rewards-table">
              <thead>
                <tr>
                  <th>Reward</th>
                  <th>Category</th>
                  <th>Points Cost</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredRewards.map((reward) => (
                  <tr key={reward._id}>
                    <td>
                      <div className="admin-rewards-name-cell">
                        {reward.imageUrl ? (
                          <img
                            src={reward.imageUrl}
                            alt={reward.name}
                          />
                        ) : (
                          <div className="admin-rewards-image-placeholder">
                            🎁
                          </div>
                        )}

                        <strong>{reward.name}</strong>
                      </div>
                    </td>

                    <td>{reward.category}</td>

                    <td>
                      <strong>{reward.pointsCost.toLocaleString()} pts</strong>
                    </td>

                    <td>{reward.stock}</td>

                    <td>
                      <span
                        className={`admin-rewards-status ${reward.status}`}
                      >
                        {reward.status}
                      </span>
                    </td>

                    <td>
                      <div className="admin-rewards-actions">
                        <button
                          className="admin-rewards-edit-btn"
                          onClick={() => openEditForm(reward)}
                        >
                          Edit
                        </button>

                        <button
                          className={`admin-rewards-status-btn ${reward.status}`}
                          onClick={() => handleStatusChange(reward)}
                        >
                          {reward.status === "active"
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
export default AdminRewards;
