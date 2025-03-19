// src/Dashboard/components/Header.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="header">
      <div className="logo">Finovators</div>
      <nav className="navigation">
        <button 
          className={`nav-button ${isActive('/') ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          Dashboard
        </button>
        <button 
          className={`nav-button ${isActive('/insights') ? 'active' : ''}`}
          onClick={() => navigate('/insights')}
        >
          My Insights
        </button>
        <button className="nav-button">Transactions</button>
        <div className="profile-icon">
          <div className="circle"></div>
        </div>
      </nav>
    </header>
  );
};

export default Header;