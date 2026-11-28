
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/PortalLogin.css";

const portalDetails = {
  customer: {
    title: "Welcome back!",
    subtitle: "Your rewards journey continues here.",
    label: "CUSTOMER PORTAL",
    theme: "customer-theme",
  },
  admin: {
    title: "Administrator login",
    subtitle: "Manage your loyalty programme.",
    label: "ADMIN PORTAL",
    theme: "admin-theme",
  },
  staff: {
    title: "Staff login",
    subtitle: "Ready to make someone's day?",
    label: "STAFF PORTAL",
    theme: "staff-theme",
  },
};

function PortalLogin() {
  const { role } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

    const handleLogin = async (event) => {
    event.preventDefault();

    setLoginError("");

    const form = event.currentTarget;

    const email = form.querySelector("#email").value.trim();
    const password = form.querySelector("#password").value;

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

     if (role === "customer") {
  localStorage.setItem("customerToken", response.data.token);
  localStorage.setItem(
    "customerData",
    JSON.stringify(response.data.customer)
  );

  navigate("/customer/dashboard");
} else if (role === "admin") {
  localStorage.setItem("adminToken", response.data.token);
  localStorage.setItem(
    "adminData",
    JSON.stringify(response.data.customer)
  );

  navigate("/admin/dashboard");
}

    } catch (error) {
      setLoginError(
        error.response?.data?.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const portal = portalDetails[role];

  if (!portal) {
    return (
      <div className="login-not-found">
        <h2>Portal not found</h2>
        <Link to="/">Return home</Link>
      </div>
    );
  }

  return (
    <div className={`login-container ${portal.theme}`}>
      <div className="login-card">

        <Link to="/" className="back-home">
          ← Back to home
        </Link>

        <div className="login-brand">
          <span>✦</span> Loyalty Rewards
        </div>

        <span className="login-label">{portal.label}</span>

        <h1>{portal.title}</h1>
        <p className="login-subtitle">{portal.subtitle}</p>

        <form className="login-form" onSubmit={handleLogin}>
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            required
          />

          {role === "customer" && (
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          )}

          {loginError && (
  <p className="login-error">
    {loginError}
  </p>
)}

          <button
  type="submit"
  className="login-button"
  disabled={loading}
>
  {loading ? "Signing in..." : "Sign in →"}
</button>

        </form>

        {role === "customer" && (
          <p className="signup-prompt">
            New here? <Link to="/register">Create an account</Link>
          </p>
        )}

        <p className="login-footer">
          Secure access to your loyalty account.
        </p>

      </div>
    </div>
  );
}

export default PortalLogin;
