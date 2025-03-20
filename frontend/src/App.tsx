import { Routes, Route, Link } from "react-router-dom";
import LoginPage from "./Login/LoginPage";
import RegisterPage from "./Register/RegisterPage";
import DashboardPage from "./Dashboard/Dashboard";
import ResetPassPage from "./ResetPassword/ResetPassPage";


function App() {

  return (
    <>
      {/* Navigation Links
      <nav>
        <Link to="/" className="nav-link">Login</Link>
        <Link to="/register" className="nav-link">Register</Link>
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/reset-password" className="nav-link">Reset Password</Link>
      </nav> */}

      {/* Routes for Pages */}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/reset-password" element={<ResetPassPage />} />
      </Routes>
    </>
  )
}

export default App
