import { Link } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  return (
    <div className="home-container">

      <header className="home-header">
        <div className="brand">
          <span className="brand-icon">✦</span>
          <span>Loyalty Rewards</span>
        </div>

        <span className="header-tagline">
          A little more joy with every purchase
        </span>
      </header>

      <main className="home-main">

        <section className="welcome-section">
          <span className="welcome-label">WELCOME TO YOUR REWARDS WORLD</span>

          <h1>
            Every purchase has
            <br />
            <span>a little extra.</span>
          </h1>

          <p>
            Collect points, discover exciting rewards and
            make every purchase count.
          </p>
        </section>

        <section className="portal-section">
          <div className="portal-heading">
            <h2>Choose your portal</h2>
            <p>Where would you like to go today?</p>
          </div>

          <div className="portal-grid">

            <Link to="/login/customer" className="portal-card customer-card">
              <div className="portal-icon">♡</div>
              <span className="portal-label">FOR CUSTOMERS</span>
              <h3>Your rewards, your way.</h3>
              <p>
                Collect points, explore rewards and enjoy
                something special with every purchase.
              </p>
              <span className="portal-action">Customer Portal →</span>
            </Link>

            <Link to="/login/admin" className="portal-card admin-card">
              <div className="portal-icon">✦</div>
              <span className="portal-label">FOR ADMINISTRATORS</span>
              <h3>Everything in control.</h3>
              <p>
                Manage products, reward programmes,
                customers and system activity.
              </p>
              <span className="portal-action">Admin Portal →</span>
            </Link>

            <Link to="/login/staff" className="portal-card staff-card">
              <div className="portal-icon">✓</div>
              <span className="portal-label">FOR STAFF</span>
              <h3>Make rewards happen.</h3>
              <p>
                Verify redemption codes and help customers
                collect their rewards.
              </p>
              <span className="portal-action">Staff Portal →</span>
            </Link>

          </div>
        </section>

      </main>

      <footer className="home-footer">
        Making every purchase a little more rewarding.
      </footer>

    </div>
  );
}

export default Home;
