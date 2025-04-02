import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { API_BASE_URL } from "../config";


interface PersonalInfoProps {
  onSave: () => void;
}

// TODO: Change Name and Email to be editable

const PersonalInfo: React.FC<PersonalInfoProps> = ({ onSave }) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please try again.");
      
      const response = await fetch(`${API_BASE_URL}/account/me`, {
        method: "PATCH",
        headers: {
          "Authentication": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(personalInfo),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to update profile");
      }
      
      onSave();
    } catch (error: any) {
      setProfileError(error.message);
    }
  };


  // Fetch user profile name
    useEffect(() => {
        const fetchProfileData = async () => {
          try {
    
            const token = localStorage.getItem("token");
            console.log(token);
            if (!token) throw new Error("No token found. Please log in again.");
      
            const response = await fetch("http://localhost:5005/account/me", {
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
            console.log("Profile Data:", data);
            setProfileData(data);
          } catch (error: any) {
            setProfileError(error.message);
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
      <div className="form-grid">
        <motion.div 
          className="form-group"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <label>Full Name</label>
          <input 
            type="text" 
            value={profileData ? profileData.name || "User" : "Loading..."}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
          />
        </motion.div>
        
        <motion.div 
          className="form-group"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <label>Email</label>
          <input 
            type="email" 
            value={profileData ? profileData.email || "email" : "Loading..."}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </motion.div>
      </div>
      
      <motion.button 
        className="save-button"
        onClick={handleUpdateInfo}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Save Changes
      </motion.button>
    </motion.div>
  );
};

export default PersonalInfo;  