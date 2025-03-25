import React, { useState, useCallback, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "./RegisterPage.css";

// Type definition for password reset form
interface PasswordResetData {
  email: string;
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

// Validation function for password reset
const validatePasswordReset = (data: PasswordResetData) => {
  const errors: string[] = [];

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email.trim()) {
    errors.push('Email is required');
  } else if (!emailRegex.test(data.email)) {
    errors.push('Invalid email format');
  }

  // Password validation rules
  const passwordValidationRules = [
    { 
      test: (pw: string) => pw.length >= 8, 
      message: 'Password must be at least 8 characters long' 
    },
    { 
      test: (pw: string) => /[A-Z]/.test(pw), 
      message: 'Password must contain an uppercase letter' 
    },
    { 
      test: (pw: string) => /[a-z]/.test(pw), 
      message: 'Password must contain a lowercase letter' 
    },
    { 
      test: (pw: string) => /[0-9]/.test(pw), 
      message: 'Password must contain a number' 
    },
    { 
      test: (pw: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pw), 
      message: 'Password must contain a special character' 
    }
  ];

  // Password presence and strength check
  if (!data.password.trim()) {
    errors.push('New password is required');
  } else {
    passwordValidationRules.forEach(rule => {
      if (!rule.test(data.password)) {
        errors.push(rule.message);
      }
    });
  }

  // Password confirmation
  if (!data.repeatPassword.trim()) {
    errors.push('Please confirm your new password');
  } else if (data.password !== data.repeatPassword) {
    errors.push('Passwords do not match');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
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

export default function ResetPassPage() {
  // State management
  const [formData, setFormData] = useState<PasswordResetData>({
    email: "",
    password: "",
    repeatPassword: ""
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>(PasswordStrength.None);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

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

  // Password requirement check functions
  const hasMinLength = useCallback((password: string) => password.length >= 8, []);
  const hasUppercase = useCallback((password: string) => /[A-Z]/.test(password), []);
  const hasLowercase = useCallback((password: string) => /[a-z]/.test(password), []);
  const hasNumber = useCallback((password: string) => /[0-9]/.test(password), []);
  const hasSpecialChar = useCallback((password: string) => /[!@#$%^&*(),.?":{}|<>]/.test(password), []);

  // Handle reset password
  const handleResetPassword = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    const { isValid, errors: validationErrors } = validatePasswordReset(formData);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    // Set loading state
    setIsLoading(true);

    try {
      // Simulated API call
      // In a real app, uncomment the fetch code
      /*
      const response = await fetch(`${API_BASE_URL}/account/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: formData.email,
          password: formData.password 
        }),  
      }); 
      
      if (!response.ok) {
        throw new Error("Failed to reset password");
      }
      */
      
      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Resetting password for:", { 
        email: formData.email, 
        password: formData.password 
      });
      
      // Show success message
      setResetSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      setErrors(["Password reset failed. Please try again."]);
    } finally {
      setIsLoading(false);
    }
  }, [formData, navigate]);

  return (
    <div className="main-container">
      <div className="background" />
      <div className="reset-card">
        <h2 className="reset-title">Reset Your Password</h2>
        <p className="reset-subtitle">Create a new secure password for your account</p>
        
        {/* Success message */}
        {resetSuccess && (
          <div className="success-container">
            <svg className="success-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M7 13L10 16L17 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p>Password reset successful! Redirecting to login...</p>
          </div>
        )}

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

        <form className="reset-form" onSubmit={handleResetPassword} noValidate>
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
              htmlFor="password" 
              className="form-label"
            >
              New Password
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
                placeholder="Create a new password"
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

          {/* Password Requirements */}
          <div className="password-requirements">
            <h4 className="requirements-title">Password must contain:</h4>
            <ul className="requirements-list">
              <li className={hasMinLength(formData.password) ? "requirement-met" : ""}>
                At least 8 characters
              </li>
              <li className={hasUppercase(formData.password) ? "requirement-met" : ""}>
                Uppercase letter
              </li>
              <li className={hasLowercase(formData.password) ? "requirement-met" : ""}>
                Lowercase letter
              </li>
              <li className={hasNumber(formData.password) ? "requirement-met" : ""}>
                Number
              </li>
              <li className={hasSpecialChar(formData.password) ? "requirement-met" : ""}>
                Special character
              </li>
            </ul>
          </div>

          <div className="form-group">
            <label 
              htmlFor="repeatPassword" 
              className="form-label"
            >
              Confirm New Password
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
                placeholder="Confirm your new password"
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
            className="reset-button" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="spinner" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="62.83" strokeDashoffset="0" />
                </svg>
                Resetting Password...
              </>
            ) : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="login-prompt">Remember your password?</p>
          <button 
            type="button" 
            className="login-button" 
            onClick={() => navigate("/")}
            aria-label="Return to login page"
          >
            Return to Login
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