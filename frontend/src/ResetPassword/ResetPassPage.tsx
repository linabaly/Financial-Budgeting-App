import React, { 
  useState, 
  useCallback, 
  useMemo, 
  FormEvent 
} from "react";
import { useNavigate } from "react-router-dom";
import "./ResetPassPage.css";
import { API_BASE_URL } from "../config";

/**
 * Interface for password reset form data
 * Provides type safety and clear structure for reset password inputs
 */
interface PasswordResetData {
  email: string;
  password: string;
  repeatPassword: string;
}

/**
 * Comprehensive validation for password reset form
 * Checks all input fields with detailed error messages
 * 
 * @param data Password reset form data to validate
 * @returns Validation result with potential errors
 */
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

const ResetPassPage: React.FC = () => {
  // Password reset form state management
  const [passwordResetData, setPasswordResetData] = useState<PasswordResetData>({
    email: '',
    password: '',
    repeatPassword: ''
  });

  // Validation errors state
  const [errors, setErrors] = useState<string[]>([]);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  // Navigation hook
  const navigate = useNavigate();

  // Calculate password strength
  const passwordStrength = useMemo(() => {
    const password = passwordResetData.password;
    
    if (!password) return { score: 0, label: '' };
    
    // Strength criteria
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

    return {
      score: normalizedScore,
      label: ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][normalizedScore - 1] || ''
    };
  }, [passwordResetData.password]);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Toggle confirm password visibility
  const toggleRepeatPasswordVisibility = useCallback(() => {
    setShowRepeatPassword(prev => !prev);
  }, []);

  // Dynamic input change handler
  const handleInputChange = useCallback(<K extends keyof PasswordResetData>(key: K) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordResetData(prev => ({
        ...prev,
        [key]: e.target.value
      }));
    },
    []
  );

  // Handle password reset submission
  const handlePasswordReset = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors([]);

    // Validate password reset data
    const validation = validatePasswordReset(passwordResetData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);

    try {
      // Simulated API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Resetting password for:', passwordResetData.email);
      
      // Uncomment for actual API integration
      // const response = await fetch(`${API_BASE_URL}/account/reset-password`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ 
      //     email: passwordResetData.email, 
      //     password: passwordResetData.password 
      //   }),  
      // }); 
      
      // if (!response.ok) {
      //   throw new Error('Password reset failed');
      // }

      // Navigate to login page on successful password reset
      navigate("/");
    } catch (error) {
      // Handle password reset errors
      console.error('Password reset error:', error);
      setErrors(['Failed to reset password. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  }, [passwordResetData, navigate]);

  return (
    <div className="main-container">
      <div className="background" />
      <div className="reset-card">
        <h2 className="reset-title">Reset Your Password</h2>
        <p className="reset-subtitle">Create a new secure password for your account</p>
        
        {/* Error Messages Display */}
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

        <form 
          className="reset-form" 
          onSubmit={handlePasswordReset}
          noValidate
        >
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

          <div className="form-group">
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
            
            {/* Password Strength Indicator */}
            {passwordResetData.password && (
              <div className="password-strength">
                <div className={`strength-meter strength-${passwordStrength.score}`}></div>
                <span className="strength-text">{passwordStrength.label}</span>
              </div>
            )}
            
            {/* Password requirements hint */}
            {passwordResetData.password && (
              <div className="password-requirements">
                <p className="requirements-title">Password must contain:</p>
                <ul className="requirements-list">
                  <li className={passwordResetData.password.length >= 8 ? 'requirement-met' : ''}>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(passwordResetData.password) ? 'requirement-met' : ''}>
                    Uppercase letter
                  </li>
                  <li className={/[a-z]/.test(passwordResetData.password) ? 'requirement-met' : ''}>
                    Lowercase letter
                  </li>
                  <li className={/[0-9]/.test(passwordResetData.password) ? 'requirement-met' : ''}>
                    Number
                  </li>
                  <li className={/[!@#$%^&*(),.?":{}|<>]/.test(passwordResetData.password) ? 'requirement-met' : ''}>
                    Special character
                  </li>
                </ul>
              </div>
            )}
          </div>

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
            aria-label="Return to login"
          >
            Return to Login
          </button>
        </div>
      </div>

      <div className="welcome-container">
        <div className="brand-wrapper">
          <h1 className="welcome-to">Welcome to</h1>
          <h2 className="finovators">Finovators!</h2>
          <p className="brand-tagline">Your partner in financial innovation</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassPage;