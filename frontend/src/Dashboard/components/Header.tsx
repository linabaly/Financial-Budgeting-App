// src/components/Header.tsx
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="logo">Finovators</div>
      <nav className="navigation">
        <button className="nav-button active">Dashboard</button>
        <button className="nav-button">My Insights</button>
        <button className="nav-button">Transactions</button>
        <div className="profile-icon">
          <div className="circle"></div>
        </div>
      </nav>
    </header>
  );
};

export default Header;