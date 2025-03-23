import { Routes, Route, Link } from "react-router-dom";
import LoginPage from "./Login/LoginPage";
import RegisterPage from "./Register/RegisterPage";
import DashboardPage from "./Dashboard/Dashboard";
import ResetPassPage from "./ResetPassword/ResetPassPage";
import BudgetInsights from "./BudgetInsights/BudgetInsights";
import Transactions from "./Transactions/Transactions"; // Add this import
import ProfilePage from './Profile/ProfilePage';

function App() {
  return (
    <>
      {/* Routes for Pages */}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/reset-password" element={<ResetPassPage />} />
        <Route path="/insights" element={<BudgetInsights />} />
        <Route path="/transactions" element={<Transactions />} /> {/* Add this route */}
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  )
}

export default App