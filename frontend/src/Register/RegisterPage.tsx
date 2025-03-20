import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";
import { API_BASE_URL } from "../config";


export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!email || !password || !repeatPassword) {
      alert("Please fill in all fields.");
      return;
    }
    if (password !== repeatPassword) {
      alert("Passwords do not match.");
      return;
    }
    
    // const response = await fetch(`${API_BASE_URL}/account/create`, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ name, email, password }),  
    // }); 
    // if (!response.ok) {
    //   alert("Failed to register. Please try again.");
    //   return;
    // }
    console.log("Registering with:", { email, password });
    navigate("/Dashboard");
  };

  return (
    <div className="main-container">
      <div className="background" />
      <div className="rectangle">
        <h2 className="create-account">Create Your Account</h2>
        <div className="form-register">
          <div className="input-field">
            <label className="label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-field">
            <label className="label" htmlFor="email">Name</label>
            <input
              type="name"
              id="name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
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

          <div className="input-field">
            <label className="label" htmlFor="repeatPassword">Repeat Password</label>
            <input
              type="password"
              id="repeatPassword"
              className="input"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              placeholder="Repeat your password"
              required
            />
          </div>

          <button type="button" className="register-button" onClick={handleRegister}>
            Register
          </button>
        </div>

        <div className="login-container">
          <button className="login-button" onClick={() => navigate("/")}>
          Log In
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