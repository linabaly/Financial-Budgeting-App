import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Determine which button should have the active class
  const isActive = (path: string) => location.pathname === path;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Logo click handler to navigate to dashboard
  const handleLogoClick = () => {
    navigate('/dashboard');
  };
  
  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <div className="logo-container" onClick={handleLogoClick}>
          <div className="logo">
            <span className="logo-text">Finovators</span>
          </div>
        </div>
        
        <div className="mobile-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <div className={`menu-bar ${menuOpen ? 'open' : ''}`}></div>
        </div>
        
        <nav className={`navigation ${menuOpen ? 'open' : ''}`}>
          <button 
            className={`nav-button ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => {
              navigate('/dashboard');
              setMenuOpen(false);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
            <span>Dashboard</span>
          </button>
          
          <button 
            className={`nav-button ${isActive('/insights') ? 'active' : ''}`}
            onClick={() => {
              navigate('/insights');
              setMenuOpen(false);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
            <span>My Insights</span>
          </button>
          
          <button 
            className={`nav-button ${isActive('/transactions') ? 'active' : ''}`}
            onClick={() => {
              navigate('/transactions');
              setMenuOpen(false);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <span>Transactions</span>
          </button>
          
          <div className="profile-icon" onClick={() => navigate('/profile')}>
            <div className="avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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