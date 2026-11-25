import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/CustomerDashboard.css";
//import ThemeToggle from "../components/ThemeToggle";

function CustomerDashboard() {
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState(() =>
  JSON.parse(localStorage.getItem("customerData") || "{}")
);

const [profileError, setProfileError] = useState("");
const [transactions, setTransactions] = useState([]);
const [leaderboard, setLeaderboard] = useState([]);
const [currentCustomerRank, setCurrentCustomerRank] = useState(null);
const [leaderboardLoading, setLeaderboardLoading] = useState(true);

useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const [profileResponse, transactionResponse] = await Promise.all([
        api.get("/customer/profile"),
        api.get("/customer/transactions"),
      ]);

      setCustomerData(profileResponse.data.customer);

      localStorage.setItem(
        "customerData",
        JSON.stringify(profileResponse.data.customer)
      );

      setTransactions(transactionResponse.data.transactions);
      // Fetch leaderboard data
try {
  const leaderboardResponse = await api.get("/customer/leaderboard");

  setLeaderboard(leaderboardResponse.data.leaderboard);
  setCurrentCustomerRank(leaderboardResponse.data.currentCustomer);
} catch (error) {
  console.error("Unable to load leaderboard:", error);
} finally {
  setLeaderboardLoading(false);
}
    } catch (error) {
      setProfileError(
        error.response?.data?.message ||
        "Unable to load your account details."
      );
    }
  };

  fetchDashboardData();
}, []);

  return (
    <div className="customer-dashboard">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span>✦</span> Loyalty Rewards
        </div>

        <p className="sidebar-label">MENU</p>

        
<nav className="dashboard-nav">
  <Link to="/customer/dashboard" className="active">
    ◈ Dashboard
  </Link>

  <Link to="/customer/transactions">
    ↗ My Transactions
  </Link>

  <Link to="/customer/rewards">
    ◇ Explore Rewards
  </Link>

  <Link to="/customer/redemptions">
    🎁 My Redemptions
  </Link>

  <Link to="/customer/notifications">
    ♧ Notifications
  </Link>

  <Link to="/customer/leaderboard">
    ♛ Leaderboard
  </Link>
</nav>


        <div className="sidebar-bottom">
          <p>Making every purchase rewarding.</p>
        </div>
      </aside>

      <main className="dashboard-main">
        {profileError && (
  <div className="profile-error">
    {profileError}
  </div>
)}
  <div className="dashboard-header">
    <div>
      <span className="dashboard-greeting">CUSTOMER OVERVIEW</span>
      <h1>Welcome back, {customerData.fullName || "Customer"}!</h1>
      <p>Your rewards journey continues here.</p>
    </div>

    <div className="dashboard-header-actions">
  <div className="customer-avatar">
    {(customerData.fullName || "C").charAt(0).toUpperCase()}
  </div>
</div>
  </div>

  <section className="points-overview">
    <div className="points-card available-card">
      <span>AVAILABLE POINTS</span>
      <h2>{customerData.availablePoints ?? 0}</h2>
      <p>Ready to use on your favourite rewards</p>
    </div>

    <div className="points-card">
      <span>LIFETIME EARNED</span>
      <h2>{customerData.lifetimeEarned ?? 0}</h2>
      <p>Points collected so far</p>
    </div>

    <div className="points-card">
      <span>TOTAL REDEEMED</span>
      <h2>{customerData.totalRedeemed ?? 0}</h2>
      <p>Points exchanged for rewards</p>
    </div>
  </section>
  <section className="quick-actions">
  <div className="section-heading">
    <h2>Quick actions</h2>
    <p>Make the most of your loyalty points.</p>
  </div>

  <div className="action-grid">
    <div className="action-card claim-action">
      <div className="action-icon">✦</div>
      <h3>Claim your points</h3>
      <p>Enter the unique code inside your product package.</p>
      <button
  type="button"
  onClick={() => navigate("/customer/claim-code")}
>
  Claim a code →
</button>
    </div>

    <div className="action-card rewards-action">
      <div className="action-icon">◇</div>
      <h3>Explore rewards</h3>
      <p>Discover exciting rewards waiting to be yours.</p>
      <button
  type="button"
  onClick={() => navigate("/customer/rewards")}
>
  Browse rewards →
</button>
    </div>

<div className="action-card">
  <div className="action-icon">🎁</div>
  <h3>My Redemptions</h3>
  <p>View your redeemed rewards and track their status.</p>
  <button
    type="button"
    onClick={() => navigate("/customer/redemptions")}
  >
    View redemptions →
  </button>
</div>

<div className="action-card">
  <div className="action-icon">🔔</div>
  <h3>Notifications</h3>
  <p>Stay updated about your points and reward activities.</p>
  <button
    type="button"
    onClick={() => navigate("/customer/notifications")}
  >
    View notifications →
  </button>
</div>

<div className="action-card">
  <div className="action-icon">🏆</div>
  <h3>Leaderboard</h3>
  <p>Check your ranking and see the top customers.</p>
  <button
    type="button"
    onClick={() => navigate("/customer/leaderboard")}
  >
    View leaderboard →
  </button>
</div>

  </div>
</section>

<section className="recent-transactions" id="transactions">
  <div className="section-heading">
    <h2>Recent transactions</h2>
    <p>Keep track of your points activity.</p>
  </div>

  {transactions.length === 0 ? (
  <div className="transaction-empty">
    <div className="empty-icon">↗</div>
    <h3>No transactions yet</h3>
    <p>
      Your claimed points and redeemed rewards will appear here.
    </p>
  </div>
) : (
  <div className="transaction-list">
    {transactions.map((transaction) => (
      <div className="transaction-item" key={transaction._id}>
        <div className="transaction-icon">✦</div>

        <div className="transaction-details">
          <h3>{transaction.description}</h3>
          <p>
            {transaction.productName || "Points activity"}
          </p>
        </div>

        <div className="transaction-points">
          <strong>
            {transaction.type === "earned" || transaction.type === "refunded"
  ? "+"
  : "-"}            {transaction.points}
          </strong>

          <span>
            Balance: {transaction.balanceAfter}
          </span>
        </div>
      </div>
    ))}
  </div>
)}
</section>

<section className="rewards-preview" id="rewards">
  <div className="section-heading">
    <h2>Rewards you can look forward to</h2>
    <p>Collect points today. Treat yourself tomorrow.</p>
  </div>

  <div className="rewards-grid">
    <div className="reward-card">
      <div className="reward-image reward-one">🎧</div>
      <span className="reward-category">ELECTRONICS</span>
      <h3>Wireless Headphones</h3>
      <p>1,500 points</p>
    </div>

    <div className="reward-card">
      <div className="reward-image reward-two">☕</div>
      <span className="reward-category">LIFESTYLE</span>
      <h3>Premium Coffee Mug</h3>
      <p>500 points</p>
    </div>

    <div className="reward-card">
      <div className="reward-image reward-three">🎒</div>
      <span className="reward-category">ACCESSORIES</span>
      <h3>Everyday Backpack</h3>
      <p>2,000 points</p>
    </div>
  </div>
</section>

<section className="leaderboard-preview" id="leaderboard">
  <div className="section-heading">
    <h2>Leaderboard</h2>
    <p>See who's climbing the rewards ladder.</p>
  </div>

  {leaderboardLoading ? (
    <div className="leaderboard-empty">
      <p>Loading leaderboard...</p>
    </div>
  ) : leaderboard.length === 0 ? (
    <div className="leaderboard-empty">
      <div className="leaderboard-icon">♛</div>
      <h3>No rankings yet!</h3>
      <p>Start collecting points to appear on the leaderboard.</p>
    </div>
  ) : (
    <>
      <div className="dashboard-leaderboard-list">
        {leaderboard.slice(0, 5).map((customer) => {
          const isYou =
            customer.username === currentCustomerRank?.username;

          return (
            <div
              className={`dashboard-leaderboard-row ${isYou ? "is-you" : ""}`}
              key={customer.username}
            >
              <span className="dashboard-leaderboard-rank">
                {customer.rank <= 3
                  ? ["🥇", "🥈", "🥉"][customer.rank - 1]
                  : `#${customer.rank}`}
              </span>

              <span className="dashboard-leaderboard-user">
                {customer.username}
                {isYou && <strong> (You)</strong>}
              </span>

              <span className="dashboard-leaderboard-points">
                {customer.availablePoints.toLocaleString("en-IN")} pts
              </span>
            </div>
          );
        })}
      </div>

      {currentCustomerRank && (
        <div className="dashboard-your-rank">
          Your current rank: <strong>#{currentCustomerRank.rank}</strong>
          {" · "}
          {currentCustomerRank.availablePoints.toLocaleString("en-IN")} points
        </div>
      )}

      <Link
        to="/customer/leaderboard"
        className="dashboard-leaderboard-link"
      >
        View Full Leaderboard →
      </Link>
    </>
  )}
</section>

</main>
    </div>
  );
}

export default CustomerDashboard;