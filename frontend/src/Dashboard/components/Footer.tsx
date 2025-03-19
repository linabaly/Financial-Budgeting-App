// src/components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-tagline">
          <h2>Track, Manage, Thrive with</h2>
          <h1>Finovators</h1>
        </div>
        <div className="footer-links">
          <div className="footer-column">
            <a href="#">FAQs</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Legal & Compliance</a>
          </div>
          <div className="footer-column">
            <div className="contact-info">contact@gmail.com</div>
            <div className="contact-info">+1 234 567 89 00</div>
            <div className="social-icons">
              <span className="social-icon">○</span>
              <span className="social-icon">○</span>
              <span className="social-icon">○</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;