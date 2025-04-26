/**
 * PersonalInfo.tsx
 * 
 * Component for displaying and editing basic user information
 * such as name, email, and other personal details.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

// API configuration
const API_BASE_URL = "https://finovators.mracs.dev/api";

/**
 * Props for the PersonalInfo component
 */
interface PersonalInfoProps {
  /** Callback function when data is successfully saved */
  onSave: () => void;
}

/**
 * PersonalInfo component for displaying and updating user's personal information
 */
const PersonalInfo: React.FC<PersonalInfoProps> = ({ onSave }) => {
  // State for error handling and loading
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // State for form fields
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: ""
  });

  /**
   * Handles input changes in form fields
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    setPersonalInfo(prev => ({
      ...prev,
      [id]: value
    }));
  }, []);

  /**
   * Updates the user's profile information
   */
  const handleUpdateInfo = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No token found. Please try again.");
      }
      
      // Send updated profile to the server
      const response = await fetch(`${API_BASE_URL}/account/me`, {
        method: "PATCH",
        headers: {
          "Authorization": token,  
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: personalInfo.name,
          email: personalInfo.email,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Call the onSave callback
      onSave();
      setProfileError(null);
    } catch (error: any) {
      setProfileError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch user profile data on component mount
   */
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error("No token found. Please log in again.");
        }
  
        const response = await fetch(`${API_BASE_URL}/account/me`, {  
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token,
          },
        });
  
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || "Failed to fetch profile data");
        }
  
        const data = await response.json();
        
        // Update the form with fetched data
        setPersonalInfo({
          name: data.name || "",
          email: data.email || ""
        });
      } catch (error: any) {
        setProfileError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchProfileData();
  }, []);
  
  return (
    <motion.div 
      className="personal-info-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2>Personal Information</h2>
      
      {/* Display error message if present */}
      {profileError && <div className="error-message">{profileError}</div>}
      
      {/* Loading indicator */}
      {isLoading && <div className="loading-indicator">Loading...</div>}
      
      {/* Form fields */}
      <div className="form-grid">
        <motion.div 
          className="form-group"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <label htmlFor="name">Full Name</label>
          <input 
            type="text" 
            id="name"
            value={personalInfo.name}
            placeholder="Enter your full name"
            onChange={handleInputChange}
            disabled={isLoading}
          />
        </motion.div>
        
        <motion.div 
          className="form-group"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email"
            value={personalInfo.email}
            placeholder="Enter your email"
            onChange={handleInputChange}
            disabled={isLoading}
          />
        </motion.div>
      </div>
      
      {/* Save button */}
      <motion.button 
        className="save-button"
        onClick={handleUpdateInfo}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : 'Save Changes'}
      </motion.button>
    </motion.div>
  );
};

export default PersonalInfo;