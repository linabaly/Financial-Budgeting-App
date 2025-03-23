import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileHeader from './ProfileHeader';
import PersonalInfo from './PersonalInfo';
import AccountSettings from './AccountSettings';
import SecuritySettings from './SecuritySettings';
import NotificationPreferences from './NotificationPreferences';
import FinancialGoals from './FinancialGoals';
import './ProfileStyles.css';

const ProfilePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('personal');
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Go back to the previous page or default to dashboard
    navigate(-1);
  };

  const renderActiveSection = () => {
    switch(activeSection) {
      case 'personal':
        return <PersonalInfo />;
      case 'account':
        return <AccountSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'notifications':
        return <NotificationPreferences />;
      case 'goals':
        return <FinancialGoals />;
      default:
        return <PersonalInfo />;
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-back-button">
        <button onClick={handleGoBack}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
      </div>
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <img 
              src="/default-avatar.png" 
              alt="Profile" 
            />
            <div className="avatar-upload">
              <input 
                type="file" 
                id="avatar-upload" 
                accept="image/*" 
                style={{display: 'none'}} 
              />
              <label htmlFor="avatar-upload">
                Change Photo
              </label>
            </div>
          </div>
          <nav className="profile-nav">
            <button 
              className={activeSection === 'personal' ? 'active' : ''}
              onClick={() => setActiveSection('personal')}
            >
              Personal Info
            </button>
            <button 
              className={activeSection === 'account' ? 'active' : ''}
              onClick={() => setActiveSection('account')}
            >
              Account Settings
            </button>
            <button 
              className={activeSection === 'security' ? 'active' : ''}
              onClick={() => setActiveSection('security')}
            >
              Security
            </button>
            <button 
              className={activeSection === 'notifications' ? 'active' : ''}
              onClick={() => setActiveSection('notifications')}
            >
              Notifications
            </button>
            <button 
              className={activeSection === 'goals' ? 'active' : ''}
              onClick={() => setActiveSection('goals')}
            >
              Financial Goals
            </button>
          </nav>
        </div>
        <div className="profile-content">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;