/**
 * RegisterPage Component
 * 
 * This component handles user registration with form validation, password strength
 * checking, and API integration. It presents a registration form with email, name,
 * and password fields, including visual feedback for password strength.
 */

import React, { useState, useCallback, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import "./RegisterPage.css";

/**
 * Interface defining the structure for the registration form data
 */
interface RegistrationForm {
  email: string;
  name: string;
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
 * Validates the registration form data
 * 
 * @param form - The form data to validate
 * @param passwordStrength - The current password strength
 * @returns An array of error messages, empty if validation passes
 */
const validateRegistration = (form: RegistrationForm, passwordStrength: PasswordStrength): string[] => {
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
  } else if (passwordStrength < PasswordStrength.VeryStrong) {
    errors.push("Password strength must be 'Very Strong'");
  }

  if (!form.repeatPassword.trim()) {
    errors.push("Please confirm your password");
  } else if (form.password !== form.repeatPassword) {
    errors.push("Passwords do not match");
  }

  return errors;
};

/**
 * Evaluates password strength based on length and character variety
 */
const checkPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return PasswordStrength.None;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 5) as PasswordStrength;
};

const getPasswordRequirementsStatus = (password: string) => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  specialChar: /[^A-Za-z0-9]/.test(password)
});

const getStrengthDescription = (strength: PasswordStrength): string => {
  switch (strength) {
    case PasswordStrength.None: return "Enter password";
    case PasswordStrength.Weak: return "Weak";
    case PasswordStrength.Fair: return "Fair";
    case PasswordStrength.Good: return "Good";
    case PasswordStrength.Strong: return "Strong";
    case PasswordStrength.VeryStrong: return "Very Strong";
    default: return "";
  }
};

const getStrengthColor = (strength: PasswordStrength): string => {
  switch (strength) {
    case PasswordStrength.Weak: return '#e74c3c';
    case PasswordStrength.Fair: return '#f39c12';
    case PasswordStrength.Good: return '#f1c40f';
    case PasswordStrength.Strong: return '#2ecc71';
    case PasswordStrength.VeryStrong: return '#27ae60';
    default: return '#ccc';
  }
};

export default function RegisterPage() {
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
  const [showTooltip, setShowTooltip] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (id === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
      setShowTooltip(value.length > 0);
    }
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleRepeatPasswordVisibility = useCallback(() => {
    setShowRepeatPassword(prev => !prev);
  }, []);

  const handleRegister = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);
    const validationErrors = validateRegistration(formData, passwordStrength);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/account/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: formData.name, 
          email: formData.email, 
          password: formData.password 
        })
      });
      if (!response.ok) throw new Error("Failed to register");
      navigate("/");
    } catch {
      setErrors(["Registration failed. Please try again."]);
    } finally {
      setIsLoading(false);
    }
  }, [formData, navigate, passwordStrength]);

  const requirementsStatus = getPasswordRequirementsStatus(formData.password);

  // Generate helper text based on password strength
  const getPasswordHelperText = () => {
    if (formData.password && passwordStrength < PasswordStrength.VeryStrong) {
      return "Password must have 'Very Strong' strength to register";
    }
    return "";
  };

  // Determine if the register button should be disabled based on password strength
  const isRegisterDisabled = isLoading || (formData.password && passwordStrength < PasswordStrength.VeryStrong);

  // Should show not acceptable suffix - only when password exists and is less than Very Strong
  const shouldShowNotAcceptable = formData.password.length > 0 && passwordStrength < PasswordStrength.VeryStrong;

  // ========== COMPONENT RENDER ==========
  return (
    <div className="register-page">
      <div className="main-container">
        {/* Background gradient */}
        <div className="background" />
        
        {/* Registration form card */}
        <div className="register-card">
          <h2 className="register-title">Create Your Account</h2>
          <p className="register-subtitle">Join Finovators and start your journey</p>
          
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

          {/* Registration form */}
          <form className="register-form" onSubmit={handleRegister} noValidate>
            {/* Email field */}
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

            {/* Name field */}
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

            {/* Password field with strength indicator */}
            <div className="form-group" style={{ position: 'relative' }}>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                  <path d="M7 11V7C7 4.24 9.24 2 12 2s5 2.24 5 5v4" stroke="currentColor" strokeWidth="2" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={`form-input ${formData.password && passwordStrength < PasswordStrength.VeryStrong ? 'input-warning' : ''}`}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  required
                  onFocus={() => setShowTooltip(true)}
                  onBlur={() => setTimeout(() => setShowTooltip(false), 200)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M2 12S5.5 5 12 5s10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      <path d="M3 21L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M2 12S5.5 5 12 5s10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password helper text */}
              {formData.password && getPasswordHelperText() && (
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
                      <span style={{ color: getStrengthColor(passwordStrength) }}>
                        {getStrengthDescription(passwordStrength)}
                        {shouldShowNotAcceptable && " (Not Acceptable)"}
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
                        width: `${(Object.values(requirementsStatus).filter(Boolean).length / 5) * 100}%`,
                        backgroundColor: getStrengthColor(passwordStrength),
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
                    {[{ label: 'At least 8 characters', satisfied: requirementsStatus.length },
                      { label: 'Uppercase letter', satisfied: requirementsStatus.uppercase },
                      { label: 'Lowercase letter', satisfied: requirementsStatus.lowercase },
                      { label: 'Number', satisfied: requirementsStatus.number },
                      { label: 'Special character', satisfied: requirementsStatus.specialChar }].map((item, idx) => (
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

            {/* Submit button with loading state and password strength check */}
            <button 
              type="submit" 
              className="register-button"
              disabled={!!isRegisterDisabled}
              style={{
                opacity: isRegisterDisabled ? 0.7 : 1,
                cursor: isRegisterDisabled ? 'not-allowed' : 'pointer'
              }}
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

          {/* Login option footer */}
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

        {/* Welcome message and branding */}
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
}
