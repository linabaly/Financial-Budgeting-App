/**
 * Header Component
 * 
 * Main navigation header with responsive design for the Finovators app.
 * Provides navigation controls, logo display, and mobile menu functionality.
 * Adapts its appearance based on scroll position and current theme.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  // Track scroll position and menu state
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Determine if a navigation item should be highlighted as active
  const isActive = (path: string): boolean => location.pathname === path;

  // Update header appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
  
    handleScroll(); // Initialize on mount
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);  

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Navigation handlers
  const handleLogoClick = () => navigate('/dashboard');
  const handleNavClick = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <div className="logo-container" onClick={handleLogoClick}>
          <div className="logo">
            <img
              src={theme === 'light' ? '/icons/logo2.png' : '/icons/logo.png'}
              alt="Finovators Logo"
              className="logo-image"
            />
          </div>
        </div>

        {/* Mobile menu toggle button */}
        {!menuOpen && (
          <div className="mobile-menu-toggle" onClick={() => setMenuOpen(true)}>
            <div className="menu-bar"></div>
          </div>
        )}

        {/* Navigation menu */}
        <nav ref={menuRef} className={`navigation ${menuOpen ? 'open' : ''}`}>
          <button className={`nav-button ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => handleNavClick('/dashboard')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
            <span>Dashboard</span>
          </button>

          <button className={`nav-button ${isActive('/insights') ? 'active' : ''}`} onClick={() => handleNavClick('/insights')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
            <span>My Insights</span>
          </button>

          <button className={`nav-button ${isActive('/transactions') ? 'active' : ''}`} onClick={() => handleNavClick('/transactions')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <span>Transactions</span>
          </button>

          <div className="profile-icon" onClick={() => handleNavClick('/profile')}>
            <div className="avatar">
              <svg className="profile-avatar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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