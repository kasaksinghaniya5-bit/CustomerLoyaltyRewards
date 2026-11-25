
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/Rewards.css";

function Rewards() {
const [rewards, setRewards] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [selectedReward, setSelectedReward] = useState(null);
const [redeeming, setRedeeming] = useState(false);
const [redemptionResult, setRedemptionResult] = useState(null);

useEffect(() => {
  const fetchRewards = async () => {
    try {
      const response = await api.get("/customer/rewards");
      setRewards(response.data.rewards);
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to load available rewards."
      );
    } finally {
      setLoading(false);
    }
  };

  fetchRewards();
}, []);

const handleRedeem = async () => {
  if (!selectedReward) return;

  setRedeeming(true);
  setError("");

  try {
    const response = await api.post("/customer/redeem", {
      rewardId: selectedReward._id,
    });

    setRedemptionResult(response.data.redemption);
    setSelectedReward(null);

    setRewards((previousRewards) =>
      previousRewards.map((reward) =>
        reward._id === selectedReward._id
          ? { ...reward, stock: reward.stock - 1 }
          : reward
      )
    );
  } catch (error) {
    setError(
      error.response?.data?.message ||
        "Unable to redeem this reward. Please try again."
    );
  } finally {
    setRedeeming(false);
  }
};

  return (
    <div className="rewards-page">
      <Link to="/customer/dashboard" className="rewards-back">
        ← Back to dashboard
      </Link>

      <header className="rewards-header">
        <span>YOUR REWARDS STORE</span>
        <h1>Something special awaits you.</h1>
        <p>
          Turn the points you've collected into rewards you'll love.
        </p>
      </header>

      <section className="rewards-catalogue">
        <div className="rewards-section-heading">
          <div>
            <h2>Explore rewards</h2>
            <p>Find something worth saving your points for.</p>
          </div>
        </div>

        
<div className="rewards-grid">
  {loading && <p>Loading rewards...</p>}

  {error && <p>{error}</p>}

  {!loading && !error && rewards.length === 0 && (
    <div className="rewards-empty">
      <h3>New rewards are on their way!</h3>
      <p>
        There are no available rewards right now.
        Check back soon for something special.
      </p>
    </div>
  )}

  {!loading && !error && rewards.map((reward) => (
    <div className="reward-card" key={reward._id}>
      <div className="reward-image">
        {reward.imageUrl ? (
          <img src={reward.imageUrl} alt={reward.name} />
        ) : (
          "🎁"
        )}
      </div>

      <div className="reward-card-content">
        <span className="reward-category">
          {reward.category}
        </span>

        <h3>{reward.name}</h3>

        <p className="reward-description">
          {reward.description}
        </p>

        <div className="reward-cost">
          {reward.pointsCost.toLocaleString("en-IN")} points
        </div>

        <p className="reward-stock">
          {reward.stock} available
        </p>

        <button
  type="button"
  onClick={() => setSelectedReward(reward)}
>
  Redeem reward →
</button>
      </div>
    </div>
  ))}
</div>

      </section>
            {selectedReward && (
        <div className="redemption-modal-overlay">
          <div className="redemption-modal">
            <button
              type="button"
              className="redemption-modal-close"
              onClick={() => setSelectedReward(null)}
            >
              ×
            </button>

            <span className="redemption-modal-icon">🎁</span>

            <span className="redemption-modal-label">
              CONFIRM YOUR REDEMPTION
            </span>

            <h2>{selectedReward.name}</h2>

            <p>
              You're about to redeem this reward using your collected points.
            </p>

            <div className="redemption-modal-cost">
              <span>Points required</span>
              <strong>
                {selectedReward.pointsCost.toLocaleString("en-IN")} points
              </strong>
            </div>

            <div className="redemption-modal-actions">
              <button
                type="button"
                className="redemption-cancel-btn"
                onClick={() => setSelectedReward(null)}
              >
                Go back
              </button>

             <button
  type="button"
  className="redemption-confirm-btn"
  onClick={handleRedeem}
  disabled={redeeming}
>
  {redeeming ? "Processing..." : "Confirm redemption"}
</button>
            </div>
          </div>
        </div>
      )}
            {redemptionResult && (
        <div className="redemption-modal-overlay">
          <div className="redemption-modal redemption-success-modal">
            <span className="redemption-modal-icon">🎉</span>

            <span className="redemption-modal-label">
              REDEMPTION SUCCESSFUL
            </span>

            <h2>Your reward is reserved!</h2>

            <p>
              You've successfully redeemed {redemptionResult.rewardName}.
              Keep this code safe for collection.
            </p>

            <div className="redemption-code-box">
              <span>YOUR REDEMPTION CODE</span>
              <strong>{redemptionResult.redemptionCode}</strong>

              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText(
                    redemptionResult.redemptionCode
                  )
                }
              >
                Copy code
              </button>
            </div>

            <div className="redemption-modal-cost">
              <span>Points spent</span>
              <strong>
                {redemptionResult.pointsSpent.toLocaleString("en-IN")} points
              </strong>
            </div>

            <p className="redemption-expiry">
              Valid until:{" "}
              {new Date(redemptionResult.expiresAt).toLocaleDateString("en-IN")}
            </p>

            <button
              type="button"
              className="redemption-confirm-btn"
              onClick={() => setRedemptionResult(null)}
            >
              Continue exploring
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rewards;
