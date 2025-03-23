import React, { useState } from 'react';

const AccountSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    language: 'en',
    timezone: 'UTC-5',
    currency: 'USD',
    theme: 'dark',
    dataPrivacy: {
      shareAnalytics: false,
      marketingEmails: false
    }
  });

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => {
      if (typeof value === 'boolean') {
        return {
          ...prev,
          dataPrivacy: {
            ...prev.dataPrivacy,
            [key]: value
          }
        };
      }
      return { ...prev, [key]: value };
    });
  };

  const saveSettings = () => {
    console.log('Saving account settings:', settings);
    alert('Account settings updated successfully!');
  };

  return (
    <div className="account-settings">
      <h2>Account Preferences</h2>
      
      <div className="settings-section">
        <h3>Display Preferences</h3>
        <div className="form-group">
          <label>Language</label>
          <select 
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Timezone</label>
          <select 
            value={settings.timezone}
            onChange={(e) => handleSettingChange('timezone', e.target.value)}
          >
            <option value="UTC-5">Eastern Time (UTC-5)</option>
            <option value="UTC-8">Pacific Time (UTC-8)</option>
            <option value="UTC+0">Greenwich Mean Time (UTC+0)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Currency</label>
          <select 
            value={settings.currency}
            onChange={(e) => handleSettingChange('currency', e.target.value)}
          >
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="GBP">British Pound (GBP)</option>
            <option value="JPY">Japanese Yen (JPY)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Theme</label>
          <select 
            value={settings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
          >
            <option value="dark">Dark Mode</option>
            <option value="light">Light Mode</option>
            <option value="system">System Default</option>
          </select>
        </div>
      </div>
      
      <div className="settings-section">
        <h3>Data & Privacy</h3>
        <div className="toggle-group">
          <label>Share Anonymous Usage Analytics</label>
          <div 
            className={`toggle-switch ${settings.dataPrivacy.shareAnalytics ? 'active' : ''}`}
            onClick={() => handleSettingChange('shareAnalytics', !settings.dataPrivacy.shareAnalytics)}
          >
            <div className="toggle-slider"></div>
          </div>
        </div>
        
        <div className="toggle-group">
          <label>Receive Marketing Emails</label>
          <div 
            className={`toggle-switch ${settings.dataPrivacy.marketingEmails ? 'active' : ''}`}
            onClick={() => handleSettingChange('marketingEmails', !settings.dataPrivacy.marketingEmails)}
          >
            <div className="toggle-slider"></div>
          </div>
        </div>
      </div>
      
      <button 
        className="save-button"
        onClick={saveSettings}
      >
        Save Account Preferences
      </button>
    </div>
  );
};

export default AccountSettings;