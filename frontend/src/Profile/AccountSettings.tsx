/**
 * AccountSettings.tsx
 * 
 * Component for managing user account preferences like
 * language, timezone, currency, and theme.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';

// API configuration
const API_BASE_URL = "https://finovators.mracs.dev/api";

/**
 * Props for the AccountSettings component
 */
interface AccountSettingsProps {
  /** Callback function when settings are saved */
  onSave: () => void;
}

/**
 * Default settings structure with app preferences
 */
interface AccountPreferences {
  language: string;
  timezone: string;
  currency: string;
  theme: string;
  dataPrivacy: {
    shareAnalytics: boolean;
    marketingEmails: boolean;
  };
}

/**
 * AccountSettings component for user preferences
 */
const AccountSettings: React.FC<AccountSettingsProps> = ({ onSave }) => {
  // State for user settings with defaults
  const [settings, setSettings] = useState<AccountPreferences>({
    language: 'en',
    timezone: 'UTC-5',
    currency: 'USD',
    theme: 'dark',
    dataPrivacy: {
      shareAnalytics: false,
      marketingEmails: false
    }
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /**
   * Updates a top-level setting value
   * @param key - The setting to update
   * @param value - The new value
   */
  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * Updates a nested privacy setting
   * @param key - The privacy setting to toggle
   */
  const handleToggleChange = (key: string) => {
    setSettings(prev => ({
      ...prev,
      dataPrivacy: {
        ...prev.dataPrivacy,
        [key]: !prev.dataPrivacy[key as keyof typeof prev.dataPrivacy]
      }
    }));
  };

  /**
   * Saves the current settings to the backend
   */
  const saveSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found. Please log in again.");
      }
      
      // Call API to update account preferences
      const response = await fetch(`${API_BASE_URL}/account/preferences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token,
        },
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to save account preferences");
      }
      
      // Success
      setSuccess("Account preferences saved successfully");
      
      // Call the onSave function passed from the parent
      onSave();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="account-settings"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2>Account Preferences</h2>
      
      {/* Error and success messages */}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      {isLoading && <div className="loading-indicator">Loading...</div>}
      
      {/* Display section with language, timezone, etc. */}
      <motion.div 
        className="settings-section"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <h3>Display Preferences</h3>
        <div className="form-grid">
          {/* Language selector */}
          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="language">Language</label>
            <select 
              id="language"
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              disabled={isLoading}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </motion.div>
          
          {/* Timezone selector */}
          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="timezone">Timezone</label>
            <select 
              id="timezone"
              value={settings.timezone}
              onChange={(e) => handleSettingChange('timezone', e.target.value)}
              disabled={isLoading}
            >
              <option value="UTC-5">Eastern Time (UTC-5)</option>
              <option value="UTC-8">Pacific Time (UTC-8)</option>
              <option value="UTC+0">Greenwich Mean Time (UTC+0)</option>
            </select>
          </motion.div>
          
          {/* Currency selector */}
          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="currency">Currency</label>
            <select 
              id="currency"
              value={settings.currency}
              onChange={(e) => handleSettingChange('currency', e.target.value)}
              disabled={isLoading}
            >
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="GBP">British Pound (GBP)</option>
              <option value="JPY">Japanese Yen (JPY)</option>
            </select>
          </motion.div>
          
          {/* Theme selector */}
          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="theme">Theme</label>
            <select 
              id="theme"
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              disabled={isLoading}
            >
              <option value="dark">Dark Mode</option>
              <option value="light">Light Mode</option>
              <option value="system">System Default</option>
            </select>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Privacy section with toggles */}
      <motion.div 
        className="settings-section"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.3 }}
      >
        <h3>Data &amp; Privacy</h3>
        
        {/* Analytics sharing toggle */}
        <motion.div 
          className="toggle-group"
          variants={itemVariants}
        >
          <label>Share Anonymous Usage Analytics</label>
          <div 
            className={`toggle-switch ${settings.dataPrivacy.shareAnalytics ? 'active' : ''}`}
            onClick={() => handleToggleChange('shareAnalytics')}
          >
            <div className="toggle-slider"></div>
          </div>
        </motion.div>
        
        {/* Marketing emails toggle */}
        <motion.div 
          className="toggle-group"
          variants={itemVariants}
        >
          <label>Receive Marketing Emails</label>
          <div 
            className={`toggle-switch ${settings.dataPrivacy.marketingEmails ? 'active' : ''}`}
            onClick={() => handleToggleChange('marketingEmails')}
          >
            <div className="toggle-slider"></div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Save button */}
      <motion.button 
        className="save-button"
        onClick={saveSettings}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : 'Save Account Preferences'}
      </motion.button>
    </motion.div>
  );
};

export default AccountSettings;
