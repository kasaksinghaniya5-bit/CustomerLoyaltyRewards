import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/Redemptions.css";

function Redemptions() {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchRedemptions = async () => {
    try {
      const response = await api.get("/customer/redemptions");
      setRedemptions(response.data.redemptions);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load your redemptions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const handleCancel = async (redemption) => {
    const confirmed = window.confirm(
      `Cancel "${redemption.rewardName}"?\n\n` +
        `${redemption.pointsSpent.toLocaleString("en-IN")} points will be refunded and the reward will return to stock.`
    );

    if (!confirmed) {
      return;
    }

    setCancellingId(redemption._id);
    setError("");
    setSuccessMessage("");

    try {
      const response = await api.post(
        `/customer/redemptions/${redemption._id}/cancel`
      );

      setSuccessMessage(
        response.data.message ||
          "Redemption cancelled and points refunded successfully!"
      );

      await fetchRedemptions();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to cancel this redemption."
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="redemptions-page">
      <Link to="/customer/dashboard" className="redemptions-back">
        ← Back to dashboard
      </Link>

      <header className="redemptions-header">
        <span>YOUR REDEMPTIONS</span>
        <h1>Rewards you've chosen.</h1>
        <p>
          Keep track of your rewards, collection codes and redemption status.
        </p>
      </header>

      <section className="redemptions-content">
        {loading && <p>Loading your redemptions...</p>}

        {error && <p className="redemptions-error">{error}</p>}

        {successMessage && (
          <p className="redemptions-success">
            {successMessage}
          </p>
        )}

        {!loading && !error && redemptions.length === 0 && (
          <div className="redemptions-empty">
            <span>🎁</span>
            <h2>No redemptions yet</h2>
            <p>
              When you redeem a reward, it will appear here with its
              collection code.
            </p>

            <Link to="/customer/rewards">
              Explore rewards →
            </Link>
          </div>
        )}

        {!loading && !error && redemptions.length > 0 && (
          <div className="redemptions-list">
            {redemptions.map((redemption) => (
              <article
                className="redemption-history-card"
                key={redemption._id}
              >
                <div className="redemption-history-top">
                  <div>
                    <span className="redemption-history-category">
                      REWARD
                    </span>

                    <h2>{redemption.rewardName}</h2>
                  </div>

                  <span
                    className={`redemption-status status-${redemption.status}`}
                  >
                    {redemption.status}
                  </span>
                </div>

                <div className="redemption-history-details">
                  <div>
                    <span>Redemption code</span>
                    <strong>{redemption.redemptionCode}</strong>
                  </div>

                  <div>
                    <span>Points spent</span>
                    <strong>
                      {redemption.pointsSpent.toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div>
                    <span>Valid until</span>
                    <strong>
                      {new Date(
                        redemption.expiresAt
                      ).toLocaleDateString("en-IN")}
                    </strong>
                  </div>

                  <div>
                    <span>Redeemed on</span>
                    <strong>
                      {new Date(
                        redemption.createdAt
                      ).toLocaleDateString("en-IN")}
                    </strong>
                  </div>
                </div>

                {redemption.status === "active" && (
                  <div className="redemption-actions">
                    <button
                      type="button"
                      onClick={() => handleCancel(redemption)}
                      disabled={cancellingId === redemption._id}
                    >
                      {cancellingId === redemption._id
                        ? "Cancelling..."
                        : "Cancel redemption"}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Redemptions;