
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/AdminProductCodes.css";

function AdminProductCodes() {
  const [productCodes, setProductCodes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const [formData, setFormData] = useState({
    productName: "",
    points: "",
    quantity: "",
  });

  const fetchProductCodes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/product-codes");
      setProductCodes(response.data.productCodes);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to load product codes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductCodes();
  }, []);

  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleGenerate = async (event) => {
    event.preventDefault();

    if (
      !formData.productName.trim() ||
      Number(formData.points) < 1 ||
      !Number.isInteger(Number(formData.points)) ||
      Number(formData.quantity) < 1 ||
      !Number.isInteger(Number(formData.quantity)) ||
      Number(formData.quantity) > 500
    ) {
      alert("Enter valid product details, points and quantity (maximum 500).");
      return;
    }

    try {
      setGenerating(true);

      const response = await api.post(
        "/admin/product-codes/generate",
        {
          productName: formData.productName,
          points: Number(formData.points),
          quantity: Number(formData.quantity),
        }
      );

      setProductCodes((previousCodes) => [
        ...response.data.productCodes,
        ...previousCodes,
      ]);

      setFormData({
        productName: "",
        points: "",
        quantity: "",
      });

      alert(response.data.message);
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Unable to generate product codes."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleDeactivate = async (productCode) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate code ${productCode.code}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(productCode._id);

      await api.patch(
        `/admin/product-codes/${productCode._id}/deactivate`
      );

      setProductCodes((previousCodes) =>
        previousCodes.map((item) =>
          item._id === productCode._id
            ? { ...item, status: "deactivated" }
            : item
        )
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Unable to deactivate product code."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      alert("Product code copied!");
    } catch {
      alert("Unable to copy the code.");
    }
  };

  const filteredCodes = productCodes.filter((item) => {
    const searchText = search.toLowerCase();

    return (
      item.code.toLowerCase().includes(searchText) ||
      item.productName.toLowerCase().includes(searchText) ||
      item.status.toLowerCase().includes(searchText) ||
      item.claimedBy?.fullName?.toLowerCase().includes(searchText)
    );
  });

  const formatPoints = (points) =>
    (points || 0).toLocaleString("en-IN");

  return (
    <div className="admin-product-codes-page">
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
          <Link to="/admin/customers">◎ Customers</Link>
          <Link to="/admin/product-codes" className="active">
            ◇ Product Codes
          </Link>
          <Link to="/admin/rewards">🎁 Rewards</Link>
          <Link to="/admin/redemptions">↗ Redemptions</Link>
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/">← Back to Home</Link>
        </div>
      </aside>

      <main className="admin-product-codes-main">
        <header className="admin-product-codes-header">
          <div>
            <span className="admin-eyebrow">INVENTORY MANAGEMENT</span>
            <h1>Product Codes</h1>
            <p>Generate, monitor and manage product reward codes.</p>
          </div>

          <div className="admin-code-count">
            <span>Total Generated Codes</span>
            <strong>{productCodes.length}</strong>
          </div>
        </header>

        <section className="admin-code-generator">
          <div className="admin-code-section-heading">
            <div>
              <h2>Generate Product Codes</h2>
              <p>Create unique reward codes for product packaging.</p>
            </div>
            <span className="admin-code-heading-icon">✦</span>
          </div>

          <form onSubmit={handleGenerate}>
            <div className="admin-code-form-grid">
              <div className="admin-code-field">
                <label>Product Name</label>
                <input
                  type="text"
                  name="productName"
                  placeholder="e.g. Premium Biscuit Box"
                  value={formData.productName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="admin-code-field">
                <label>Points per Code</label>
                <input
                  type="number"
                  name="points"
                  placeholder="e.g. 50"
                  min="1"
                  step="1"
                  value={formData.points}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="admin-code-field">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  placeholder="e.g. 100"
                  min="1"
                  max="500"
                  step="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="admin-code-form-footer">
              <span>Maximum 500 codes per batch</span>
              <button type="submit" disabled={generating}>
                {generating ? "Generating..." : "✦ Generate Codes"}
              </button>
            </div>
          </form>
        </section>

        <section className="admin-code-list-panel">
          <div className="admin-code-toolbar">
            <div>
              <h2>All Product Codes</h2>
              <p>Track generated codes and their claim status.</p>
            </div>

            <input
              type="search"
              placeholder="Search code, product, customer or status..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {loading ? (
            <div className="admin-code-message">
              Loading product codes...
            </div>
          ) : error ? (
            <div className="admin-code-message error">
              {error}
              <button onClick={fetchProductCodes}>Try Again</button>
            </div>
          ) : filteredCodes.length === 0 ? (
            <div className="admin-code-message">
              {search
                ? "No product codes match your search."
                : "No product codes generated yet."}
            </div>
          ) : (
            <div className="admin-code-table-wrapper">
              <table className="admin-code-table">
                <thead>
                  <tr>
                    <th>Product Code</th>
                    <th>Product</th>
                    <th>Points</th>
                    <th>Claimed By</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCodes.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="admin-code-copy-cell">
                          <strong>{item.code}</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.code)}
                            title="Copy product code"
                          >
                            Copy
                          </button>
                        </div>
                      </td>

                      <td>{item.productName}</td>

                      <td>{formatPoints(item.points)}</td>

                      <td>
                        {item.claimedBy ? (
                          <div className="admin-code-customer">
                            <strong>{item.claimedBy.fullName}</strong>
                            <span>{item.claimedBy.email}</span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td>
                        <span
                          className={`admin-code-status ${item.status}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>
                        {item.status === "unclaimed" ? (
                          <button
                            className="admin-code-deactivate"
                            onClick={() => handleDeactivate(item)}
                            disabled={updatingId === item._id}
                          >
                            {updatingId === item._id
                              ? "Updating..."
                              : "Deactivate"}
                          </button>
                        ) : (
                          <span className="admin-code-no-action">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && (
            <div className="admin-code-footer">
              Showing {filteredCodes.length} of {productCodes.length} codes
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminProductCodes;
