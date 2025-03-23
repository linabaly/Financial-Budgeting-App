import React, { useState } from 'react';

const ProfileSettings: React.FC = () => {
  const [userSettings, setUserSettings] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    theme: 'dark',
    currency: 'USD',
    notifications: true
  });

  const handleSettingChange = (key: string, value: string | boolean) => {
    setUserSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // Implement save logic
    console.log('Saving settings:', userSettings);
    // Add API call to save settings
  };

  return (
    <div className="profile-settings">
      <h2>Account Settings</h2>
      
      <div className="settings-group">
        <h3>Personal Information</h3>
        <div className="setting-item">
          <label>Name</label>
          <input 
            type="text" 
            value={userSettings.name}
            onChange={(e) => handleSettingChange('name', e.target.value)}
          />
        </div>
        <div className="setting-item">
          <label>Email</label>
          <input 
            type="email" 
            value={userSettings.email}
            onChange={(e) => handleSettingChange('email', e.target.value)}
          />
        </div>
      </div>

      <div className="settings-group">
        <h3>Preferences</h3>
        <div className="setting-item">
          <label>Theme</label>
          <select 
            value={userSettings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
          >
            <option value="dark">Dark Mode</option>
            <option value="light">Light Mode</option>
            <option value="system">System Default</option>
          </select>
        </div>
        <div className="setting-item">
          <label>Currency</label>
          <select 
            value={userSettings.currency}
            onChange={(e) => handleSettingChange('currency', e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>

      <div className="settings-group">
        <h3>Notifications</h3>
        <div className="setting-item toggle">
          <label>Enable Notifications</label>
          <input 
            type="checkbox" 
            checked={userSettings.notifications}
            onChange={(e) => handleSettingChange('notifications', e.target.checked)}
          />
        </div>
      </div>

      <button 
        className="save-settings-btn"
        onClick={handleSaveSettings}
      >
        Save Changes
      </button>
    </div>
  );
};

export default ProfileSettings;