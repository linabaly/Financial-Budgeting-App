import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface PersonalInfoProps {
  onSave: () => void;
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ onSave }) => {
  const [personalInfo, setPersonalInfo] = useState({
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Finance Street, New York, NY 10001',
    birthday: '1990-05-15',
    occupation: 'Software Engineer',
    bio: 'Finance enthusiast and tech professional with a passion for efficient money management.'
  });

  const handleInputChange = (field: string, value: string) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateInfo = () => {
    // Call the onSave function passed from the parent
    onSave();
  };

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
          <label>First Name</label>
          <input 
            type="text" 
            value={personalInfo.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
          />
        </motion.div>
        
        <motion.div 
          className="form-group"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <label>Last Name</label>
          <input 
            type="text" 
            value={personalInfo.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
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
            value={personalInfo.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </motion.div>
        
        <motion.div 
          className="form-group"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <label>Phone Number</label>
          <input 
            type="tel" 
            value={personalInfo.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
        </motion.div>
        
        <motion.div 
          className="form-group full-width"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <label>Bio</label>
          <textarea 
            value={personalInfo.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
          />
        </motion.div>
        
        <motion.div 
          className="form-group"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <label>Occupation</label>
          <input 
            type="text" 
            value={personalInfo.occupation}
            onChange={(e) => handleInputChange('occupation', e.target.value)}
          />
        </motion.div>
        
        <motion.div 
          className="form-group"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <label>Birthday</label>
          <input 
            type="date" 
            value={personalInfo.birthday}
            onChange={(e) => handleInputChange('birthday', e.target.value)}
          />
        </motion.div>
        
        <motion.div 
          className="form-group full-width"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <label>Address</label>
          <input 
            type="text" 
            value={personalInfo.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
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