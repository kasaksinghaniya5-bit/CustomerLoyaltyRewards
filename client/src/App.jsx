
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";

import Home from "./pages/Home";
import PortalLogin from "./pages/PortalLogin";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/CustomerDashboard";
import ClaimCode from "./pages/ClaimCode";
import Transactions from "./pages/Transactions";
import Rewards from "./pages/Rewards";
import Redemptions from "./pages/Redemptions";
import Notifications from "./pages/Notifications";
import Leaderboard from "./pages/Leaderboard";

function App() {
  return (
    <ThemeProvider>
      <ThemeToggle />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login/:role" element={<PortalLogin />} />
        <Route path="/register" element={<Register />} />

        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/customer/claim-code" element={<ClaimCode />} />
        <Route path="/customer/transactions" element={<Transactions />} />
        <Route path="/customer/rewards" element={<Rewards />} />
        <Route path="/customer/redemptions" element={<Redemptions />} />
        <Route path="/customer/notifications" element={<Notifications />} />
        <Route path="/customer/leaderboard" element={<Leaderboard />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
