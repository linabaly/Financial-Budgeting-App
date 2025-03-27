import React, { useState, useCallback, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

// Type definition for login credentials
interface LoginCredentials {
  login: string;
  password: string;
}

// Validation utility functions
const validateLogin = (credentials: LoginCredentials): string[] => {
  const errors: string[] = [];

  if (!credentials.login.trim()) {
    errors.push("Login is required");
  }

  if (!credentials.password.trim()) {
    errors.push("Password is required");
  } else if (credentials.password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  return errors;
};

export default function LoginPage() {
  // State management with more robust typing
  const [credentials, setCredentials] = useState<LoginCredentials>({
    login: "",
    password: ""
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Memoized input change handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [id]: value
    }));
  }, []);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Comprehensive sign-in handler
  const handleSignIn = useCallback(async (e: FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    
    // Reset previous errors
    setErrors([]);
    
    // Validate credentials
    const validationErrors = validateLogin(credentials);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Simulate loading state
    setIsLoading(true);

    try {
      // Simulated authentication logic
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log("Signing in with:", credentials);
      
      // Navigate to dashboard on successful login
      navigate("/Dashboard");
    } catch (error) {
      // Handle login errors
      setErrors(["Authentication failed. Please try again."]);
    } finally {
      setIsLoading(false);
    }
  }, [credentials, navigate]);

  return (
    <div className="main-container">
      <div className="background" />
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Enter your credentials to continue</p>
        
        {/* Error Display */}
        {errors.length > 0 && (
          <div 
            role="alert" 
            className="error-container"
          >
            {errors.map((error, index) => (
              <div key={index} className="error-message">
                <svg className="error-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="16" r="1" fill="currentColor" />
                </svg>
                {error}
              </div>
            ))}
          </div>
        )}

        <form className="login-form" onSubmit={handleSignIn} noValidate>
          <div className="form-group">
            <label 
              htmlFor="login" 
              className="form-label"
            >
              Username or Email
            </label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" />
              </svg>
              <input
                type="text"
                id="login"
                className="form-input"
                value={credentials.login}
                onChange={handleInputChange}
                placeholder="Enter your username or email"
                required
                aria-required="true"
                aria-invalid={errors.some(e => e.includes('Login'))}
                aria-describedby="login-error"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="password-label-wrapper">
              <label 
                htmlFor="password" 
                className="form-label"
              >
                Password
              </label>
              <a 
                href="/reset-password" 
                className="forgot-link"
                aria-label="Forgot password"
              >
                Forgot password?
              </a>
            </div>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2" />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="form-input"
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                aria-required="true"
                aria-invalid={errors.some(e => e.includes('Password'))}
                aria-describedby="password-error"
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 12C2 12 5.5 5 12 5C18.5 5 22 12 22 12C22 12 18.5 19 12 19C5.5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    <path d="M3 21L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 12C2 12 5.5 5 12 5C18.5 5 22 12 22 12C22 12 18.5 19 12 19C5.5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="signin-button" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="spinner" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="62.83" strokeDashoffset="0" />
                </svg>
                Signing In...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="signup-prompt">Don't have an account?</p>
          <button 
            type="button" 
            className="signup-button" 
            onClick={() => navigate("/register")}
            aria-label="Sign up for a new account"
          >
            Create Account
          </button>
        </div>
      </div>

      <div className="welcome-container">
        <div className="brand-wrapper">
          <h1 className="welcome-to">Welcome to</h1>
          <h2 className="finovators">Finovators!</h2>
          <p className="brand-tagline">Track, Manage, Thrive</p>
        </div>
      </div>
    </div>
  );
}