/**
 * ResetPassPage Component
 * 
 * This component handles password reset functionality, including:
 * - Email verification
 * - Password validation with strength checking
 * - UI feedback for password requirements
 * - Form submission to reset API endpoint
 */

import React, { useState, useCallback, useMemo, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./ResetPassPage.css";

/**
 * Interface for password reset form data
 * Defines the structure and types for the reset password form inputs
 */
interface PasswordResetData {
  email: string;
  password: string;
  repeatPassword: string;
}

/**
 * Enum defining password strength levels from None to Very Strong
 */
enum PasswordStrength {
  None = 0,
  Weak = 1,
  Fair = 2,
  Good = 3,
  Strong = 4,
  VeryStrong = 5
}

/**
 * Comprehensive validation for password reset form
 * Performs detailed validation on all form fields and returns structured results
 * 
 * @param data - The password reset form data to validate
 * @param passwordStrengthScore - The current password strength score
 * @returns Object containing validation status and any error messages
 */
const validatePasswordReset = (data: PasswordResetData, passwordStrengthScore: number) => {
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
    
    // Password strength requirement - must be Very Strong
    if (passwordStrengthScore < PasswordStrength.VeryStrong) {
      errors.push('Password strength must be Very Strong');
    }
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

/**
 * Main component for the password reset page
 * Manages form state, validation, and submission
 */
const ResetPassPage: React.FC = () => {
  // ========== STATE MANAGEMENT ==========
  
  // Form data state with strong typing
  const [passwordResetData, setPasswordResetData] = useState<PasswordResetData>({
    email: '',
    password: '',
    repeatPassword: ''
  });

  // UI state variables
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);


  // Navigation hook for redirecting after completion
  const navigate = useNavigate();

  // ========== DERIVED STATE ==========

  /**
   * Calculate password strength based on multiple criteria
   * Returns a normalized score (0-5) and descriptive label
   */
  const passwordStrength = useMemo(() => {
    const password = passwordResetData.password;
    
    if (!password) return { score: 0, label: '' };
    
    // Strength criteria checks
    const criteria = [
      password.length >= 8,
      password.length >= 12,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ];

    // Calculate strength score (0-5)
    const strengthScore = criteria.filter(Boolean).length;
    const normalizedScore = Math.min(strengthScore, 5);

    // Map score to descriptive label
    const labelsByScore = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    
    return {
      score: normalizedScore,
      label: labelsByScore[normalizedScore] || ''
    };
  }, [passwordResetData.password]);

  // ========== EVENT HANDLERS ==========

  /**
   * Toggle password visibility for the main password field
   */
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  /**
   * Toggle password visibility for the confirmation password field
   */
  const toggleRepeatPasswordVisibility = useCallback(() => {
    setShowRepeatPassword(prev => !prev);
  }, []);

  /**
   * Generic input change handler for form fields
   * Uses TypeScript generics to ensure type safety
   * 
   * @param key - The key in the form data to update
   * @returns An event handler function for the input
   */
  const handleInputChange = useCallback(<K extends keyof PasswordResetData>(key: K) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordResetData(prev => ({
        ...prev,
        [key]: e.target.value
      }));
    },
    []
  );

  /**
   * Generate helper text based on password strength
   */
  const getPasswordHelperText = () => {
    if (passwordResetData.password && passwordStrength.score < PasswordStrength.VeryStrong) {
      return "Password must have Very Strong strength to reset";
    }
    return "";
  };

  /**
   * Determine if the reset button should be disabled based on password strength
   */
  const isResetDisabled = isLoading || (passwordResetData.password !== "" && passwordStrength.score < PasswordStrength.VeryStrong);
  
  /**
   * Handle form submission for password reset
   * Validates input and sends reset request
   * 
   * @param e - The form submission event
   */
  const handlePasswordReset = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors([]);

    // Validate all form inputs
    const validation = validatePasswordReset(passwordResetData, passwordStrength.score);
    
    // If validation fails, display errors and stop submission
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Set loading state to show processing
    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:5005/account/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: passwordResetData.email, 
          password: passwordResetData.password 
        }),  
      }); 
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Password reset failed');
      }
      

      // Navigate to login page on successful reset
      navigate("/");
    } catch (error) {
      // Display user-friendly error
      setErrors(['Failed to reset password. Please try again.']);
    } finally {
      // Reset loading state regardless of outcome
      setIsLoading(false);
    }
  }, [passwordResetData, navigate, passwordStrength.score]);

  // Get color based on password strength score
  const getStrengthColor = (score: number): string => {
    switch (score) {
      case 0: return '#ccc';
      case 1: return '#e74c3c';
      case 2: return '#f39c12';
      case 3: return '#f1c40f';
      case 4: return '#2ecc71';
      case 5: return '#27ae60';
      default: return '#ccc';
    }
  };

  // ========== COMPONENT RENDER ==========
  return (
    <div className="reset-password">
      <div className="main-container">
        {/* Animated background gradient */}
        <div className="background" />
        
        {/* Password reset form card */}
        <div className="reset-card">
          <h2 className="reset-title">Reset Your Password</h2>
          <p className="reset-subtitle">Create a new secure password for your account</p>
          
          {/* Error messages display */}
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

          {/* Password reset form */}
          <form 
            className="reset-form" 
            onSubmit={handlePasswordReset}
            noValidate
          >
            {/* Email input field */}
            <div className="form-group">
              <label 
                className="form-label" 
                htmlFor="email"
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
                  value={passwordResetData.email}
                  onChange={handleInputChange('email')}
                  placeholder="Enter your email address"
                  required
                  aria-required="true"
                  aria-invalid={errors.some(e => e.toLowerCase().includes('email'))}
                />
              </div>
            </div>

            {/* New password field with strength meter */}
            <div className="form-group" style={{ position: 'relative' }}>
              <label 
                className="form-label" 
                htmlFor="password"
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
                  value={passwordResetData.password}
                  onChange={handleInputChange('password')}
                  placeholder="Create a new password"
                  required
                  aria-required="true"
                  aria-invalid={errors.some(e => e.includes('Password must') || e.includes('password is'))}
                  onFocus={() => setShowTooltip(true)}
                  onBlur={() => setTimeout(() => setShowTooltip(false), 200)}
                />
                {/* Password visibility toggle */}
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

              {/* Password helper text */}
              {passwordResetData.password && getPasswordHelperText() && (
                <div className="helper-text" style={{ 
                  color: '#ff0000', 
                  fontSize: '0.85rem',
                  fontWeight: 'bold', 
                  marginTop: '4px' 
                }}>
                  {getPasswordHelperText()}
                </div>
              )}

              {/* Tooltip */}
              {showTooltip && (
                <div className="tooltip-box tooltip-fade">
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontWeight: 'bold',
                      color: '#555',
                      fontSize: '0.70rem',
                      marginBottom: '0.25rem'
                    }}>
                      <span>Password Strength</span>
                      <span style={{ color: getStrengthColor(passwordStrength.score) }}>
                        {passwordStrength.label || 'Enter password'}
                        {passwordStrength.score < PasswordStrength.VeryStrong && passwordResetData.password && " (Not Acceptable)"}
                      </span>
                    </div>
                    <div style={{
                      height: '6px',
                      width: '100%',
                      borderRadius: '4px',
                      backgroundColor: '#ddd',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: getStrengthColor(passwordStrength.score),
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                  <strong style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: '#444',
                    fontSize: '1rem'
                  }}>Password must contain:</strong>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0
                  }}>
                    {[
                      { label: 'At least 8 characters', satisfied: passwordResetData.password.length >= 8 },
                      { label: 'Uppercase letter', satisfied: /[A-Z]/.test(passwordResetData.password) },
                      { label: 'Lowercase letter', satisfied: /[a-z]/.test(passwordResetData.password) },
                      { label: 'Number', satisfied: /[0-9]/.test(passwordResetData.password) },
                      { label: 'Special character', satisfied: /[!@#$%^&*(),.?":{}|<>]/.test(passwordResetData.password) }
                    ].map((item, idx) => (
                      <li key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '0.4rem'
                      }}>
                        <span style={{
                          width: '20px',
                          height: '20px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          backgroundColor: item.satisfied ? '#c6f6d5' : '#ddd',
                          color: item.satisfied ? '#2ecc71' : '#888',
                          fontSize: '14px',
                          marginRight: '0.5rem',
                          border: item.satisfied ? '1.5px solid #2ecc71' : '1.5px solid #aaa'
                        }}>{item.satisfied ? '✓' : ''}</span>
                        <span style={{ color: item.satisfied ? '#2ecc71' : '#444' }}>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Password confirmation field */}
            <div className="form-group">
              <label 
                className="form-label" 
                htmlFor="repeatPassword"
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
                  value={passwordResetData.repeatPassword}
                  onChange={handleInputChange('repeatPassword')}
                  placeholder="Confirm your new password"
                  required
                  aria-required="true"
                  aria-invalid={errors.some(e => e.includes('match') || e.includes('confirm'))}
                />
                {/* Password visibility toggle */}
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

            {/* Submit button with loading state */}
            <button 
              type="submit" 
              className="reset-button" 
              disabled={isResetDisabled}
              style={{
                opacity: isResetDisabled ? 0.7 : 1,
                cursor: isResetDisabled ? 'not-allowed' : 'pointer'
              }}
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

          {/* Footer with return to login option */}
          <div className="auth-footer">
            <p className="login-prompt">Remember your password?</p>
            <button 
              type="button" 
              className="login-button" 
              onClick={() => navigate("/")}
              aria-label="Return to login"
            >
              Return to Login
            </button>
          </div>
        </div>

        {/* Welcome branding */}
        <div className="welcome-container">
          <div className="brand-wrapper">
            <h1 className="welcome-to">Welcome to</h1>
            <h2 className="finovators">Finovators!</h2>
            <p className="brand-tagline">Track, Manage, Thrive</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassPage;