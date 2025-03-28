import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface ProfileSettingsProps {
  onSave: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onSave }) => {
  const [userSettings, setUserSettings] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    theme: 'dark',
    currency: 'USD',
    notifications: true,
    language: 'en',
    dateFormat: 'MM/DD/YYYY'
  });

  const handleSettingChange = (key: string, value: string | boolean) => {
    setUserSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // Call the onSave function to trigger loading and notification effects
    onSave();
    
    // Additional save logic could go here
    console.log('Saving settings:', userSettings);
  };

  // Animation variants
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
      className="profile-settings"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2>Account Settings</h2>
      
      <motion.div 
        className="settings-section"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <h3>Personal Information</h3>
        <div className="form-grid">
          <motion.div 
            className="form-group"
            variants={itemVariants}
          >
            <label>Name</label>
            <input 
              type="text" 
              value={userSettings.name}
              onChange={(e) => handleSettingChange('name', e.target.value)}
            />
          </motion.div>
          <motion.div 
            className="form-group"
            variants={itemVariants}
          >
            <label>Email</label>
            <input 
              type="email" 
              value={userSettings.email}
              onChange={(e) => handleSettingChange('email', e.target.value)}
            />
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
        <h3>Display Preferences</h3>
        <div className="form-grid">
          <motion.div 
            className="form-group"
            variants={itemVariants}
          >
            <label>Theme</label>
            <select 
              value={userSettings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
            >
              <option value="dark">Dark Mode</option>
              <option value="light">Light Mode</option>
              <option value="system">System Default</option>
            </select>
          </motion.div>
          <motion.div 
            className="form-group"
            variants={itemVariants}
          >
            <label>Currency</label>
            <select 
              value={userSettings.currency}
              onChange={(e) => handleSettingChange('currency', e.target.value)}
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </motion.div>
          <motion.div 
            className="form-group"
            variants={itemVariants}
          >
            <label>Language</label>
            <select 
              value={userSettings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </motion.div>
          <motion.div 
            className="form-group"
            variants={itemVariants}
          >
            <label>Date Format</label>
            <select 
              value={userSettings.dateFormat}
              onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </motion.div>
        </div>
      </motion.div>

      <motion.div 
        className="settings-section"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.6 }}
      >
        <h3>Notifications</h3>
        <div className="toggle-group">
          <label>Enable Notifications</label>
          <div 
            className={`toggle-switch ${userSettings.notifications ? 'active' : ''}`}
            onClick={() => handleSettingChange('notifications', !userSettings.notifications)}
          >
            <div className="toggle-slider"></div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="connected-accounts"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.9 }}
      >
        <h3>Connected Accounts</h3>
        <div className="account-item">
          <div className="account-info">
            <FontAwesomeIcon icon="google" />
            <span>Google</span>
          </div>
          <motion.button 
            className="connect-button connected"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Connected
          </motion.button>
        </div>
        <div className="account-item">
          <div className="account-info">
            <FontAwesomeIcon icon="apple" />
            <span>Apple</span>
          </div>
          <motion.button 
            className="connect-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Connect
          </motion.button>
        </div>
      </motion.div>
      
      <motion.button 
        className="save-button"
        onClick={handleSaveSettings}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Save Changes
      </motion.button>
    </motion.div>
  );
};

export default ProfileSettings;