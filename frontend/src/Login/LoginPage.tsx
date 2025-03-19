import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // Hook to handle navigation


  const handleSignIn = () => {
    if (!login || !password) {
      alert("Please fill in all fields.");
      return;
    }
    console.log("Signing in with:", { login, password });
    navigate("/Dashboard"); // Navigate to dashboard
  };



  return (
    <div className="main-container">
      <div className="background" />
      <div className="rectangle">
        <h2 className="login-title">Login to Your Account</h2>
        <div className="form-login">
          <div className="input-field">
            <label className="label" htmlFor="login">Login</label>
            <input
              type="text"
              id="login"
              className="input"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Enter your login"
              required
            />
          </div>

          <div className="input-field">
            <label className="label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="button" className="signin-button" onClick={handleSignIn}>
            Sign In
          </button>
          
          <div className="forgot-password">
            <a href="/reset-password" className="forgot-link">Forgot password?</a>
          </div>
        </div>

        <div className="signup-container">
          <button className="signup-button" onClick={() => navigate("/register")}>
            Sign Up
          </button>
        </div>
      </div>

      <div className="welcome-container">
        <h1 className="welcome-to">Welcome to</h1>
        <h2 className="finovators">Finovators!</h2>
      </div>
    </div>
  );
}