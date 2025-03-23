import React from 'react';

interface ProfileHeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  activeSection, 
  setActiveSection 
}) => {
  return (
    <div className="profile-navigation">
      <div 
        className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`}
        onClick={() => setActiveSection('overview')}
      >
        Overview
      </div>
      <div 
        className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
        onClick={() => setActiveSection('settings')}
      >
        Settings
      </div>
      <div 
        className={`nav-item ${activeSection === 'security' ? 'active' : ''}`}
        onClick={() => setActiveSection('security')}
      >
        Security
      </div>
    </div>
  );
};

export default ProfileHeader;