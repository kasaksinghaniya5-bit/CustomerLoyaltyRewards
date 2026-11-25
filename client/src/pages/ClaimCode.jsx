import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/ClaimCode.css";

function ClaimCode() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [claimResult, setClaimResult] = useState(null);

  const handleClaim = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setClaimResult(null);

    if (!code.trim()) {
      setError("Please enter your product code.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/customer/claim-code", {
        code: code.trim(),
      });

      setClaimResult(response.data);

      setMessage(response.data.message);

      setCode("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Unable to claim your points. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="claim-page">
      <Link to="/customer/dashboard" className="claim-back">
        ← Back to dashboard
      </Link>

      <div className="claim-card">
        <div className="claim-symbol">✦</div>

        <span className="claim-label">EARN REWARDS</span>

        <h1>Claim your points</h1>

        <p className="claim-description">
          Found a unique code inside your product package?
          Enter it below and turn your purchase into rewards.
        </p>

        <form onSubmit={handleClaim}>
          <label htmlFor="productCode">Your product code</label>

          <input
            id="productCode"
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="e.g. BIS-K7P9X2M8Q4"
            autoComplete="off"
            required
          />

          {error && (
            <p className="claim-error">{error}</p>
          )}

          {message && (
            <p className="claim-success">{message}</p>
          )}

          {claimResult && (
            <div className="claim-result">
              <span>POINTS EARNED</span>
              <strong>+{claimResult.pointsEarned}</strong>
              <p>
                New balance: {claimResult.availablePoints} points
              </p>
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Verifying code..." : "Claim my points →"}
          </button>
        </form>

        <p className="claim-note">
          Each product code can be claimed only once.
        </p>
      </div>
    </div>
  );
}

export default ClaimCode;