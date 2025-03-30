import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faEnvelope, faMobile, faCheck } from '@fortawesome/free-solid-svg-icons';

interface NotificationPreferencesProps {
  onSave: () => void;
}

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

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ onSave }) => {
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
  
  const [frequencyOption, setFrequencyOption] = useState<string>('real-time');
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Track changes when notifications state changes
  useEffect(() => {
    setHasChanges(true);
  }, [notifications, frequencyOption]);

  const toggleNotification = (category: string, key: string) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof Notifications],
        [key]: !(prev[category as keyof Notifications] as any)[key]
      }
    }));
    // No notification shown when toggle is changed
  };

  const handleFrequencyChange = (option: string) => {
    setFrequencyOption(option);
    // No notification shown when frequency is changed
  };
  
  const showNotificationMessage = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };
  
  const saveNotificationSettings = () => {
    // Show loading state
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Call the onSave function passed from the parent
      onSave();
      
      // Hide loading state
      setIsLoading(false);
      
      // Show success notification
      showNotificationMessage('Notification preferences saved successfully!');
      
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

  const notificationVariants = {
    hidden: { right: -300, opacity: 0 },
    visible: { right: 20, opacity: 1 },
    exit: { right: -300, opacity: 0 }
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
        className="notification-frequency"
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
      
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            className="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <span className="loader"></span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Save Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            className="save-notification"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={notificationVariants}
          >
            <FontAwesomeIcon icon={faCheck} style={{ marginRight: '10px' }} />
            {notificationMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NotificationPreferences;