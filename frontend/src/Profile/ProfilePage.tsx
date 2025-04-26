/**
 * ProfilePage.tsx
 * 
 * Main container component for the user profile section.
 * Handles routing between different profile sections and displays the appropriate component.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faShieldAlt, 
  faChartLine,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

// Import section components
import PersonalInfo from './PersonalInfo';
import SecuritySettings from './SecuritySettings';
import FinancialGoals from './FinancialGoals';

// Import styles and context
import './ProfileStyles.css';
import { useNotification } from './contexts/NotificationContext';

const API_BASE_URL = 'https://finovators.mracs.dev/api';

/**
 * Gets the FontAwesome icon for a section
 * @param section - The section identifier
 * @returns The corresponding FontAwesome icon
 */
const getSectionIcon = (section: string) => {
  switch(section) {
    case 'personal': return faUser;
    case 'security': return faShieldAlt;
    case 'goals': return faChartLine;
    default: return faUser;
  }
};

/**
 * Props for the ProfilePage component
 */
interface ProfilePageProps {
  // Add any required props here
}

/**
 * The main ProfilePage component
 */
const ProfilePage: React.FC<ProfilePageProps> = () => {
  // State to track the active profile section
  const [activeSection, setActiveSection] = useState('personal');
  
  // Hooks
  const navigate = useNavigate();
  const { showNotification, simulateLoading } = useNotification();
  
  /**
   * Navigate back to the previous page
   */
  const handleGoBack = () => {
    navigate(-1);
  };
  
  /**
   * Handles saving data for any profile section
   * @param message - The success message to display
   */
  const handleSaveAction = (message: string) => {
    simulateLoading(() => {
      showNotification(message);
    });
  };
  
  /**
   * Renders the appropriate component based on the active section
   */
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personal':
        return <PersonalInfo onSave={() => handleSaveAction('Personal information updated!')} />;
      case 'security':
        return <SecuritySettings onSave={() => handleSaveAction('Security settings updated!')} />;
      case 'goals':
        return <FinancialGoals onSave={() => handleSaveAction('Financial goals updated!')} />;
      default:
        return <PersonalInfo onSave={() => handleSaveAction('Personal information updated!')} />;
    }
  };

  return (
    <div className="profile-page">
      {/* Back button */}
      <div className="profile-back-button">
        <motion.button
          onClick={handleGoBack}
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back
        </motion.button>
      </div>

      {/* Main profile container with sidebar and content area */}
      <div className="profile-container">
        {/* Sidebar with user info and navigation */}
        <motion.div
          className="profile-sidebar"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          
          {/* Navigation menu */}
          <nav className="profile-nav">
            {['personal', 'security', 'goals'].map((section) => (
              <motion.button 
                key={section}
                className={activeSection === section ? 'active' : ''}
                onClick={() => setActiveSection(section)}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={getSectionIcon(section)} />
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </motion.button>
            ))}
          </nav>
        </motion.div>
        
        {/* Content area - shows the selected section */}
        <motion.div 
          className="profile-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* Animate section transitions */}
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