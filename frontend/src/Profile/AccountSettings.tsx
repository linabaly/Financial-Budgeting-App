import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface AccountSettingsProps {
  onSave: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ onSave }) => {
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

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleToggleChange = (key: string) => {
    setSettings(prev => ({
      ...prev,
      dataPrivacy: {
        ...prev.dataPrivacy,
        [key]: !prev.dataPrivacy[key as keyof typeof prev.dataPrivacy]
      }
    }));
  };

  const saveSettings = () => {
    // Call the onSave function passed from the parent
    onSave();
  };

  // Staggered animation variants
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
      
      <motion.div 
        className="settings-section"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <h3>Display Preferences</h3>
        <div className="form-grid">
          <motion.div className="form-group" variants={itemVariants}>
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
          </motion.div>
          
          <motion.div className="form-group" variants={itemVariants}>
            <label>Timezone</label>
            <select 
              value={settings.timezone}
              onChange={(e) => handleSettingChange('timezone', e.target.value)}
            >
              <option value="UTC-5">Eastern Time (UTC-5)</option>
              <option value="UTC-8">Pacific Time (UTC-8)</option>
              <option value="UTC+0">Greenwich Mean Time (UTC+0)</option>
            </select>
          </motion.div>
          
          <motion.div className="form-group" variants={itemVariants}>
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
          </motion.div>
          
          <motion.div className="form-group" variants={itemVariants}>
            <label>Theme</label>
            <select 
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
            >
              <option value="dark">Dark Mode</option>
              <option value="light">Light Mode</option>
              <option value="system">System Default</option>
            </select>
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div 
        className="settings-section"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.3 }}
      >
        <h3>Data & Privacy</h3>
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
      
      <motion.button 
        className="save-button"
        onClick={saveSettings}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Save Account Preferences
      </motion.button>
    </motion.div>
  );
};

export default AccountSettings;