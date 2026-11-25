import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/Register.css";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const handleSubmit = async (event) => {
  event.preventDefault();

  setPasswordError("");
  setSuccessMessage("");

  const form = event.currentTarget;

  const fullName = form.querySelector("#fullName").value.trim();
  const email = form.querySelector("#registerEmail").value.trim();
  const username = form.querySelector("#username").value.trim();
  const password = form.querySelector("#registerPassword").value;
  const confirmPassword = form.querySelector("#confirmPassword").value;

  const usernamePattern = /^[A-Za-z0-9_]{3,20}$/;

  if (!usernamePattern.test(username)) {
    setPasswordError("Username must be 3–20 characters and contain only letters, numbers or underscores.");
    return;
  }

  if (password.length < 8) {
    setPasswordError("Password must contain at least 8 characters.");
    return;
  }

  if (password !== confirmPassword) {
    setPasswordError("Passwords do not match. Please try again.");
    return;
  }

  try {
    setLoading(true);

    const response = await api.post("/auth/register", {
      fullName,
      email,
      username,
      password,
    });

    setSuccessMessage(response.data.message);

    form.reset();
    setShowPassword(false);
    setShowConfirmPassword(false);

  } catch (error) {
    setPasswordError(
      error.response?.data?.message ||
      "Registration failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="register-container">
      <div className="register-card">

        <Link to="/login/customer" className="register-back">
          ← Back to login
        </Link>

        <div className="register-brand">
          <span>✦</span> Loyalty Rewards
        </div>

        <span className="register-label">JOIN OUR REWARDS WORLD</span>

        <h1>Create your account</h1>

        <p className="register-subtitle">
          A little extra joy starts with you.
        </p>

        <form className="register-form" onSubmit={handleSubmit}>

          <label htmlFor="fullName">Full name</label>
          <input
            type="text"
            id="fullName"
            placeholder="Enter your full name"
            required
          />

          <label htmlFor="registerEmail">Email address</label>
          <input
            type="email"
            id="registerEmail"
            placeholder="Enter your email"
            required
          />

          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Choose a username"
            required
          />

         <label htmlFor="registerPassword">Password</label>

<div className="password-input-wrapper">
  <input
    type={showPassword ? "text" : "password"}
    id="registerPassword"
    placeholder="Create a password"
    required
  />

  <button
    type="button"
    className="password-toggle"
    onClick={() => setShowPassword(!showPassword)}
    aria-label={showPassword ? "Hide password" : "Show password"}
  >
    {showPassword ? "🙈" : "👁"}
  </button>
</div>

          <label htmlFor="confirmPassword">Confirm password</label>

<div className="password-input-wrapper">
  <input
    type={showConfirmPassword ? "text" : "password"}
    id="confirmPassword"
    placeholder="Enter your password again"
    required
  />

  <button
    type="button"
    className="password-toggle"
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    aria-label={
      showConfirmPassword ? "Hide password" : "Show password"
    }
  >
    {showConfirmPassword ? "🙈" : "👁"}
  </button>
</div>
{passwordError && (
  <p className="password-error">
    {passwordError}
  </p>
)}
          <button
  type="submit"
  className="register-button"
  disabled={loading}
>
  {loading ? "Creating account..." : "Create account →"}
</button>

        </form>

        {successMessage && (
  <p className="success-message">
    {successMessage}
  </p>
)}

        <p className="register-login-prompt">
          Already have an account?{" "}
          <Link to="/login/customer">Sign in</Link>
        </p>

        <p className="register-footer">
          Your rewards journey begins here.
        </p>

      </div>
    </div>
  );
}
export default Register;