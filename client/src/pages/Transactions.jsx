
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/Transactions.css";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTransactions: 0,
    limit: 10,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/customer/transactions?page=${pagination.currentPage}&limit=${pagination.limit}`
      );

      setTransactions(response.data.transactions);
      setPagination(response.data.pagination);

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to load your transaction history."
      );
    } finally {
      setLoading(false);
    }
  };

  fetchTransactions();
}, [pagination.currentPage, pagination.limit]);

  return (
    <div className="transactions-page">
      <Link to="/customer/dashboard">
        ← Back to dashboard
      </Link>

      <header className="transactions-header">
        <span>YOUR ACCOUNT</span>
        <h1>Points transaction history</h1>
        <p>
          Every point earned and every reward redeemed, all in one place.
        </p>
      </header>

      <section className="transactions-content">
        <h2>All transactions</h2>
        <p>{pagination.totalTransactions} transactions recorded</p>

        {loading && <p>Loading transactions...</p>}

        {error && <p>{error}</p>}

{!loading && !error && transactions.length === 0 && (
  <div className="transactions-empty">
    <h3>No transactions yet</h3>
    <p>
      Your points activity will appear here once you claim a product code
      or redeem a reward.
    </p>
  </div>
)}

{!loading && !error && transactions.length > 0 && (
  <div className="transaction-list">
    {transactions.map((transaction) => (
      <div className="transaction-item" key={transaction._id}>
        <div className="transaction-icon">
          {transaction.type === "earned" ? "✦" : "◇"}
        </div>

{!loading && !error && pagination.totalPages > 0 && (
  <div className="transaction-pagination">
    <button
      type="button"
      disabled={pagination.currentPage === 1}
      onClick={() =>
        setPagination((prev) => ({
          ...prev,
          currentPage: prev.currentPage - 1,
        }))
      }
    >
      ← Previous
    </button>

    <span>
      Page {pagination.currentPage} of {pagination.totalPages}
    </span>

    <button
      type="button"
      disabled={pagination.currentPage === pagination.totalPages}
      onClick={() =>
        setPagination((prev) => ({
          ...prev,
          currentPage: prev.currentPage + 1,
        }))
      }
    >
      Next →
    </button>
  </div>
)}


        <div className="transaction-details">
          <h3>{transaction.description}</h3>
          <p>{transaction.productName || "Points activity"}</p>
          <p>
            {new Date(transaction.createdAt).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="transaction-points">
          <strong>
            {transaction.type === "earned" || transaction.type === "refunded"
  ? "+"
  : "-"}
{transaction.points.toLocaleString("en-IN")}
          </strong>
          <span>Balance: {transaction.balanceAfter}</span>
        </div>
      </div>
    ))}
  </div>
)}

      </section>
    </div>
  );
}

export default Transactions;
