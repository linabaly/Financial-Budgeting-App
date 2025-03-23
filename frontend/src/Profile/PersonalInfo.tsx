import React, { useState } from 'react';

const PersonalInfo: React.FC = () => {
  const [personalInfo, setPersonalInfo] = useState({
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Finance Street, New York, NY 10001',
    birthday: '1990-05-15',
    occupation: 'Software Engineer'
  });

  const handleUpdateInfo = () => {
    // Implement API call to update personal information
    console.log('Updating personal info:', personalInfo);
    alert('Personal information updated successfully!');
  };

  return (
    <div className="personal-info-section">
      <h2>Personal Information</h2>
      <div className="info-grid">
        <div className="form-group">
          <label>First Name</label>
          <input 
            type="text" 
            value={personalInfo.firstName}
            onChange={(e) => setPersonalInfo({
              ...personalInfo, 
              firstName: e.target.value
            })}
          />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input 
            type="text" 
            value={personalInfo.lastName}
            onChange={(e) => setPersonalInfo({
              ...personalInfo, 
              lastName: e.target.value
            })}
          />
        </div>
        <div className="form-group full-width">
          <label>Email</label>
          <input 
            type="email" 
            value={personalInfo.email}
            onChange={(e) => setPersonalInfo({
              ...personalInfo, 
              email: e.target.value
            })}
          />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input 
            type="tel" 
            value={personalInfo.phone}
            onChange={(e) => setPersonalInfo({
              ...personalInfo, 
              phone: e.target.value
            })}
          />
        </div>
        <div className="form-group">
          <label>Birthday</label>
          <input 
            type="date" 
            value={personalInfo.birthday}
            onChange={(e) => setPersonalInfo({
              ...personalInfo, 
              birthday: e.target.value
            })}
          />
        </div>
        <div className="form-group">
          <label>Occupation</label>
          <input 
            type="text" 
            value={personalInfo.occupation}
            onChange={(e) => setPersonalInfo({
              ...personalInfo, 
              occupation: e.target.value
            })}
          />
        </div>
        <div className="form-group full-width">
          <label>Address</label>
          <input 
            type="text" 
            value={personalInfo.address}
            onChange={(e) => setPersonalInfo({
              ...personalInfo, 
              address: e.target.value
            })}
          />
        </div>
      </div>
      <button 
        className="save-button"
        onClick={handleUpdateInfo}
      >
        Save Changes
      </button>
    </div>
  );
};

export default PersonalInfo;