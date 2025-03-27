import React, { useState, useCallback, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "./RegisterPage.css";

// Type definition for registration form
interface RegistrationForm {
  email: string;
  name: string;
  password: string;
  repeatPassword: string;
}

// Password strength levels
enum PasswordStrength {
  None = 0,
  Weak = 1,
  Fair = 2,
  Good = 3,
  Strong = 4,
  VeryStrong = 5
}

// Validation utility functions
const validateRegistration = (form: RegistrationForm): string[] => {
  const errors: string[] = [];

  if (!form.email.trim()) {
    errors.push("Email is required");
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.push("Please enter a valid email address");
  }

  if (!form.name.trim()) {
    errors.push("Name is required");
  }

  if (!form.password.trim()) {
    errors.push("Password is required");
  } else if (form.password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  if (!form.repeatPassword.trim()) {
    errors.push("Please confirm your password");
  } else if (form.password !== form.repeatPassword) {
    errors.push("Passwords do not match");
  }

  return errors;
};

// Check password strength
const checkPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return PasswordStrength.None;
  
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character variety checks
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  // Cap the score at 5
  return Math.min(score, 5) as PasswordStrength;
};

// Get description for password strength
const getStrengthDescription = (strength: PasswordStrength): string => {
  switch (strength) {
    case PasswordStrength.None:
      return "Enter a password";
    case PasswordStrength.Weak:
      return "Weak";
    case PasswordStrength.Fair:
      return "Fair";
    case PasswordStrength.Good:
      return "Good";
    case PasswordStrength.Strong:
      return "Strong";
    case PasswordStrength.VeryStrong:
      return "Very Strong";
    default:
      return "";
  }
};

export default function RegisterPage() {
  // State management with more robust typing
  const [formData, setFormData] = useState<RegistrationForm>({
    email: "",
    name: "",
    password: "",
    repeatPassword: ""
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(PasswordStrength.None);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const navigate = useNavigate();

  // Memoized input change handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    // Update password strength when password changes
    if (id === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  }, []);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Toggle confirm password visibility
  const toggleRepeatPasswordVisibility = useCallback(() => {
    setShowRepeatPassword(prev => !prev);
  }, []);

  // Handle registration
  const handleRegister = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    
    // Reset previous errors
    setErrors([]);
    
    // Validate form data
    const validationErrors = validateRegistration(formData);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Set loading state
    setIsLoading(true);

    try {
      // Simulated API call
      // In a real app, uncomment the fetch code
      
      const response = await fetch(`${API_BASE_URL}/account/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: formData.name, 
          email: formData.email, 
          password: formData.password 
        }),  
      }); 
      console.log(response)
      if (!response.ok) {
        throw new Error("Failed to register");
      }
      
      
      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Registering with:", { 
        email: formData.email, 
        name: formData.name, 
        password: formData.password 
      });
      
      // Navigate to dashboard on successful registration
      navigate("/Dashboard");
    } catch (error) {
      setErrors(["Registration failed. Please try again."]);
    } finally {
      setIsLoading(false);
    }
  }, [formData, navigate]);

  return (
    <div className="main-container">
      <div className="background" />
      <div className="register-card">
        <h2 className="register-title">Create Your Account</h2>
        <p className="register-subtitle">Join Finovators and start your journey</p>
        
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

        <form className="register-form" onSubmit={handleRegister} noValidate>
          <div className="form-group">
            <label 
              htmlFor="email" 
              className="form-label"
            >
              Email Address
            </label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M2 7L12 14L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="email"
                id="email"
                className="form-input"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                required
                aria-required="true"
                aria-invalid={errors.some(e => e.includes('email'))}
              />
            </div>
          </div>

          <div className="form-group">
            <label 
              htmlFor="name" 
              className="form-label"
            >
              Full Name
            </label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" />
              </svg>
              <input
                type="text"
                id="name"
                className="form-input"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
                aria-required="true"
                aria-invalid={errors.some(e => e.includes('name'))}
              />
            </div>
          </div>

          <div className="form-group">
            <label 
              htmlFor="password" 
              className="form-label"
            >
              Password
            </label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2" />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="form-input"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a password"
                required
                aria-required="true"
                aria-invalid={errors.some(e => e.includes('Password must') || e.includes('Password is'))}
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
            {formData.password && (
              <div className="password-strength">
                <div className={`strength-meter strength-${passwordStrength}`}></div>
                <span className="strength-text">{getStrengthDescription(passwordStrength)}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label 
              htmlFor="repeatPassword" 
              className="form-label"
            >
              Confirm Password
            </label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2" />
                <path d="M12 15L12 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type={showRepeatPassword ? "text" : "password"}
                id="repeatPassword"
                className="form-input"
                value={formData.repeatPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required
                aria-required="true"
                aria-invalid={errors.some(e => e.includes('match') || e.includes('confirm'))}
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={toggleRepeatPasswordVisibility}
                aria-label={showRepeatPassword ? "Hide password" : "Show password"}
              >
                {showRepeatPassword ? (
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
            className="register-button" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="spinner" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="62.83" strokeDashoffset="0" />
                </svg>
                Creating Account...
              </>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="login-prompt">Already have an account?</p>
          <button 
            type="button" 
            className="login-button" 
            onClick={() => navigate("/")}
            aria-label="Log in to your account"
          >
            Log In
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