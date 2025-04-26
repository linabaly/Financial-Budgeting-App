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
  faCog, 
  faShieldAlt, 
  faBell, 
  faChartLine,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

// Import section components
import PersonalInfo from './PersonalInfo';
import AccountSettings from './AccountSettings';
import SecuritySettings from './SecuritySettings';
import NotificationPreferences from './NotificationPreferences';
import FinancialGoals from './FinancialGoals';

// Import styles and context
import './ProfileStyles.css';
import { useNotification } from './contexts/NotificationContext';

const API_BASE_URL = "https://finovators.mracs.dev/api";

/**
 * Gets the FontAwesome icon for a section
 * @param section - The section identifier
 * @returns The corresponding FontAwesome icon
 */
const getSectionIcon = (section: string) => {
  switch(section) {
    case 'personal': return faUser;
    case 'account': return faCog;
    case 'security': return faShieldAlt;
    case 'notifications': return faBell;
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
  
  // User profile data (would normally come from an API)
  const [profileData, setProfileData] = useState<any>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  
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

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("No token found. Please log in again.");
        }

        // Example API call - replace with your actual endpoint
        const response = await fetch(`${API_BASE_URL}/account/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5005/account/avatar", {
        method: "POST",
        headers: {
          Authorization: token!,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to upload avatar");
      }

      const data = await response.json();
      setProfileData((prev: any) => ({
        ...prev,
        avatarUrl: data.avatarUrl
      }));

      showNotification("Profile picture updated!");
    } catch (error) {
      console.error("Upload failed:", error);
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
          {/* User avatar and name */}
          <div className="profile-avatar">
            <div className="avatar-wrapper">
            <img src={profileData?.avatarUrl ? `${API_BASE_URL}${profileData.avatarUrl}` : "/default-avatar.png"}
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
                onChange={(e) => handleAvatarUpload(e)}
              />

              </div>
            </div>
            <h3>{profileData ? profileData.name || "User" : "Loading..."}</h3>
          </div>
          
          {/* Navigation menu */}
          <nav className="profile-nav">
            {['personal', 'account', 'security', 'notifications', 'goals'].map((section) => (
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
