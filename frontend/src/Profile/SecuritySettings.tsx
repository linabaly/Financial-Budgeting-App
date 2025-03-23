import React, { useState } from 'react';

const SecuritySettings: React.FC = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handlePasswordChange = () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    // Implement password change logic
    console.log('Changing password');
    alert('Password changed successfully!');
    
    // Reset password fields
    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const toggleTwoFactor = () => {
    // Implement two-factor authentication toggle
    setTwoFactorEnabled(!twoFactorEnabled);
  };

  return (
    <div className="security-settings">
      <h2>Security Settings</h2>
      
      <div className="password-change-section">
        <h3>Change Password</h3>
        <div className="form-group">
          <label>Current Password</label>
          <input 
            type="password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({
              ...passwords,
              currentPassword: e.target.value
            })}
          />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input 
            type="password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({
              ...passwords,
              newPassword: e.target.value
            })}
          />
        </div>
        <div className="form-group">
          <label>Confirm New Password</label>
          <input 
            type="password"
            value={passwords.confirmPassword}
            onChange={(e) => setPasswords({
              ...passwords,
              confirmPassword: e.target.value
            })}
          />
        </div>
        <button 
          className="save-button"
          onClick={handlePasswordChange}
        >
          Change Password
        </button>
      </div>

      <div className="two-factor-section">
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
        {twoFactorEnabled && (
          <div className="two-factor-details">
            <p>Download an authenticator app and scan the QR code below:</p>
            {/* Placeholder for QR code */}
            <div className="qr-code-placeholder">
              QR Code Goes Here
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecuritySettings;