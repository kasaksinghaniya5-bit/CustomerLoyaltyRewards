import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/Leaderboard.css";

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get("/customer/leaderboard");

        setLeaderboard(response.data.leaderboard);
        setCurrentCustomer(response.data.currentCustomer);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load leaderboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="leaderboard-page">
      <Link to="/customer/dashboard" className="leaderboard-back">
        ← Back to dashboard
      </Link>

      <header className="leaderboard-header">
        <span>COMMUNITY RANKINGS</span>
        <h1>The Points League.</h1>
        <p>
          Every point counts. See how you rank among our customers.
        </p>
      </header>

      {currentCustomer && (
        <section className="my-rank-card">
          <div>
            <span>YOUR CURRENT RANK</span>
            <h2>#{currentCustomer.rank}</h2>
          </div>

          <div>
            <span>YOUR AVAILABLE POINTS</span>
            <h2>
              {currentCustomer.availablePoints.toLocaleString("en-IN")}
            </h2>
          </div>
        </section>
      )}

      <section className="leaderboard-content">
        <div className="leaderboard-section-heading">
          <div>
            <span>TOP PERFORMERS</span>
            <h2>Leaderboard</h2>
          </div>

          <span className="top-ten-label">TOP 10</span>
        </div>

        {loading && <p>Loading leaderboard...</p>}

        {error && (
          <p className="leaderboard-error">{error}</p>
        )}

        {!loading && !error && leaderboard.length === 0 && (
          <div className="leaderboard-empty">
            No customers have earned points yet.
          </div>
        )}

        {!loading && !error && leaderboard.length > 0 && (
          <div className="leaderboard-list">
            {leaderboard.map((customer) => {
              const isCurrentCustomer =
                customer.username === currentCustomer?.username;

              return (
                <article
                  key={customer.rank}
                  className={`leaderboard-row ${
                    isCurrentCustomer ? "my-leaderboard-row" : ""
                  }`}
                >
                  <div className={`leaderboard-rank rank-${customer.rank}`}>
                    {customer.rank <= 3
                      ? ["🥇", "🥈", "🥉"][customer.rank - 1]
                      : `#${customer.rank}`}
                  </div>

                  <div className="leaderboard-user">
                    <div className="leaderboard-avatar">
                      {customer.username.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <strong>{customer.username}</strong>
                      {isCurrentCustomer && (
                        <span className="you-label">YOU</span>
                      )}
                    </div>
                  </div>

                  <div className="leaderboard-points">
                    <strong>
                      {customer.availablePoints.toLocaleString("en-IN")}
                    </strong>
                    <span>POINTS</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Leaderboard;