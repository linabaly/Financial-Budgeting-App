import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import './Header.css';
// Import the logo - adjust the path if needed


/**
 * Header Component
 * 
 * Main navigation component that provides:
 * - Sticky header with scroll-based appearance changes
 * - Responsive navigation for desktop and mobile
 * - Active route indication
 * - Smooth transitions and animations
 */
const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  
  // State management
  const [scrolled, setScrolled] = useState(false); // Controls header appearance on scroll
  const [menuOpen, setMenuOpen] = useState(false); // Controls mobile menu visibility

  /**
   * Checks if the current route matches the provided path
   * Used to highlight active navigation items
   */
  const isActive = (path: string): boolean => location.pathname === path;

  /**
   * Scroll event handler - changes header appearance when scrolled
   * Adds shadow, changes background opacity, and adjusts padding
   */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  /**
   * Navigation handlers
   * Each handler navigates to the specified route and closes mobile menu
   */
  const handleLogoClick = () => {
    navigate('/dashboard');
  };
  
  const handleNavClick = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };
  
  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        {/* Logo that changes with theme */}
        <div className="logo-container" onClick={handleLogoClick}>
          <div className="logo">
            <img
              src={theme === 'light' ? '/icons/logo2.png' : '/icons/logo.png'}
              alt="Finovators Logo"
              className="logo-image"
            />
          </div>
        </div>
        
        {/* Mobile Menu Toggle Button */}
        <div className="mobile-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <div className={`menu-bar ${menuOpen ? 'open' : ''}`}></div>
        </div>
        
        {/* Main Navigation Menu */}
        <nav className={`navigation ${menuOpen ? 'open' : ''}`}>
          {/* Dashboard Button */}
          <button 
            className={`nav-button ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => handleNavClick('/dashboard')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
            <span>Dashboard</span>
          </button>
          
          {/* Insights Button */}
          <button 
            className={`nav-button ${isActive('/insights') ? 'active' : ''}`}
            onClick={() => handleNavClick('/insights')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
            <span>My Insights</span>
          </button>
          
          {/* Transactions Button */}
          <button 
            className={`nav-button ${isActive('/transactions') ? 'active' : ''}`}
            onClick={() => handleNavClick('/transactions')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <span>Transactions</span>
          </button>
          
          {/* User Profile */}
          <div 
            className="profile-icon" 
            onClick={() => handleNavClick('/profile')}
          >
            <div className="avatar">
              <svg 
                className="profile-avatar-icon"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;