import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import LoginPage from "./Login/LoginPage";
import RegisterPage from "./Register/RegisterPage";
import Dashboard from './Dashboard/Dashboard';
import BudgetInsights from './BudgetInsights/BudgetInsights';

function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      {/* Navigation Links - Only show on login/register pages */}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/insights" element={<BudgetInsights />} />
      </Routes>
    </Router>
  );
}

export default App;