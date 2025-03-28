import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PersonalInfo from './PersonalInfo';
import AccountSettings from './AccountSettings';
import SecuritySettings from './SecuritySettings';
import NotificationPreferences from './NotificationPreferences';
import FinancialGoals from './FinancialGoals';
import './ProfileStyles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { useNotification } from './contexts/NotificationContext';

import { 
  faUser, 
  faCog, 
  faShieldAlt, 
  faBell, 
  faChartLine 
} from '@fortawesome/free-solid-svg-icons';

// Function to get the icon for each section
const getIconForSectionFA = (section: string) => {
  switch(section) {
    case 'personal': return faUser;
    case 'account': return faCog;
    case 'security': return faShieldAlt;
    case 'notifications': return faBell;
    case 'goals': return faChartLine;
    default: return faUser;
  }
};

interface ProfilePageProps {
  // Add any props if needed
}

const ProfilePage: React.FC<ProfilePageProps> = () => {
  const [activeSection, setActiveSection] = useState('personal');
  const { showNotification, simulateLoading, isLoading } = useNotification();
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Go back to the previous page or default to dashboard
    navigate(-1);
  };

  const handleSaveAction = (message: string) => {
    simulateLoading(() => {
      showNotification(message);
    });
  };

  const renderActiveSection = () => {
    switch(activeSection) {
      case 'personal':
        return <PersonalInfo onSave={() => handleSaveAction('Personal information updated!')} />;
      case 'account':
        return <AccountSettings onSave={() => handleSaveAction('Account settings updated!')} />;
      case 'security':
        return <SecuritySettings onSave={() => handleSaveAction('Security settings updated!')} />;
      case 'notifications':
        return <NotificationPreferences onSave={() => handleSaveAction('Notification preferences updated!')} />;
      case 'goals':
        return <FinancialGoals onSave={() => handleSaveAction('Financial goals updated!')} />;
      default:
        return <PersonalInfo onSave={() => handleSaveAction('Personal information updated!')} />;
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-back-button">
        <motion.button 
          onClick={handleGoBack}
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon="arrow-left" />
          Back
        </motion.button>
      </div>
      
      <div className="profile-container">
        <motion.div 
          className="profile-sidebar"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="profile-avatar">
            <div className="avatar-wrapper">
              <img 
                src="/default-avatar.png" 
                alt="Profile" 
                onError={(e) => {
                  // Fallback if image doesn't exist
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                }}
              />
              <div className="avatar-overlay">
                <label htmlFor="avatar-upload">
                  <FontAwesomeIcon icon="camera" />
                </label>
                <input 
                  type="file" 
                  id="avatar-upload" 
                  accept="image/*" 
                  style={{display: 'none'}} 
                />
              </div>
            </div>
            <h3>Alex Johnson</h3>
            <p>Software Engineer</p>
          </div>
          
          <nav className="profile-nav">
            {['personal', 'account', 'security', 'notifications', 'goals'].map((section) => (
              <motion.button 
                key={section}
                className={activeSection === section ? 'active' : ''}
                onClick={() => setActiveSection(section)}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={getIconForSectionFA(section)} />
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </motion.button>
            ))}
          </nav>
        </motion.div>
        
        <motion.div 
          className="profile-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="content-section"
            >
              {renderActiveSection()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;