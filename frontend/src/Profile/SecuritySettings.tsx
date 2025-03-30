import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface SecuritySettingsProps {
  onSave: () => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onSave }) => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }));

    // Simple password strength calculation
    if (field === 'newPassword') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Normalize to 0-100
    return Math.min(100, (strength / 6) * 100);
  };

  const getPasswordStrengthColor = (): string => {
    if (passwordStrength < 30) return '#e74c3c';
    if (passwordStrength < 70) return '#f39c12';
    return '#2ecc71';
  };

  const toggleTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
  };

  const changePassword = () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwords.newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    // Call the onSave function passed from the parent
    onSave();
    
    // Reset password fields
    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordStrength(0);
  };

  return (
    <motion.div 
      className="security-settings"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2>Security Settings</h2>
      
      <motion.div 
        className="password-change-section"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h3>Change Password</h3>
        <div className="form-group">
          <label>Current Password</label>
          <input 
            type="password"
            value={passwords.currentPassword}
            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
            placeholder="Enter your current password"
          />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input 
            type="password"
            value={passwords.newPassword}
            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
            placeholder="Choose a strong password"
          />
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
        <div className="form-group">
          <label>Confirm New Password</label>
          <input 
            type="password"
            value={passwords.confirmPassword}
            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
            placeholder="Confirm your new password"
          />
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
        <motion.button 
          className="change-password-btn"
          onClick={changePassword}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
        >
          Change Password
        </motion.button>
      </motion.div>

      <motion.div 
        className="two-factor-section"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h3>Two-Factor Authentication</h3>
        <div className="toggle-group">
          <label>Enable Two-Factor Authentication</label>
          <div 
            className={`toggle-switch ${twoFactorEnabled ? 'active' : ''}`}
            onClick={toggleTwoFactor}
          >
            <div className="toggle-slider"></div>
          </div>
        </div>
        
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
              >
                I've scanned the QR code
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <motion.div 
        className="login-alerts-section"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3>Login Alerts</h3>
        <div className="toggle-group">
          <label>Receive email alerts for new device logins</label>
          <div 
            className={`toggle-switch ${loginAlerts ? 'active' : ''}`}
            onClick={() => setLoginAlerts(!loginAlerts)}
          >
            <div className="toggle-slider"></div>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="device-sessions"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <h3>Active Sessions</h3>
        <div className="sessions-list">
          <div className="session-item">
            <div className="session-details">
              <div className="device-name">Current Browser (Chrome)</div>
              <div className="session-meta">IP: 192.168.1.1 • Last active: Just now</div>
            </div>
            <div className="session-actions">
              <span className="current-device">Current Device</span>
            </div>
          </div>
          <div className="session-item">
            <div className="session-details">
              <div className="device-name">iPhone 13 Pro (Safari)</div>
              <div className="session-meta">IP: 192.168.1.2 • Last active: 2 hours ago</div>
            </div>
            <div className="session-actions">
              <motion.button 
                className="end-session-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                End Session
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      
      <motion.button 
        className="save-button"
        onClick={onSave}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Save Security Settings
      </motion.button>
    </motion.div>
  );
};

export default SecuritySettings;