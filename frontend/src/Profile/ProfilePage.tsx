/**
 * ProfilePage Component
 * 
 * Main container component for the user profile section that manages navigation
 * between different profile areas (personal info, security, financial goals).
 * Handles data fetching and section transitions with animations.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faCog, 
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
 * Maps section identifiers to their corresponding FontAwesome icons
 */
const getSectionIcon = (section: string) => {
  switch(section) {
    case 'personal': return faUser;
    case 'account': return faCog;
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
 * Main ProfilePage component that handles section navigation and rendering
 */
const ProfilePage: React.FC<ProfilePageProps> = () => {
  // State to track the active profile section
  const [activeSection, setActiveSection] = useState('personal');
  
  // User profile data state
  const [profileData, setProfileData] = useState<any>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  
  // Hooks
  const navigate = useNavigate();
  const { showNotification, simulateLoading } = useNotification();
  
  /**
   * Navigates back to the previous page
   */
  const handleGoBack = () => {
    navigate(-1);
  };
  
  /**
   * Shows a success notification when data is saved
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

  /**
   * Fetches user profile data on component mount
   */
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("No token found. Please log in again.");
        }

        const response = await fetch(`${API_BASE_URL}/account/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || "Failed to fetch profile data");
        }

        const data = await response.json();
        setProfileData(data);
      } catch (error: any) {
        setProfileError(error.message);
      }
    };

    fetchProfileData();
  }, []);

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
        {/* Sidebar with navigation */}
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