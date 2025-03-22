import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  // Function to handle opening different modals
  const openModal = (modalType: string) => {
    setShowModal(modalType);
    setActiveAccordion(null); // Reset accordion state when opening a new modal
  };

  // Function to close any open modal
  const closeModal = () => {
    setShowModal(null);
  };
  
  // Handle newsletter subscription
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.includes('@') && emailInput.includes('.')) {
      setSubscribed(true);
      setEmailInput('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };
  
  // Toggle accordion items
  const toggleAccordion = (index: number) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-branding">
            <div className="footer-logo">
              <div className="logo-text">Finovators</div>
              <div className="logo-tagline">Track, Manage, Thrive</div>
            </div>
            
            <div className="newsletter-signup">
              <h4>Get Financial Tips</h4>
              {subscribed ? (
                <div className="subscribe-success">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>Thank you for subscribing!</span>
                </div>
              ) : (
                <form className="newsletter-form" onSubmit={handleSubscribe}>
                  <input 
                    type="email" 
                    placeholder="Your email address"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                  />
                  <button type="submit" className="subscribe-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </form>
              )}
            </div>
          </div>
          
          <div className="footer-nav">
            <div className="footer-column">
              <h4>Company</h4>
              <button className="footer-link" onClick={() => openModal('about')}>About Us</button>
              <button className="footer-link" onClick={() => openModal('careers')}>Careers</button>
              <button className="footer-link" onClick={() => openModal('press')}>Press</button>
            </div>
            
            <div className="footer-column">
              <h4>Support</h4>
              <button className="footer-link" onClick={() => openModal('faqs')}>FAQs</button>
              <button className="footer-link" onClick={() => openModal('help')}>Help Center</button>
              <button className="footer-link" onClick={() => openModal('contact')}>Contact</button>
            </div>
            
            <div className="footer-column">
              <h4>Legal</h4>
              <button className="footer-link" onClick={() => openModal('privacy')}>Privacy Policy</button>
              <button className="footer-link" onClick={() => openModal('terms')}>Terms of Service</button>
              <button className="footer-link" onClick={() => openModal('legal')}>Legal & Compliance</button>
            </div>
          </div>
        </div>
        
        <div className="footer-divider"></div>
        
        <div className="footer-bottom">
          <div className="copyright">
            © {new Date().getFullYear()} Finovators. All rights reserved.
          </div>
          
          <div className="contact-info">
            <div className="contact-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>contact@finovators.com</span>
            </div>
            
            <div className="contact-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>+1 234 567 89 00</span>
            </div>
          </div>
          
          <div className="social-links">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Modal Popups */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            {/* About Us Modal */}
            {showModal === 'about' && (
              <div className="modal-body">
                <h2>About Finovators</h2>
                <div className="about-section">
                  <h3>Our Mission</h3>
                  <p>At Finovators, we believe everyone deserves financial clarity and control. Our mission is to empower individuals with intuitive tools and insights that transform complex financial data into actionable decisions.</p>
                  
                  <h3>Our Story</h3>
                  <p>Founded in 2022 by a team of financial experts and technology innovators, Finovators was born from a shared frustration with the complexity of personal finance. We recognized that while there were plenty of budgeting tools available, few offered the simplicity, intelligence, and personalization that everyday people need.</p>
                  
                  <p>What began as a simple expense tracker has evolved into a comprehensive financial management platform used by over 500,000 people worldwide.</p>
                  
                  <h3>Our Approach</h3>
                  <p>We take a human-centered approach to financial technology. Rather than overwhelming you with complex charts and jargon, we focus on delivering meaningful insights in plain language, supported by intuitive visuals that anyone can understand.</p>
                  
                  <h3>Our Values</h3>
                  <ul className="values-list">
                    <li><strong>Transparency:</strong> We believe in complete transparency in our operations and pricing.</li>
                    <li><strong>Privacy:</strong> Your financial data is yours. We employ bank-level security and never sell your information.</li>
                    <li><strong>Inclusivity:</strong> We design our products to serve everyone, regardless of financial expertise.</li>
                    <li><strong>Innovation:</strong> We constantly push the boundaries of what financial technology can do.</li>
                  </ul>
                </div>
              </div>
            )}
            
            {/* Careers Modal */}
            {showModal === 'careers' && (
              <div className="modal-body">
                <h2>Careers at Finovators</h2>
                <p className="career-intro">Join our team of passionate innovators who are reshaping how people manage their finances.</p>
                
                <div className="careers-section">
                  <h3>Why Work With Us</h3>
                  <ul className="benefits-list">
                    <li>Competitive salary and equity options</li>
                    <li>Flexible remote work policy</li>
                    <li>Comprehensive health, dental, and vision benefits</li>
                    <li>Generous paid time off and parental leave</li>
                    <li>Professional development stipend</li>
                    <li>401(k) matching program</li>
                    <li>Regular team retreats and events</li>
                  </ul>
                  
                  <h3>Open Positions</h3>
                  <div className="job-listings">
                    <div className="job-card">
                      <h4>Senior Frontend Developer</h4>
                      <p>We're looking for an experienced frontend developer who is passionate about creating intuitive user interfaces and responsive designs.</p>
                      <span className="job-location">Remote (US)</span>
                    </div>
                    
                    <div className="job-card">
                      <h4>Data Scientist</h4>
                      <p>Help us create powerful financial insights and predictions using machine learning and statistical analysis.</p>
                      <span className="job-location">New York, NY</span>
                    </div>
                    
                    <div className="job-card">
                      <h4>Product Manager</h4>
                      <p>Lead the development of new features from conception to launch, working closely with our design and engineering teams.</p>
                      <span className="job-location">Remote (Worldwide)</span>
                    </div>
                  </div>
                  
                  <p className="careers-cta">Don't see a role that fits your skills? We're always looking for talented individuals. Send your resume to <a href="mailto:careers@finovators.com">careers@finovators.com</a>.</p>
                </div>
              </div>
            )}
            
            {/* Press Modal */}
            {showModal === 'press' && (
              <div className="modal-body">
                <h2>Press & Media</h2>
                <div className="press-section">
                  <h3>Media Inquiries</h3>
                  <p>For press inquiries or interview requests, please contact our media relations team at <a href="mailto:press@finovators.com">press@finovators.com</a>.</p>
                  
                  <h3>Press Releases</h3>
                  <div className="press-releases">
                    <div className="press-item">
                      <h4>Finovators Launches AI-Powered Savings Feature</h4>
                      <p className="press-date">March 15, 2025</p>
                      <p>Finovators today announced the launch of its new AI-powered savings feature, which helps users automatically optimize their savings based on spending patterns and financial goals.</p>
                    </div>
                    
                    <div className="press-item">
                      <h4>Finovators Secures $12M in Series A Funding</h4>
                      <p className="press-date">January 10, 2025</p>
                      <p>Finovators, the innovative personal finance platform, has secured $12 million in Series A funding led by Benchmark Capital with participation from several angel investors.</p>
                    </div>
                    
                    <div className="press-item">
                      <h4>Finovators Reaches 500,000 User Milestone</h4>
                      <p className="press-date">November 22, 2024</p>
                      <p>Finovators today announced that it has reached 500,000 active users, representing 200% growth year-over-year.</p>
                    </div>
                  </div>
                  
                  <h3>In The News</h3>
                  <div className="news-mentions">
                    <div className="news-item">
                      <h4>"The Future of Personal Finance"</h4>
                      <p className="news-source">Financial Times, February 2025</p>
                    </div>
                    
                    <div className="news-item">
                      <h4>"10 Fintech Startups to Watch in 2025"</h4>
                      <p className="news-source">TechCrunch, January 2025</p>
                    </div>
                    
                    <div className="news-item">
                      <h4>"How Finovators is Making Budgeting Accessible to Everyone"</h4>
                      <p className="news-source">Forbes, December 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* FAQs Modal */}
            {showModal === 'faqs' && (
              <div className="modal-body">
                <h2>Frequently Asked Questions</h2>
                <div className="accordion">
                  <div className={`accordion-item ${activeAccordion === 0 ? 'active' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleAccordion(0)}>
                      <h3>How do I reset my password?</h3>
                      <span className="accordion-icon">{activeAccordion === 0 ? '−' : '+'}</span>
                    </div>
                    <div className="accordion-content">
                      <p>To reset your password, click on the "Forgot Password" link on the login page. Enter the email address associated with your account, and we'll send you instructions to create a new password. For security reasons, the reset link expires after 24 hours.</p>
                    </div>
                  </div>
                  
                  <div className={`accordion-item ${activeAccordion === 1 ? 'active' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleAccordion(1)}>
                      <h3>How do I add a new transaction?</h3>
                      <span className="accordion-icon">{activeAccordion === 1 ? '−' : '+'}</span>
                    </div>
                    <div className="accordion-content">
                      <p>To add a new transaction, navigate to the Transactions page by clicking "Transactions" in the main navigation. Then click the "+ Add Transaction" button in the top right corner. Fill in the transaction details including amount, category, date, and description, then click "Save." Your new transaction will appear in your transaction list and be reflected in your dashboard analytics.</p>
                    </div>
                  </div>
                  
<div className={`accordion-item ${activeAccordion === 2 ? 'active' : ''}`}>
  <div className="accordion-header" onClick={() => toggleAccordion(2)}>
    <h3>How can I categorize my expenses?</h3>
    <span className="accordion-icon">{activeAccordion === 2 ? '−' : '+'}</span>
  </div>
  <div className="accordion-content">
    <p>
      Finovators offers two ways to categorize expenses. You can either select from our default categories when adding a transaction (Housing, Food, Transportation, etc.), or create custom categories by going to Settings &gt; Categories &gt; Add New. Our AI system also learns from your transactions and can automatically categorize similar expenses in the future.
    </p>
  </div>
</div>

                  
                  <div className={`accordion-item ${activeAccordion === 3 ? 'active' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleAccordion(3)}>
                      <h3>Can I export my financial data?</h3>
                      <span className="accordion-icon">{activeAccordion === 3 ? '−' : '+'}</span>
                    </div>
                    <div className="accordion-content">
                      <p>Yes, you can export your financial data in CSV or PDF format. Go to your Dashboard and click on the "Export" button in the top right corner. Select your preferred format and date range, and the file will be generated for download. This is useful for tax preparation or if you want to analyze your data in another program.</p>
                    </div>
                  </div>
                  
                  <div className={`accordion-item ${activeAccordion === 4 ? 'active' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleAccordion(4)}>
                      <h3>How secure is my financial information?</h3>
                      <span className="accordion-icon">{activeAccordion === 4 ? '−' : '+'}</span>
                    </div>
                    <div className="accordion-content">
                      <p>Your security is our top priority. We use bank-level 256-bit encryption for all data transmission and storage. Our platform is SOC 2 Type II certified, and we regularly undergo security audits. We never store your bank credentials directly; instead, we use secure token-based access through trusted financial API providers. Additionally, we offer two-factor authentication as an extra layer of protection for your account.</p>
                    </div>
                  </div>
                  
                  <div className={`accordion-item ${activeAccordion === 5 ? 'active' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleAccordion(5)}>
                      <h3>Is Finovators available on mobile devices?</h3>
                      <span className="accordion-icon">{activeAccordion === 5 ? '−' : '+'}</span>
                    </div>
                    <div className="accordion-content">
                      <p>Yes, Finovators is available as a mobile app for both iOS and Android devices. You can download the app from the Apple App Store or Google Play Store. Our mobile app offers the same features as the web version, with the added convenience of on-the-go access and the ability to capture receipts with your phone's camera.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Help Center Modal */}
            {showModal === 'help' && (
              <div className="modal-body">
                <h2>Help Center</h2>
                <div className="help-section">
                  <h3>Getting Started</h3>
                  <div className="help-topics">
                    <div className="help-topic">
                      <h4>Creating Your Account</h4>
                      <p>Learn how to sign up, set up your profile, and customize your dashboard preferences.</p>
                      <button className="help-link">Read Guide</button>
                    </div>
                    
                    <div className="help-topic">
                      <h4>Connecting Your Accounts</h4>
                      <p>Step-by-step instructions for securely linking your bank accounts, credit cards, and investments.</p>
                      <button className="help-link">Read Guide</button>
                    </div>
                    
                    <div className="help-topic">
                      <h4>Setting Up Your Budget</h4>
                      <p>How to create personalized budget categories and set spending limits that work for you.</p>
                      <button className="help-link">Read Guide</button>
                    </div>
                  </div>
                  
                  <h3>Using Finovators</h3>
                  <div className="help-topics">
                    <div className="help-topic">
                      <h4>Tracking Expenses</h4>
                      <p>Everything you need to know about recording, categorizing, and managing your expenses.</p>
                      <button className="help-link">Read Guide</button>
                    </div>
                    
                    <div className="help-topic">
                      <h4>Managing Recurring Payments</h4>
                      <p>How to set up, edit, and track your recurring bills and subscriptions.</p>
                      <button className="help-link">Read Guide</button>
                    </div>
                    
                    <div className="help-topic">
                      <h4>Setting Financial Goals</h4>
                      <p>Learn to create, track, and achieve your savings goals and debt reduction targets.</p>
                      <button className="help-link">Read Guide</button>
                    </div>
                  </div>
                  
                  <h3>Troubleshooting</h3>
                  <div className="help-topics">
                    <div className="help-topic">
                      <h4>Account Sync Issues</h4>
                      <p>Solutions for common problems with connecting or updating your financial accounts.</p>
                      <button className="help-link">Read Guide</button>
                    </div>
                    
                    <div className="help-topic">
                      <h4>Missing or Duplicate Transactions</h4>
                      <p>How to identify and fix issues with transaction data.</p>
                      <button className="help-link">Read Guide</button>
                    </div>
                    
                    <div className="help-topic">
                      <h4>Login Problems</h4>
                      <p>Steps to resolve password issues, account access, and two-factor authentication.</p>
                      <button className="help-link">Read Guide</button>
                    </div>
                  </div>
                  
                  <div className="help-cta">
                    <p>Still need help? Our support team is available 24/7.</p>
                    <button className="contact-support-btn">Contact Support</button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Contact Modal */}
            {showModal === 'contact' && (
              <div className="modal-body">
                <h2>Contact Us</h2>
                <div className="contact-section">
                  <div className="contact-options">
                    <div className="contact-option">
                      <div className="contact-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                      </div>
                      <h3>Email Support</h3>
                      <p>For general inquiries and account support:</p>
                      <a href="mailto:support@finovators.com" className="contact-link">support@finovators.com</a>
                    </div>
                    
                    <div className="contact-option">
                      <div className="contact-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                      </div>
                      <h3>Live Chat</h3>
                      <p>Chat with our support team in real-time:</p>
                      <button className="start-chat-btn">Start Chat</button>
                      <p className="support-hours">Available Monday-Friday, 9am-9pm EST</p>
                    </div>
                    
                    <div className="contact-option">
                      <div className="contact-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </div>
                      <h3>Phone Support</h3>
                      <p>For urgent issues or complex questions:</p>
                      <a href="tel:+18001234567" className="contact-link">+1 (800) 123-4567</a>
<p className="support-hours">Available 24/7 for urgent issues</p>
                    </div>
                  </div>
                  
                  <form className="contact-form">
                    <h3>Send us a message</h3>
                    <div className="form-group">
                      <label htmlFor="name">Name</label>
                      <input type="text" id="name" placeholder="Your name" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input type="email" id="email" placeholder="Your email address" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="subject">Subject</label>
                      <select id="subject">
                        <option value="">Select a subject</option>
                        <option value="support">Technical Support</option>
                        <option value="feedback">Feedback</option>
                        <option value="billing">Billing Inquiry</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="message">Message</label>
                      <textarea id="message" rows={4} placeholder="How can we help you?"></textarea>
                    </div>
                    <button type="submit" className="submit-btn">Send Message</button>
                  </form>
                </div>
              </div>
            )}
            
            {/* Privacy Policy Modal */}
            {showModal === 'privacy' && (
              <div className="modal-body">
                <h2>Privacy Policy</h2>
                <p className="modal-date">Last updated: March 22, 2025</p>
                
                <div className="policy-section">
                  <h3>Introduction</h3>
                  <p>At Finovators, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our financial management platform. Please read this policy carefully to understand our practices regarding your personal data.</p>
                </div>
                
                <div className="policy-section">
                  <h3>Information We Collect</h3>
                  <p>We collect several types of information from and about users of our platform:</p>
                  <ul className="policy-list">
                    <li><strong>Personal Information:</strong> This includes identifiers such as your name, email address, phone number, and postal address.</li>
                    <li><strong>Financial Information:</strong> When you connect your financial accounts, we collect transaction data, account balances, and other financial information needed to provide our services.</li>
                    <li><strong>Usage Data:</strong> We collect information about how you interact with our platform, including features used, time spent, and actions taken.</li>
                    <li><strong>Device Information:</strong> This includes your IP address, browser type, operating system, and other technical details.</li>
                  </ul>
                </div>
                
                <div className="policy-section">
                  <h3>How We Use Your Information</h3>
                  <p>We use the information we collect to:</p>
                  <ul className="policy-list">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and manage your accounts</li>
                    <li>Generate personalized financial insights and recommendations</li>
                    <li>Communicate with you about your account, updates, and new features</li>
                    <li>Respond to your inquiries and support requests</li>
                    <li>Protect against fraudulent or unauthorized activity</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </div>
                
                <div className="policy-section">
                  <h3>Information Sharing</h3>
                  <p>We do not sell your personal information. We may share certain information with:</p>
                  <ul className="policy-list">
                    <li><strong>Service Providers:</strong> Third-party vendors who help us operate our platform and provide services</li>
                    <li><strong>Financial Partners:</strong> Financial institutions necessary to connect your accounts and process transactions</li>
                    <li><strong>Legal Authorities:</strong> When required by law or to protect our rights and the safety of our users</li>
                  </ul>
                </div>
                
                <div className="policy-section">
                  <h3>Data Security</h3>
                  <p>We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. Our security practices include:</p>
                  <ul className="policy-list">
                    <li>256-bit encryption for data transmission and storage</li>
                    <li>Regular security audits and vulnerability testing</li>
                    <li>Employee access controls and security training</li>
                    <li>Physical and electronic safeguards for our systems</li>
                  </ul>
                </div>
                
                <div className="policy-section">
                  <h3>Your Privacy Rights</h3>
                  <p>Depending on your location, you may have rights regarding your personal information, including:</p>
                  <ul className="policy-list">
                    <li>Accessing and reviewing your information</li>
                    <li>Correcting inaccurate information</li>
                    <li>Deleting your information</li>
                    <li>Restricting or objecting to certain processing activities</li>
                    <li>Requesting portability of your information</li>
                  </ul>
                  <p>To exercise these rights, please contact us at <a href="mailto:privacy@finovators.com">privacy@finovators.com</a>.</p>
                </div>
              </div>
            )}
            
            {/* Terms of Service Modal */}
            {showModal === 'terms' && (
              <div className="modal-body">
                <h2>Terms of Service</h2>
                <p className="modal-date">Last updated: March 22, 2025</p>
                
                <div className="policy-section">
                  <h3>Acceptance of Terms</h3>
                  <p>By accessing or using Finovators, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
                </div>
                
                <div className="policy-section">
                  <h3>Description of Services</h3>
                  <p>Finovators provides a personal financial management platform that allows users to track expenses, create budgets, set financial goals, and gain insights into their financial habits. Our services may include:</p>
                  <ul className="policy-list">
                    <li>Connecting to financial accounts to import transaction data</li>
                    <li>Categorizing and analyzing spending patterns</li>
                    <li>Creating personalized budgets and savings goals</li>
                    <li>Generating financial insights and recommendations</li>
                    <li>Visualizing financial data through charts and reports</li>
                  </ul>
                </div>
                
                <div className="policy-section">
                  <h3>Account Registration</h3>
                  <p>To use our services, you must create an account. You agree to provide accurate and complete information during registration and to keep your credentials secure. You are responsible for all activities that occur under your account.</p>
                </div>
                
                <div className="policy-section">
                  <h3>User Responsibilities</h3>
                  <p>As a user of Finovators, you agree to:</p>
                  <ul className="policy-list">
                    <li>Use our services for lawful purposes only</li>
                    <li>Provide accurate information about your finances</li>
                    <li>Maintain the confidentiality of your account credentials</li>
                    <li>Not attempt to gain unauthorized access to any part of our platform</li>
                    <li>Not use the platform to engage in fraudulent or deceptive activities</li>
                    <li>Not interfere with the proper operation of our services</li>
                  </ul>
                </div>
                
                <div className="policy-section">
                  <h3>Intellectual Property</h3>
                  <p>All content, features, and functionality of the Finovators platform, including text, graphics, logos, icons, and software, are the exclusive property of Finovators or its licensors and are protected by copyright, trademark, and other intellectual property laws.</p>
                </div>
                
                <div className="policy-section">
                  <h3>Limitation of Liability</h3>
                  <p>To the maximum extent permitted by law, Finovators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of our services. Finovators is not responsible for the accuracy of financial information provided by third-party financial institutions.</p>
                </div>
                
                <div className="policy-section">
                  <h3>Modifications to the Service</h3>
                  <p>We reserve the right to modify, suspend, or discontinue any part of our services at any time without notice. We may also update these Terms of Service periodically. Continued use of the platform after changes constitutes acceptance of the modified terms.</p>
                </div>
              </div>
            )}
            
            {/* Legal & Compliance Modal */}
            {showModal === 'legal' && (
              <div className="modal-body">
                <h2>Legal & Compliance</h2>
                <div className="policy-section">
                  <h3>Regulatory Compliance</h3>
                  <p>Finovators is committed to complying with all applicable laws and regulations. Our platform adheres to the following regulatory frameworks:</p>
                  <ul className="legal-list">
                    <li><strong>General Data Protection Regulation (GDPR):</strong> We comply with GDPR requirements for users in the European Economic Area, providing rights to access, correct, and delete personal data.</li>
                    <li><strong>California Consumer Privacy Act (CCPA):</strong> For California residents, we honor rights regarding personal information as specified by the CCPA.</li>
                    <li><strong>Financial Industry Regulatory Authority (FINRA):</strong> While not directly regulated by FINRA, we follow industry best practices for financial data handling.</li>
                    <li><strong>Electronic Fund Transfer Act (EFTA):</strong> We comply with regulations concerning electronic money transfers and related consumer protections.</li>
                  </ul>
                </div>
                
                <div className="policy-section">
                  <h3>Security Standards</h3>
                  <p>We maintain the highest industry-standard security protocols:</p>
                  <ul className="legal-list">
                    <li><strong>SOC 2 Type II Certification:</strong> We undergo regular audits to ensure our systems meet stringent security, availability, and confidentiality standards.</li>
                    <li><strong>PCI DSS Compliance:</strong> For any payment-related functions, we adhere to Payment Card Industry Data Security Standards.</li>
                    <li><strong>AES-256 Encryption:</strong> All sensitive data is protected using advanced encryption standards both in transit and at rest.</li>
                    <li><strong>Multi-Factor Authentication:</strong> Additional security layers are available to protect account access.</li>
                  </ul>
                </div>
                
                <div className="policy-section">
                  <h3>Disclaimer</h3>
                  <p>Finovators is a financial management tool designed to help you track and analyze your personal finances. Important disclaimers:</p>
                  <ul className="legal-list">
                    <li>We are not a financial institution, investment advisor, or credit counselor.</li>
                    <li>Our platform does not provide financial, investment, or tax advice.</li>
                    <li>Insights and recommendations are generated based on your data and general financial principles, not personalized professional advice.</li>
                    <li>You should consult with qualified financial professionals before making significant financial decisions.</li>
                    <li>While we strive for accuracy, we cannot guarantee that all information is error-free.</li>
                  </ul>
                </div>
                
                <div className="policy-section">
                  <h3>Third-Party Services</h3>
                  <p>Our platform integrates with various third-party services, including financial institutions. These entities have their own terms of service and privacy policies that govern the data shared with them.</p>
                  <p>When you connect your financial accounts, you are authorizing Finovators to access your account information in accordance with the terms of our service and the respective financial institution&apos;s policies.</p>
                </div>
                
                <div className="policy-section">
                  <h3>Intellectual Property</h3>
                  <p>All intellectual property rights related to the Finovators platform, including software, design, text, graphics, logos, and other content, are owned by Finovators or its licensors. Unauthorized use, reproduction, or distribution of our intellectual property is prohibited.</p>
                </div>
                
                <div className="policy-section">
                  <h3>Contact Information</h3>
                  <p>For legal inquiries or compliance questions, please contact our legal department at <a href="mailto:legal@finovators.com">legal@finovators.com</a>.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;