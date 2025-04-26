/**
 * LoginPage Component
 * 
 * This file implements a responsive login page with validation, error handling, 
 * and authentication logic. The page displays a branded welcome message alongside
 * a login form with email and password inputs.
 * 
 * Key features:
 * - Form validation with error messaging
 * - Password visibility toggle
 * - Loading states
 * - Authentication API integration
 * - Responsive design for various screen sizes
 */

import React, { useState, useCallback, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { API_BASE_URL } from "../config";

/**
 * Interface defining the structure for login credentials
 * @property {string} login - User's email address
 * @property {string} password - User's password
 */
interface LoginCredentials {
  login: string;
  password: string;
}

/**
 * Validates user login credentials
 * 
 * @param credentials - The user's login credentials to validate
 * @returns An array of error messages, empty if validation passes
 */
const validateLogin = (credentials: LoginCredentials): string[] => {
  const errors: string[] = [];

  // Validate login field (email)
  if (!credentials.login.trim()) {
    errors.push("Login is required");
  }

  // Validate password field
  if (!credentials.password.trim()) {
    errors.push("Password is required");
  } else if (credentials.password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  return errors;
};

/**
 * LoginPage Component
 * 
 * Renders a login form with validation, error handling, and authentication.
 * Manages form state, processes user input, and handles the authentication process.
 */
export default function LoginPage() {
  // ========== STATE MANAGEMENT ==========
  
  // Form data state
  const [credentials, setCredentials] = useState<LoginCredentials>({
    login: "",
    password: ""
  });
  
  // UI state
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Navigation hook for redirecting after login
  const navigate = useNavigate();

  // ========== EVENT HANDLERS ==========

  // ========== EVENT HANDLERS ==========

  // ========== EVENT HANDLERS ==========

  /**
   * Handles form input changes
   * Updates the credentials state when input values change
   * 
   * @param e - The input change event
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [id]: value
    }));
  }, []);

  /**
   * Toggles password visibility between plain text and hidden
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  /**
   * Handles the sign-in process
   * Validates input, makes authentication API call, and handles success/failure
   * 
   * @param e - The form submission event
   */
  const handleSignIn = useCallback(async (e: FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    
    // Reset any previous error messages
    setErrors([]);
    
    // Validate user input
    const validationErrors = validateLogin(credentials);
    
    // If validation fails, display errors and stop the login process
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Set loading state to show user that login is processing
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
  
      const response = await fetch(`${API_BASE_URL}/account/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.login,
          password: credentials.password,
        }),
        signal: controller.signal,
      });
  
      clearTimeout(timeoutId);
  
      if (!response.ok) {
        let message = "Login failed";
        try {
          const data = await response.json();
          if (data.message) message = data.message;
        } catch {
          if (response.status === 401) {
            message = "Incorrect email or password";
          }
        }
        setErrors([message]);
        setIsLoading(false);
        return;
      }
    
      // Process successful response
      const data = await response.json();
      
      // Store authentication data in local storage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.id);
    
      // Navigate to dashboard on successful login
      navigate("/Dashboard");
  
    } catch (error: any) {
      if (error.name === "AbortError") {
        setErrors(["Account not found or invalid login credentials."]);
      } else {
        setErrors(["Login failed: " + error.message]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [credentials, navigate]);

  // ========== COMPONENT RENDER ==========
  return (
    <div className="main-container">
      {/* Animated background gradient */}
      <div className="background" />
      
      {/* Login form card */}
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Enter your credentials to continue</p>
        
        {/* Error message display area */}
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

        {/* Login form */}
        <form className="login-form" onSubmit={handleSignIn} noValidate>
          {/* Email input field */}
          <div className="form-group">
            <label 
              htmlFor="login" 
              className="form-label"
            >
              Email
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
                placeholder="Enter your email"
                required
                aria-required="true"
                aria-invalid={errors.some(e => e.includes('Login'))}
                aria-describedby="login-error"
              />
            </div>
          </div>

          {/* Password input field with show/hide toggle */}
          <div className="form-group">
            <div className="password-label-wrapper">
              <label 
                htmlFor="password" 
                className="form-label"
              >
                Password
              </label>
              <a 
                href="mailto:contact@finovators.com?subject=Password%20Help&body=Hi%20Finovators%20Team,%0D%0A%0D%0AI%20need%20help%20resetting%20my%20password.%20My%20account%20email%20is:%20[insert%20your%20email%20here].%0D%0A%0D%0AThank%20you!"
                className="forgot-link"
                aria-label="Email support for password help"
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
              {/* Toggle button for password visibility */}
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

          {/* Submit button with loading state */}
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

        {/* Account creation footer */}
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

      {/* Welcome message container */}
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
