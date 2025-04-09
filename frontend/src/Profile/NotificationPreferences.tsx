/**
 * NotificationPreferences.tsx
 * 
 * Component for managing notification settings including
 * email, push, and SMS notifications.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faEnvelope, 
  faMobile, 
  faCheck 
} from '@fortawesome/free-solid-svg-icons';

/**
 * Props for the NotificationPreferences component
 */
interface NotificationPreferencesProps {
  /** Callback function when settings are saved */
  onSave: () => void;
}

/**
 * Interface for notification settings structure
 */
interface Notifications {
  emailNotifications: {
    weeklyReport: boolean;
    budgetAlerts: boolean;
    transactionUpdates: boolean;
  };
  pushNotifications: {
    lowBalance: boolean;
    unusualActivity: boolean;
    goalProgress: boolean;
  };
  smsNotifications: {
    criticalAlerts: boolean;
    paymentReminders: boolean;
  };
}

/**
 * NotificationPreferences component for managing user notification settings
 */
const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ onSave }) => {
  // Notification settings state
  const [notifications, setNotifications] = useState<Notifications>({
    emailNotifications: {
      weeklyReport: true,
      budgetAlerts: true,
      transactionUpdates: false
    },
    pushNotifications: {
      lowBalance: true,
      unusualActivity: true,
      goalProgress: false
    },
    smsNotifications: {
      criticalAlerts: false,
      paymentReminders: false
    }
  });
  
  // Other state
  const [frequencyOption, setFrequencyOption] = useState<string>('real-time');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  /**
   * Track changes when notifications or frequency changes
   */
  useEffect(() => {
    setHasChanges(true);
  }, [notifications, frequencyOption]);

  /**
   * Toggle a notification setting
   * @param category - The notification category (email, push, sms)
   * @param key - The specific notification setting to toggle
   */
  const toggleNotification = (category: string, key: string) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof Notifications],
        [key]: !(prev[category as keyof Notifications] as any)[key]
      }
    }));
  };

  /**
   * Change the notification frequency
   * @param option - The frequency option to set (real-time, daily, weekly)
   */
  const handleFrequencyChange = (option: string) => {
    setFrequencyOption(option);
  };
  
  /**
   * Save notification settings
   */
  const saveNotificationSettings = () => {
    // Show loading state
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Call the onSave function passed from the parent
      onSave();
      
      // Hide loading state
      setIsLoading(false);
      
      // Reset changes flag
      setHasChanges(false);
    }, 1500);
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
      className="notification-preferences"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2>Notification Settings</h2>
      
      {/* Email Notifications Section */}
      <motion.div 
        className="notification-section"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <h3>
          <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '10px' }} />
          Email Notifications
        </h3>
        <div className="notification-group">
          <motion.div className="notification-item" variants={itemVariants}>
            <label>Weekly Financial Report</label>
            <div 
              className={`toggle-switch ${notifications.emailNotifications.weeklyReport ? 'active' : ''}`}
              onClick={() => toggleNotification('emailNotifications', 'weeklyReport')}
            >
              <div className="toggle-slider"></div>
            </div>
          </motion.div>
          
          <motion.div className="notification-item" variants={itemVariants}>
            <label>Budget Alerts</label>
            <div 
              className={`toggle-switch ${notifications.emailNotifications.budgetAlerts ? 'active' : ''}`}
              onClick={() => toggleNotification('emailNotifications', 'budgetAlerts')}
            >
              <div className="toggle-slider"></div>
            </div>
          </motion.div>
          
          <motion.div className="notification-item" variants={itemVariants}>
            <label>Transaction Updates</label>
            <div 
              className={`toggle-switch ${notifications.emailNotifications.transactionUpdates ? 'active' : ''}`}
              onClick={() => toggleNotification('emailNotifications', 'transactionUpdates')}
            >
              <div className="toggle-slider"></div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Push Notifications Section */}
      <motion.div 
        className="notification-section"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.3 }}
      >
        <h3>
          <FontAwesomeIcon icon={faBell} style={{ marginRight: '10px' }} />
          Push Notifications
        </h3>
        <div className="notification-group">
          <motion.div className="notification-item" variants={itemVariants}>
            <label>Low Balance Alerts</label>
            <div 
              className={`toggle-switch ${notifications.pushNotifications.lowBalance ? 'active' : ''}`}
              onClick={() => toggleNotification('pushNotifications', 'lowBalance')}
            >
              <div className="toggle-slider"></div>
            </div>
          </motion.div>
          
          <motion.div className="notification-item" variants={itemVariants}>
            <label>Unusual Activity</label>
            <div 
              className={`toggle-switch ${notifications.pushNotifications.unusualActivity ? 'active' : ''}`}
              onClick={() => toggleNotification('pushNotifications', 'unusualActivity')}
            >
              <div className="toggle-slider"></div>
            </div>
          </motion.div>
          
          <motion.div className="notification-item" variants={itemVariants}>
            <label>Goal Progress</label>
            <div 
              className={`toggle-switch ${notifications.pushNotifications.goalProgress ? 'active' : ''}`}
              onClick={() => toggleNotification('pushNotifications', 'goalProgress')}
            >
              <div className="toggle-slider"></div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* SMS Notifications Section */}
      <motion.div 
        className="notification-section"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.6 }}
      >
        <h3>
          <FontAwesomeIcon icon={faMobile} style={{ marginRight: '10px' }} />
          SMS Notifications
        </h3>
        <div className="notification-group">
          <motion.div className="notification-item" variants={itemVariants}>
            <label>Critical Alerts</label>
            <div 
              className={`toggle-switch ${notifications.smsNotifications.criticalAlerts ? 'active' : ''}`}
              onClick={() => toggleNotification('smsNotifications', 'criticalAlerts')}
            >
              <div className="toggle-slider"></div>
            </div>
          </motion.div>
          
          <motion.div className="notification-item" variants={itemVariants}>
            <label>Payment Reminders</label>
            <div 
              className={`toggle-switch ${notifications.smsNotifications.paymentReminders ? 'active' : ''}`}
              onClick={() => toggleNotification('smsNotifications', 'paymentReminders')}
            >
              <div className="toggle-slider"></div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Notification Frequency Section */}
      <motion.div 
        className="notification-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <h3>Notification Frequency</h3>
        <div className="frequency-selector">
          <button 
            className={`frequency-option ${frequencyOption === 'real-time' ? 'active' : ''}`}
            onClick={() => handleFrequencyChange('real-time')}
          >
            Real-time
          </button>
          <button 
            className={`frequency-option ${frequencyOption === 'daily' ? 'active' : ''}`}
            onClick={() => handleFrequencyChange('daily')}
          >
            Daily Digest
          </button>
          <button 
            className={`frequency-option ${frequencyOption === 'weekly' ? 'active' : ''}`}
            onClick={() => handleFrequencyChange('weekly')}
          >
            Weekly Summary
          </button>
        </div>
      </motion.div>
      
      {/* Save Button */}
      <motion.button 
        className="save-button"
        onClick={saveNotificationSettings}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={!hasChanges || isLoading}
      >
        {isLoading ? 'Saving...' : 'Save Notification Preferences'}
      </motion.button>
    </motion.div>
  );
};

export default NotificationPreferences;