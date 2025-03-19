import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import LoginPage from "./Login/LoginPage";
import RegisterPage from "./Register/RegisterPage";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* Navigation Links */}
      <nav>
        <Link to="/" className="nav-link">Login</Link>
        <Link to="/register" className="nav-link">Register</Link>
      </nav>

      {/* Routes for Pages */}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </>
  )
}

export default App
