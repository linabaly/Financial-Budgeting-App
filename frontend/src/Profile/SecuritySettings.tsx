/**
 * SecuritySettings.tsx
 * 
 * Component for managing user security settings like
 * password change, two-factor authentication, and login alerts.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// API configuration
const API_BASE_URL = "http://localhost:5005";

/**
 * Props for the SecuritySettings component
 */
interface SecuritySettingsProps {
  /** Callback function when settings are saved */
  onSave: () => void;
}

/**
 * SecuritySettings component for user security preferences
 */
const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onSave }) => {
  // State for password form
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // State for security toggles
  // Note: These features may require backend implementation
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
   * @param field - The password field to update
   * @param value - The new value
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
   * Calculates password strength as a percentage (0-100)
   * @param password - The password to evaluate
   * @returns A number from 0-100 representing password strength
   */
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) strength += 1; // Has uppercase
    if (/[a-z]/.test(password)) strength += 1; // Has lowercase
    if (/[0-9]/.test(password)) strength += 1; // Has numbers
    if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Has special chars
    
    // Normalize to 0-100
    return Math.min(100, (strength / 6) * 100);
  };

  /**
   * Gets color for password strength indicator
   * @returns CSS color based on strength
   */
  const getPasswordStrengthColor = (): string => {
    if (passwordStrength < 30) return '#e74c3c'; // Red - Weak
    if (passwordStrength < 70) return '#f39c12'; // Orange - Medium
    return '#2ecc71'; // Green - Strong
  };

  /**
   * Toggles two-factor authentication
   * Note: This is a placeholder until backend implementation
   */
  const toggleTwoFactor = () => {
    // For now, just toggle the state locally
    setTwoFactorEnabled(!twoFactorEnabled);
    setSuccess(`Two-factor authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'}`);
    
    // In the future, this would call a backend API
    onSave();
  };

  /**
   * Handles password change submission
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
      
      // Using the account update endpoint to change password
      // This assumes your backend can handle password changes through the update endpoint
      const response = await fetch(`${API_BASE_URL}/account/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          password: passwords.newPassword
        })        
      });
      
      if (!response.ok) {
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

  /**
   * Toggles login alerts setting
   * Note: This is a placeholder until backend implementation
   */
  const toggleLoginAlerts = () => {
    // For now, just toggle the state locally
    setLoginAlerts(!loginAlerts);
    setSuccess(`Login alerts ${!loginAlerts ? 'enabled' : 'disabled'}`);
    
    // In the future, this would call a backend API
    onSave();
  };

  /**
   * Ends a session/device
   * Note: This is a placeholder until backend implementation
   */
  const endSession = () => {
    setSuccess('Session ended successfully');
    // In the future, this would call an API to invalidate the session
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
        
        {/* New password field with strength indicator */}
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
          {/* Password strength meter */}
          {passwords.newPassword && (
            <div className="password-strength">
              <div className="strength-bar-container">
                <motion.div 
                  className="strength-bar"
                  initial={{ width: 0 }}
                  animate={{ width: `${passwordStrength}%` }}
                  style={{ backgroundColor: getPasswordStrengthColor() }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </div>
              <span className="strength-text">
                {passwordStrength < 30 && 'Weak'}
                {passwordStrength >= 30 && passwordStrength < 70 && 'Medium'}
                {passwordStrength >= 70 && 'Strong'}
              </span>
            </div>
          )}
        </div>
        
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

      {/* Two-factor authentication section */}
      <motion.div 
        className="settings-section"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h3>Two-Factor Authentication</h3>
        
        {/* 2FA toggle */}
        <div className="toggle-group">
          <label>Enable Two-Factor Authentication</label>
          <div 
            className={`toggle-switch ${twoFactorEnabled ? 'active' : ''}`}
            onClick={toggleTwoFactor}
          >
            <div className="toggle-slider"></div>
          </div>
        </div>
        
        {/* 2FA setup instructions - only visible when enabled */}
        <AnimatePresence>
          {twoFactorEnabled && (
            <motion.div 
              className="two-factor-details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p>Download an authenticator app and scan the QR code below:</p>
              <div className="qr-code-placeholder">
                <div className="qr-code"></div>
              </div>
              <p className="auth-code">Or enter this code: <strong>ABCD-EFGH-IJKL</strong></p>
              <motion.button 
                className="verify-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'I\'ve scanned the QR code'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Login alerts section */}
      <motion.div 
        className="settings-section"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3>Login Alerts</h3>
        <div className="toggle-group">
          <label>Receive email alerts for new device logins</label>
          <div 
            className={`toggle-switch ${loginAlerts ? 'active' : ''}`}
            onClick={toggleLoginAlerts}
          >
            <div className="toggle-slider"></div>
          </div>
        </div>
      </motion.div>
      
      {/* Device sessions section */}
      <motion.div 
        className="settings-section"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <h3>Active Sessions</h3>
        <div className="sessions-list">
          {/* Current device session */}
          <div className="session-item">
            <div className="session-details">
              <div className="device-name">Current Browser (Chrome)</div>
              <div className="session-meta">IP: 192.168.1.1 • Last active: Just now</div>
            </div>
            <div className="session-actions">
              <span className="current-device">Current Device</span>
            </div>
          </div>
          
          {/* Other device session with end session option */}
          <div className="session-item">
            <div className="session-details">
              <div className="device-name">iPhone 13 Pro (Safari)</div>
              <div className="session-meta">IP: 192.168.1.2 • Last active: 2 hours ago</div>
            </div>
            <div className="session-actions">
              <motion.button 
                className="end-session-btn"
                onClick={endSession}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
              >
                End Session
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Save button is removed since each section has its own save functionality */}
    </motion.div>
  );
};

export default SecuritySettings;