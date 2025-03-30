import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { 
  faChartPie, 
  faCog, 
  faShieldAlt 
} from '@fortawesome/free-solid-svg-icons';

interface ProfileHeaderProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onSave?: () => void; // Optional since header usually doesn't save data directly
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  activeSection, 
  setActiveSection,
  onSave 
}) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };

  // Get the proper icon
  const getIcon = (iconName: string): IconProp => {
    switch(iconName) {
      case 'chart-pie': return faChartPie;
      case 'cog': return faCog;
      case 'shield-alt': return faShieldAlt;
      default: return faCog;
    }
  };

  // Header sections with their icons
  const sections = [
    { id: 'overview', label: 'Overview', icon: 'chart-pie' },
    { id: 'settings', label: 'Settings', icon: 'cog' },
    { id: 'security', label: 'Security', icon: 'shield-alt' }
  ];

  return (
    <motion.div 
      className="profile-header"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="profile-user-info">
        <motion.div 
          className="profile-avatar-header"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img 
            src="/default-avatar.png" 
            alt="Profile" 
            onError={(e) => {
              // Fallback if image doesn't exist
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
            }}
          />
          <div className="user-status online"></div>
        </motion.div>
        <motion.div
          className="profile-user-details"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2>Alex Johnson</h2>
          <p>Premium Account</p>
        </motion.div>
      </div>

      <motion.div className="profile-navigation">
        {sections.map((section) => (
          <motion.div 
            key={section.id}
            className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              backgroundColor: activeSection === section.id ? undefined : 'rgba(255, 255, 255, 0.05)'
            }}
            whileTap={{ scale: 0.98 }}
          >
            <FontAwesomeIcon icon={getIcon(section.icon)} />
            <span>{section.label}</span>
            {activeSection === section.id && (
              <motion.div 
                className="active-indicator"
                layoutId="activeIndicator"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        className="profile-stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="stat-item">
          <div className="stat-value">87%</div>
          <div className="stat-label">Profile Complete</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">5</div>
          <div className="stat-label">Active Goals</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">$3,240</div>
          <div className="stat-label">Total Savings</div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileHeader;