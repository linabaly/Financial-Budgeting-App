// You can input new email and name, but it doesn 't update the profile.
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from "../config";

interface PersonalInfoProps {
  onSave: () => void;
}


const PersonalInfo: React.FC<PersonalInfoProps> = ({ onSave }) => {
  const [profileError, setProfileError] = useState<string | null>(null);
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: ''
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [id]: value
    }));
  }, []);

  const handleUpdateInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please try again.");
      
      const response = await fetch(`${API_BASE_URL}/account/me`, {
        method: "PATCH",
        headers: {
          "Authorization": token,  
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

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found. Please log in again.");
  
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
        console.log("Profile Data:", data);

        setPersonalInfo({
          name: data.name || '',
          email: data.email || ''
        });
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
      {profileError && <div className="error-message">{profileError}</div>}
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
            id="name"
            value={personalInfo.name}
            placeholder='Enter your full name'
            onChange={handleInputChange}
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
            id="email"
            value={personalInfo.email}
            placeholder='Enter your email'
            onChange={handleInputChange}
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