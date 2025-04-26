/**
 * SecuritySettings Component
 * 
 * Handles user security preferences including password changes,
 * with password strength visualization and validation.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// API configuration
const API_BASE_URL = 'https://finovators.mracs.dev/api';

/**
 * Enum for password strength levels
 */
enum PasswordStrength {
  NONE = 0,
  WEAK = 1,
  FAIR = 2,
  GOOD = 3,
  STRONG = 4,
  VERY_STRONG = 5
}

/**
 * Props for the SecuritySettings component
 */
interface SecuritySettingsProps {
  /** Callback function when settings are saved */
  onSave: () => void;
}

/**
 * Component for managing user security settings
 */
const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onSave }) => {
  // State for password form
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // State for security toggles
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  
  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Updates password field and calculates strength for new passwords
   */
  const handlePasswordChange = (field: string, value: string) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }));

    // Calculate password strength when updating the new password
    if (field === 'newPassword') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  /**
   * Evaluates password strength based on complexity requirements
   */
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (!password) return PasswordStrength.NONE;
  
    const requirements = getPasswordRequirementsStatus(password);
    const metCount = Object.values(requirements).filter(Boolean).length;
  
    switch (metCount) {
      case 1: return PasswordStrength.WEAK;
      case 2: return PasswordStrength.FAIR;
      case 3: return PasswordStrength.GOOD;
      case 4: return PasswordStrength.STRONG;
      case 5: return PasswordStrength.VERY_STRONG;
      default: return PasswordStrength.NONE;
    }
  };  
  
  /**
   * Checks which password requirements are satisfied
   */
  const getPasswordRequirementsStatus = (password: string) => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[^A-Za-z0-9]/.test(password)
  });
  
  /**
   * Returns the appropriate color for the strength meter
   */
  const getStrengthColor = (strength: PasswordStrength): string => {
    switch (strength) {
      case PasswordStrength.WEAK: return '#e74c3c';
      case PasswordStrength.FAIR: return '#e67e22';
      case PasswordStrength.GOOD: return '#f1c40f';
      case PasswordStrength.STRONG: return '#2ecc71';
      case PasswordStrength.VERY_STRONG: return '#27ae60';
      default: return '#ccc';
    }
  };  
  
  /**
   * Returns the text label for the password strength
   */
  const getStrengthText = (strength: PasswordStrength): string => {
    switch (strength) {
      case PasswordStrength.WEAK: return 'Weak';
      case PasswordStrength.FAIR: return 'Fair';
      case PasswordStrength.GOOD: return 'Good';
      case PasswordStrength.STRONG: return 'Strong';
      case PasswordStrength.VERY_STRONG: return 'Very Strong';
      default: return 'Enter password';
    }
  };  

  /**
   * Handles password change submission to API
   */
  const changePassword = async () => {
    // Reset states
    setError(null);
    setSuccess(null);
    
    // Input validation
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match!');
      return;
    }

    if (passwords.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in again.");
      }
      
      const response = await fetch(`${API_BASE_URL}/account/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });          
      
      // Check for specific error status codes
      if (response.status === 401) {
        throw new Error("Current password is incorrect");
      } else if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to change password");
      }
      
      // Password changed successfully
      setSuccess('Password changed successfully');
      
      // Call the onSave function passed from the parent
      onSave();
      
      // Reset form fields
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordStrength(0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="security-settings"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2>Security Settings</h2>
      
      {/* Error and success messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      {isLoading && <div className="loading-indicator">Loading...</div>}
      
      {/* Password change section */}
      <motion.div 
        className="settings-section"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h3>Change Password</h3>
        
        {/* Current password field */}
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <input 
            type="password"
            id="currentPassword"
            value={passwords.currentPassword}
            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
            placeholder="Enter your current password"
            disabled={isLoading}
          />
        </div>
        
        {/* New password field */}
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input 
            type="password"
            id="newPassword"
            value={passwords.newPassword}
            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
            placeholder="Choose a strong password"
            disabled={isLoading}
          />
        </div>

        {/* Password strength meter */}
        {passwords.newPassword && (
          <div className="password-strength-meter" style={{ marginTop: '8px', marginBottom: '12px' }}>
            
            {/* Strength Info */}
            <div className="strength-info" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '6px' 
            }}>
              <span>Password Strength</span>
              <span style={{ color: getStrengthColor(passwordStrength) }}>
                {getStrengthText(passwordStrength)}
              </span>
            </div>

            {/* Strength Bar */}
            <div style={{
              height: '6px',
              width: '100%',
              backgroundColor: '#ddd',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '12px'
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(Object.values(getPasswordRequirementsStatus(passwords.newPassword)).filter(Boolean).length / 5) * 100}%` }}
                style={{
                  height: '100%',
                  backgroundColor: getStrengthColor(passwordStrength),
                  transition: 'width 0.4s ease'
                }}
              />
            </div>

            {/* Password Requirements */}
            <div className="password-requirements" style={{ marginTop: '12px' }}>
              <h4 style={{ marginBottom: '8px' }}>Password must contain:</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  { label: 'At least 8 characters', satisfied: getPasswordRequirementsStatus(passwords.newPassword).length },
                  { label: 'Uppercase letter', satisfied: getPasswordRequirementsStatus(passwords.newPassword).uppercase },
                  { label: 'Lowercase letter', satisfied: getPasswordRequirementsStatus(passwords.newPassword).lowercase },
                  { label: 'Number', satisfied: getPasswordRequirementsStatus(passwords.newPassword).number },
                  { label: 'Special character', satisfied: getPasswordRequirementsStatus(passwords.newPassword).specialChar }
                ].map((item, idx) => (
                  <li key={idx} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '4px', 
                    color: item.satisfied ? '#2ecc71' : '#888'
                  }}>
                    <span style={{ marginRight: '8px' }}>
                      {item.satisfied ? '✓' : '✗'}
                    </span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Confirm password field with match indicator */}
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input 
            type="password"
            id="confirmPassword"
            value={passwords.confirmPassword}
            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
            placeholder="Confirm your new password"
            disabled={isLoading}
          />
          {/* Password match indicator */}
          {passwords.newPassword && passwords.confirmPassword && (
            <div className="password-match">
              {passwords.newPassword === passwords.confirmPassword ? (
                <span className="match-success">Passwords match ✓</span>
              ) : (
                <span className="match-error">Passwords do not match ✗</span>
              )}
            </div>
          )}
        </div>
        
        {/* Change password button */}
        <motion.button 
          className="change-password-btn"
          onClick={changePassword}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword || isLoading}
        >
          {isLoading ? 'Changing Password...' : 'Change Password'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default SecuritySettings;