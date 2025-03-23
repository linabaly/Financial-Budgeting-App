import React, { useState } from 'react';

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

const NotificationPreferences: React.FC = () => {
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

  const toggleNotification = (category: string, key: string) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof Notifications],
        [key]: !(prev[category as keyof Notifications] as any)[key]
      }
    }));
  };

  const saveNotificationSettings = () => {
    console.log('Saving notification preferences:', notifications);
    alert('Notification preferences updated successfully!');
  };

  return (
    <div className="notification-preferences">
      <h2>Notification Settings</h2>
      
      <div className="notification-section">
        <h3>Email Notifications</h3>
        <div className="notification-group">
          <div className="notification-item">
            <label>Weekly Financial Report</label>
            <div 
              className={`toggle-switch ${notifications.emailNotifications.weeklyReport ? 'active' : ''}`}
              onClick={() => toggleNotification('emailNotifications', 'weeklyReport')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
          
          <div className="notification-item">
            <label>Budget Alerts</label>
            <div 
              className={`toggle-switch ${notifications.emailNotifications.budgetAlerts ? 'active' : ''}`}
              onClick={() => toggleNotification('emailNotifications', 'budgetAlerts')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
          
          <div className="notification-item">
            <label>Transaction Updates</label>
            <div 
              className={`toggle-switch ${notifications.emailNotifications.transactionUpdates ? 'active' : ''}`}
              onClick={() => toggleNotification('emailNotifications', 'transactionUpdates')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="notification-section">
        <h3>Push Notifications</h3>
        <div className="notification-group">
          <div className="notification-item">
            <label>Low Balance Alerts</label>
            <div 
              className={`toggle-switch ${notifications.pushNotifications.lowBalance ? 'active' : ''}`}
              onClick={() => toggleNotification('pushNotifications', 'lowBalance')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
          
          <div className="notification-item">
            <label>Unusual Activity</label>
            <div 
              className={`toggle-switch ${notifications.pushNotifications.unusualActivity ? 'active' : ''}`}
              onClick={() => toggleNotification('pushNotifications', 'unusualActivity')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
          
          <div className="notification-item">
            <label>Goal Progress</label>
            <div 
              className={`toggle-switch ${notifications.pushNotifications.goalProgress ? 'active' : ''}`}
              onClick={() => toggleNotification('pushNotifications', 'goalProgress')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="notification-section">
        <h3>SMS Notifications</h3>
        <div className="notification-group">
          <div className="notification-item">
            <label>Critical Alerts</label>
            <div 
              className={`toggle-switch ${notifications.smsNotifications.criticalAlerts ? 'active' : ''}`}
              onClick={() => toggleNotification('smsNotifications', 'criticalAlerts')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
          
          <div className="notification-item">
            <label>Payment Reminders</label>
            <div 
              className={`toggle-switch ${notifications.smsNotifications.paymentReminders ? 'active' : ''}`}
              onClick={() => toggleNotification('smsNotifications', 'paymentReminders')}
            >
              <div className="toggle-slider"></div>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        className="save-button"
        onClick={saveNotificationSettings}
      >
        Save Notification Preferences
      </button>
    </div>
  );
};

export default NotificationPreferences;