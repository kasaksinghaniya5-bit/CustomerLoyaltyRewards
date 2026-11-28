
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/AdminCustomers.css";

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/customers");
      setCustomers(response.data.customers);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleStatusChange = async (customer) => {
    const newStatus =
      customer.status === "active" ? "suspended" : "active";

    const confirmed = window.confirm(
      `Are you sure you want to ${newStatus} this customer account?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(customer._id);

      await api.patch(
        `/admin/customers/${customer._id}/status`,
        { status: newStatus }
      );

      setCustomers((previousCustomers) =>
        previousCustomers.map((item) =>
          item._id === customer._id
            ? { ...item, status: newStatus }
            : item
        )
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Unable to update customer status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const searchText = search.toLowerCase();

    return (
      customer.fullName.toLowerCase().includes(searchText) ||
      customer.email.toLowerCase().includes(searchText) ||
      customer.username.toLowerCase().includes(searchText)
    );
  });

  const formatPoints = (points) =>
    (points || 0).toLocaleString("en-IN");

  return (
    <div className="admin-customers-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-icon">◆</span>
          <div>
            <h2>Admin Portal</h2>
            <span>Rewards Management</span>
          </div>
        </div>

        <nav className="admin-nav">
          <Link to="/admin/dashboard">◈ Dashboard</Link>
          <Link to="/admin/customers" className="active">
            ◎ Customers
          </Link>
          <Link to="/admin/product-codes">◇ Product Codes</Link>
          <Link to="/admin/rewards">🎁 Rewards</Link>
          <Link to="/admin/redemptions">↗ Redemptions</Link>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/">← Back to Home</Link>
        </div>
      </aside>

      <main className="admin-customers-main">
        <header className="admin-customers-header">
          <div>
            <span className="admin-eyebrow">CUSTOMER MANAGEMENT</span>
            <h1>Customers</h1>
            <p>View and manage registered customer accounts.</p>
          </div>

          <div className="admin-customers-count">
            <span>Total Customers</span>
            <strong>{customers.length}</strong>
          </div>
        </header>

        <section className="admin-customers-panel">
          <div className="admin-customers-toolbar">
            <div>
              <h2>All Customers</h2>
              <p>Search and manage customer accounts.</p>
            </div>

            <input
              type="search"
              placeholder="Search name, email or username..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {loading ? (
            <div className="admin-customers-message">
              Loading customers...
            </div>
          ) : error ? (
            <div className="admin-customers-message error">
              {error}
              <button onClick={fetchCustomers}>Try Again</button>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="admin-customers-message">
              {search
                ? "No customers match your search."
                : "No customers registered yet."}
            </div>
          ) : (
            <div className="admin-customers-table-wrapper">
              <table className="admin-customers-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Available Points</th>
                    <th>Lifetime Earned</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer._id}>
                      <td>
                        <div className="admin-customer-identity">
                          <strong>{customer.fullName}</strong>
                          <span>@{customer.username}</span>
                        </div>
                      </td>

                      <td>{customer.email}</td>

                      <td>{formatPoints(customer.availablePoints)}</td>

                      <td>{formatPoints(customer.lifetimeEarned)}</td>

                      <td>
                        <span
                          className={`admin-customer-status ${customer.status}`}
                        >
                          {customer.status}
                        </span>
                      </td>

                      <td>
                        <button
                          className={`admin-customer-action ${
                            customer.status === "active"
                              ? "suspend"
                              : "activate"
                          }`}
                          onClick={() => handleStatusChange(customer)}
                          disabled={updatingId === customer._id}
                        >
                          {updatingId === customer._id
                            ? "Updating..."
                            : customer.status === "active"
                              ? "Suspend"
                              : "Reactivate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && (
            <div className="admin-customers-footer">
              Showing {filteredCustomers.length} of {customers.length} customers
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminCustomers;
