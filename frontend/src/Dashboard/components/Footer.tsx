import React, { useState } from 'react';
import './Footer.css';

/**
 * Footer Component
 * 
 * This component renders the site footer which includes:
 * - Newsletter signup form
 * - Branding and navigation links
 * - Content modals (About, FAQs, Privacy, Legal)
 * - Contact information and social media links
 */
const Footer: React.FC = () => {
  // ===== STATE MANAGEMENT =====
  
  /**
   * Track which modal is currently open ('about', 'faqs', 'privacy', 'legal')
   * null means no modal is open
   */
  const [showModal, setShowModal] = useState<string | null>(null);
  
  /**
   * Track the email input for the newsletter subscription form
   */
  const [emailInput, setEmailInput] = useState('');
  
  /**
   * Track whether the user has successfully subscribed to the newsletter
   * Controls display of success message
   */
  const [subscribed, setSubscribed] = useState(false);
  
  /**
   * Track which accordion item is expanded in the FAQs modal
   * null means no item is expanded
   */
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  // ===== EVENT HANDLERS =====
  
  /**
   * Opens a specific modal and resets the accordion state
   * @param modalType - Type of modal to open ('about', 'faqs', 'privacy', 'legal')
   */
  const openModal = (modalType: string) => {
    setShowModal(modalType);
    setActiveAccordion(null); // Reset accordion state when opening a new modal
  };

  /**
   * Closes any open modal
   */
  const closeModal = () => {
    setShowModal(null);
  };
  
  /**
   * Handles newsletter subscription form submission
   * Validates email format and shows a temporary success message
   * @param e - Form submission event
   */
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic email validation (contains @ and .)
    if (emailInput.includes('@') && emailInput.includes('.')) {
      setSubscribed(true);
      setEmailInput('');
      // Reset success message after 3 seconds
      setTimeout(() => setSubscribed(false), 3000);
    }
  };
  
  /**
   * Toggles expansion of an accordion item in the FAQs modal
   * If the clicked item is already active, it closes it
   * @param index - Index of the accordion item to toggle
   */
  const toggleAccordion = (index: number) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  return (
    <>
      {/* ===== MODAL SECTION ===== */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            
            {/* About Us Modal */}
            {showModal === 'about' && (
              <div className="modal-body">
                <h2>About Finovators</h2>
                <div className="about-section">
                  <h3>Our Mission</h3>
                  <p>
                    We believe financial health shouldn't be overwhelming. Our mission is to empower college students with clear,
                    accessible tools to manage their money, track their habits, and build a stable financial future—one transaction at a time.
                  </p>
                  
                  <h3>Our Story</h3>
                  <p>
                    This project was born out of shared frustration. As students juggling tuition, rent, and the reality of limited income,
                    we recognized the lack of simple yet effective budgeting tools designed for people like us. That's why Lina Baly,
                    Jacob Darroch, Matthew Ray, and Yana Yerokhina teamed up to create a smarter way to manage student finances.
                  </p>
                  <p>
                    Backed by our coursework in CMS 484 and inspired by our lived experiences, we developed a budgeting app that's
                    as intuitive as it is powerful—built by students, for students.
                  </p>

                  <h3>Our Approach</h3>
                  <p>
                    We take a student-centered approach. With a clean interface, real-time progress bars, and category-based visuals,
                    our app transforms budgeting from a chore into a habit. We incorporate the 50/30/20 rule and deliver insights through
                    a dashboard that makes financial trends easy to understand at a glance.
                  </p>
                  <p>
                    Through goal tracking and personalized suggestions, we help students stay on track—without requiring a degree in finance.
                  </p>
                  
                  <h3>Our Values</h3>
                  <ul className="values-list">
                    <li><strong>Simplicity:</strong> A streamlined design for real-life student use—no fluff, just function.</li>
                    <li><strong>Security:</strong> We use bank-level encryption (Argon2id, JWT, and AES-256) to protect your data and privacy.</li>
                    <li><strong>Responsibility:</strong> Our suggestions foster smart habits and financial self-awareness.</li>
                    <li><strong>Inclusivity:</strong> Whether you rely on aid, scholarships, or part-time work, this app meets you where you are.</li>
                    <li><strong>Innovation:</strong> With future goals like AI-powered suggestions and mobile access, we're always evolving.</li>
                  </ul>
                  
                  <h3>Our Vison</h3>
                  <p>We're not just building a budgeting app—we're creating a foundation for lifelong financial wellness. From students navigating their first rent payment to young professionals managing their first paycheck, our platform aims to grow alongside its users and their goals.</p>
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
                      <h3>How do I get started with Finovators?</h3>
                      <span className="accordion-icon">{activeAccordion === 0 ? '−' : '+'}</span>
                    </div>
                    <div className="accordion-content">
                      <p>Getting started with Finovators is simple. Visit our website. Create an account using your email address, then start inputting your transactions. Once inputted, Finovators will automatically categorize your transactions and begin generating personalized insights.</p>
                    </div>
                  </div>
                  
                  <div className={`accordion-item ${activeAccordion === 1 ? 'active' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleAccordion(1)}>
                      <h3>How secure is my financial information?</h3>
                      <span className="accordion-icon">{activeAccordion === 1 ? '−' : '+'}</span>
                    </div>
                    <div className="accordion-content">
                      <p>We take your data privacy and security seriously. Our platform uses bank-level security protocols to protect your financial information. This includes Argon2id password hashing, AES-256 encryption for sensitive data, and JWT-based authentication to ensure secure access. We never store your plain-text passwords or share your data with third parties. Your information stays private, encrypted, and protected—so you can focus on budgeting without worrying about your data being compromised.</p>
                    </div>
                  </div>
                  
                  <div className={`accordion-item ${activeAccordion === 3 ? 'active' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleAccordion(3)}>
                      <h3>Can I create custom categories for my expenses?</h3>
                      <span className="accordion-icon">{activeAccordion === 3 ? '−' : '+'}</span>
                     </div>
                    <div className="accordion-content">
                    <p>Yes, Finovators offers complete customization of your expense categories. While we provide a comprehensive set of default categories (Housing, Food, Transportation, Entertainment, etc.), you can easily create custom categories that better reflect your personal or business spending patterns. To create a custom category, go to Settings &gt; Categories &gt; Add New. You can name your category, assign it a color and icon, and even set up rules for automatic categorization based on transaction descriptions, vendors, or amounts. You can also create nested subcategories for more detailed tracking (e.g., Entertainment &gt; Streaming Services &gt; Netflix). The platform allows for unlimited custom categories, and all your historical transactions can be recategorized with just a few clicks.</p>
                  </div>
                </div>
                  
                  <div className={`accordion-item ${activeAccordion === 4 ? 'active' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleAccordion(4)}>
                      <h3>How are my subscription services tracked?</h3>
                      <span className="accordion-icon">{activeAccordion === 4 ? '−' : '+'}</span>
                    </div>
                    <div className="accordion-content">
                      <p>Our Subscription Tracker automatically identifies recurring payments across all your connected accounts. Using advanced pattern recognition, it detects subscription services even when they charge variable amounts or on irregular schedules. In the Subscriptions dashboard, you'll see a comprehensive view of all your subscriptions, including monthly cost, total annual expenditure, usage trends, and smart recommendations for potential savings. You'll receive timely alerts before renewal dates, notifications about price increases, and suggestions for similar services at better rates. The system can also detect potentially forgotten or unused subscriptions based on your engagement patterns and spending history, helping you eliminate waste without sacrificing the services you value.</p>
                    </div>
                  </div>
                  
                  <div className={`accordion-item ${activeAccordion === 5 ? 'active' : ''}`}>
                    <div className="accordion-header" onClick={() => toggleAccordion(5)}>
                      <h3>What kind of reports and insights can I expect?</h3>
                      <span className="accordion-icon">{activeAccordion === 5 ? '−' : '+'}</span>
                    </div>
                    <div className="accordion-content">
                      <p>Finovators provides a rich array of reports and AI-powered insights. Our standard reports include monthly spending breakdowns, income vs. expenses, savings rate tracking, net worth calculations, and investment performance analysis. Beyond these basics, our AI engine delivers personalized insights tailored to your financial situation and goals. These might include cash flow predictions, spending anomaly detection, proactive budget adjustment recommendations, potential tax saving opportunities, and debt reduction strategies. Premium subscribers receive additional advanced reports such as retirement readiness projections, what-if scenario modeling, and comprehensive tax planning tools. All reports can be customized, saved as favorites, scheduled for regular delivery to your email, and exported in multiple formats for your records or for sharing with financial advisors.</p>
                    </div>
                  </div>
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
                  <p>At Finovators, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our financial management platform. Please read this policy carefully to understand our practices regarding your personal data and how we will treat it.</p>
                </div>
                
                <div className="policy-section">
                  <h3>Information We Collect</h3>
                  <p>We collect several types of information from and about users of our platform:</p>
                  <ul className="policy-list">
                    <li><strong>Personal Information:</strong> This includes identifiers such as your name, email address, phone number, date of birth, and postal address. We collect this information during account creation and when you update your profile.</li>
                    <li><strong>Financial Information:</strong> When you connect your financial accounts, we collect transaction data, account balances, account numbers, and other financial information needed to provide our services. This may include your income sources, spending patterns, assets, liabilities, and investment holdings.</li>
                    <li><strong>Usage Data:</strong> We collect information about how you interact with our platform, including features used, time spent on various pages, frequency of use, click patterns, preferences settings, and actions taken within the application.</li>
                    <li><strong>Device Information:</strong> This includes your IP address, browser type, operating system, device identifiers, mobile network information, and other technical details about the devices you use to access our service.</li>
                    <li><strong>Location Data:</strong> With your permission, we may collect precise or approximate location data from your mobile device to provide location-based services such as finding nearby ATMs or bank branches.</li>
                    <li><strong>Communications:</strong> If you contact our support team, we retain those communications to help solve your issues and improve our services.</li>
                  </ul>
                </div>
                
                <div className="policy-section">
                  <h3>How We Use Your Information</h3>
                  <p>We use the information we collect to:</p>
                  <ul className="policy-list">
                    <li>Provide, maintain, and improve our services, including to develop new features and functionality</li>
                    <li>Process transactions and manage your accounts, including synchronizing your financial data with third-party financial institutions</li>
                    <li>Generate personalized financial insights, recommendations, and alerts based on your financial behavior and goals</li>
                    <li>Communicate with you about your account, updates, security alerts, and new features</li>
                    <li>Respond to your inquiries, support requests, feedback, and questions</li>
                    <li>Protect against fraudulent, unauthorized, or illegal activity on our platform</li>
                    <li>Analyze usage patterns to improve user experience and optimize our service performance</li>
                    <li>Comply with legal obligations, including responding to lawful requests from public authorities</li>
                  </ul>
                </div>
                
                <div className="policy-section">
                  <h3>Information Sharing</h3>
                  <p>We do not sell your personal information. We may share certain information with:</p>
                  <ul className="policy-list">
                    <li><strong>Service Providers:</strong> Third-party vendors who help us operate our platform and provide services to you. These providers are contractually obligated to use your information only for providing services to us and in accordance with this Privacy Policy.</li>
                    <li><strong>Financial Partners:</strong> Financial institutions and data aggregators necessary to connect your accounts and process transactions. These partners only receive the information needed to provide their specific service.</li>
                    <li><strong>With Your Consent:</strong> We may share information with third parties when you explicitly consent to such sharing, such as when you choose to share financial reports with a financial advisor.</li>
                    <li><strong>Legal Requirements:</strong> When required by law, legal process, litigation, or governmental authorities. We may also disclose information about you if we determine that disclosure is necessary to protect the rights, property, or safety of our users or others.</li>
                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, reorganization, sale of assets, or bankruptcy, your information may be transferred or sold as part of that transaction, but only to the extent permitted by law.</li>
                  </ul>
                </div>
                
                <div className="policy-section">
                  <h3>Data Security</h3>
                  <p>We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. Our security practices include:</p>
                  <ul className="policy-list">
                    <li>256-bit encryption for data transmission and storage, the same level used by major financial institutions</li>
                    <li>Regular security audits, vulnerability testing, and penetration testing by independent security experts</li>
                    <li>Employee access controls, background checks, and comprehensive security training</li>
                    <li>Multi-factor authentication and biometric verification options for account access</li>
                    <li>Physical, electronic, and procedural safeguards for our systems and facilities</li>
                    <li>Continuous monitoring for suspicious activities and automated threat detection</li>
                  </ul>
                  <p>While we implement these safeguards, no system is 100% secure. We encourage you to take steps to protect your account, such as using strong passwords and enabling two-factor authentication.</p>
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
                    <li>Withdrawing consent when processing is based on consent</li>
                    <li>Opting out of certain data sharing practices</li>
                  </ul>
                  <p>To exercise these rights, please contact us at <a href="mailto:privacy@finovators.com">privacy@finovators.com</a> or visit the Privacy Settings section in your account. We will respond to all legitimate requests within 30 days.</p>
                </div>
                
                <div className="policy-section">
                  <h3>Data Retention</h3>
                  <p>We retain your personal information for as long as your account is active or as needed to provide you services, comply with legal obligations, resolve disputes, and enforce our agreements. If you wish to delete your account, certain information may remain in our records after account deletion as required or permitted by law.</p>
                </div>
                
                <div className="policy-section">
                  <h3>Children's Privacy</h3>
                  <p>Our services are not intended for children under the age of 18, and we do not knowingly collect data from children under 18. If we learn that we have collected personal information from a child under 18, we will take steps to delete that information as quickly as possible.</p>
                </div>
                
                <div className="policy-section">
                  <h3>Changes to This Policy</h3>
                  <p>We may update this Privacy Policy from time to time. If we make material changes, we will notify you through the platform or by email prior to the changes becoming effective. We encourage you to review this Privacy Policy periodically for the latest information on our privacy practices.</p>
                </div>
                
                <div className="policy-section">
                  <h3>Contact Us</h3>
                  <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact our Data Protection Officer at <a href="mailto:privacy@finovators.com">privacy@finovators.com</a> or by mail at Finovators Privacy Office, 100 Financial Plaza, Suite 500, San Francisco, CA 94103.</p>
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
                    <li><strong>General Data Protection Regulation (GDPR):</strong> For users in the European Economic Area, we comply with GDPR requirements governing personal data collection, processing, and storage. This includes providing rights to access, correct, delete, restrict processing of, and port personal data.</li>
                    <li><strong>California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):</strong> For California residents, we honor rights regarding personal information as specified by these laws, including the right to know what personal information is collected, the right to delete personal information, the right to opt-out of the sale of personal information, and the right to non-discrimination for exercising these rights.</li>
                    <li><strong>Financial Industry Regulatory Authority (FINRA):</strong> While not directly regulated by FINRA, we adhere to industry best practices for financial data handling, reporting, and disclosures. Our advisory team includes FINRA-licensed professionals who ensure our platform meets relevant standards.</li>
                    <li><strong>Electronic Fund Transfer Act (EFTA) and Regulation E:</strong> We comply with regulations concerning electronic money transfers, error resolution procedures, and related consumer protections when facilitating connections to financial accounts.</li>
                    <li><strong>Gramm-Leach-Bliley Act (GLBA):</strong> As a financial service provider, we follow GLBA regulations regarding the collection, disclosure, and protection of consumers' nonpublic personal information, including our obligation to notify you about our information-sharing practices.</li>
                    <li><strong>Consumer Financial Protection Bureau (CFPB) Guidelines:</strong> We adhere to CFPB standards for financial data access, consumer disclosures, and ethical practices in the provision of financial services technology.</li>
                    <li><strong>State-Specific Financial Regulations:</strong> We maintain compliance with state-level financial regulations across the United States, including money transmitter laws, data breach notification requirements, and specific data protection regulations.</li>
                  </ul>
                </div>
                
                <div className="policy-section">
                  <h3>Security Standards</h3>
                  <p>We maintain the highest industry-standard security protocols:</p>
                  <ul className="legal-list">
                    <li><strong>SOC 2 Type II Certification:</strong> We undergo regular audits by independent third parties to ensure our systems meet stringent security, availability, processing integrity, confidentiality, and privacy standards.</li>
                    <li><strong>PCI DSS Compliance:</strong> For any payment-related functions, we adhere to Payment Card Industry Data Security Standards, ensuring that cardholder data is processed, stored, and transmitted with maximum security.</li>
                    <li><strong>NIST Cybersecurity Framework:</strong> Our security practices follow the National Institute of Standards and Technology Cybersecurity Framework, implementing comprehensive protection, detection, and response measures.</li>
                    <li><strong>ISO/IEC 27001:2013:</strong> Our information security management system is aligned with this international standard, ensuring systematic management of sensitive company and customer information.</li>
                    <li><strong>AES-256 Encryption:</strong> All sensitive data is protected using Advanced Encryption Standard with 256-bit keys, both in transit and at rest, ensuring your financial information remains secure.</li>
                    <li><strong>Multi-Factor Authentication:</strong> Additional security layers are available and encouraged to protect account access, including biometric verification, one-time passcodes, and hardware security keys.</li>
                    <li><strong>Security Bug Bounty Program:</strong> We collaborate with the security research community through a responsible disclosure program, rewarding identified vulnerabilities to continuously strengthen our security posture.</li>
                  </ul>
                </div>
                
                <div className="policy-section">
                  <h3>Disclaimer</h3>
                  <p>Finovators is a financial management tool designed to help you track and analyze your personal finances. Important disclaimers:</p>
                  <ul className="legal-list">
                    <li>We are not a financial institution, investment advisor, or credit counselor. While our platform provides financial insights and recommendations, these should not be considered as professional financial advice.</li>
                    <li>Our platform does not provide tax, legal, or accounting advice. Any tax-related features are for informational purposes only and should not be relied upon for tax preparation or filing purposes.</li>
                    <li>Insights and recommendations are generated based on your data and general financial principles. They may not account for all aspects of your personal financial situation and should be evaluated against your specific circumstances and goals.</li>
                    <li>Past performance is not indicative of future results. Any investment projections, market analyses, or similar information provided through our platform are for illustrative purposes only.</li>
                    <li>While we strive for accuracy in our data aggregation and analysis, we cannot guarantee that all information is error-free. Financial data from third-party sources should be verified with the original source.</li>
                    <li>You should consult with qualified financial, tax, legal, or accounting professionals before making significant financial decisions or implementing strategies suggested by our platform.</li>
                  </ul>
                </div>
                
                <div className="policy-section">
                  <h3>Third-Party Services</h3>
                  <p>Our platform integrates with various third-party services, including financial institutions, payment processors, and data aggregators. These entities have their own terms of service and privacy policies that govern the data shared with them.</p>
                  <p>When you connect your financial accounts, you are authorizing Finovators to access your account information in accordance with the terms of our service and the respective financial institution's policies. You may need to provide authentication credentials directly to these third parties for account verification purposes.</p>
                  <p>While we carefully select our integration partners and hold them to high security standards, we are not responsible for the privacy practices, content, or policies of these third parties. We encourage you to review the privacy policies and terms of service of any financial institutions or services you connect to our platform.</p>
                </div>
                
                <div className="policy-section">
                  <h3>Intellectual Property</h3>
                  <p>All intellectual property rights related to the Finovators platform, including software, design, text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and other content, are owned by Finovators or its licensors.</p>
                  <p>Our platform and its content are protected by copyright, trademark, trade secret, and other intellectual property laws. Unauthorized use, reproduction, or distribution of our intellectual property is prohibited and may result in civil and criminal penalties.</p>
                  <p>We grant users a limited, non-exclusive, non-transferable, revocable license to use our platform for personal or internal business purposes in accordance with our Terms of Service. This license does not include the right to copy, modify, distribute, sell, lease, or create derivative works of our platform or its content.</p>
                </div>
                
                <div className="policy-section">
                  <h3>Service Availability and Modifications</h3>
                  <p>We strive to ensure that our services are available 24/7, but we do not guarantee uninterrupted access to our platform. Temporary service interruptions may occur due to system maintenance, updates, or factors beyond our control.</p>
                  <p>We reserve the right to modify, suspend, or discontinue any part of our services at any time without notice. This includes the right to impose limits on certain features or restrict access to parts or all of the platform.</p>
                  <p>We may also update our Terms of Service, Privacy Policy, and other legal documents periodically. Continued use of our platform after such changes constitutes acceptance of the modified terms.</p>
                </div>
                
                <div className="policy-section">
                  <h3>Dispute Resolution</h3>
                  <p>In the event of any dispute arising from or relating to our services, we encourage users to first contact our customer support team at <a href="mailto:support@finovators.com">support@finovators.com</a> to seek a resolution.</p>
                  <p>If the matter cannot be resolved directly, depending on the nature of the dispute and your location, resolution may proceed through arbitration, small claims court, or other legal channels as specified in our Terms of Service.</p>
                  <p>Any legal proceedings arising from the use of our services shall be governed by and construed in accordance with the laws of the State of California, without giving effect to any choice of law or conflict of law provisions.</p>
                </div>
                
                <div className="policy-section">
                  <h3>Contact Information</h3>
                  <p>For legal inquiries or compliance questions, please contact our legal department at <a href="mailto:legal@finovators.com">legal@finovators.com</a>.</p>
                  
                  <p>For official notices, correspondence, or legal documents, please send mail to:</p>
                  <address className="legal-address">
                    Finovators Legal Department<br />
                    100 Financial Plaza, Suite 500<br />
                    San Francisco, CA 94103<br />
                    United States
                  </address>
                  
                  <p>Our Compliance Officer can be reached directly at <a href="mailto:compliance@finovators.com">compliance@finovators.com</a> or by phone at +1 (800) 123-4567 ext. 2240 during business hours (Monday-Friday, 9am-5pm PT).</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== FOOTER SECTION ===== */}
      <footer className="footer">
        <div className="footer-container">
          {/* Footer Top: Contains branding, subscription form, and navigation links */}
          <div className="footer-top">
            {/* Branding section */}
            <div className="footer-branding">
              <div className="footer-logo">
                <h1 className="logo-text">Finovators</h1>
                <div className="logo-tagline">Track, Manage, Thrive with us</div>
              </div>
              
              {/* Newsletter signup form or success message */}
              <div className="newsletter-signup">
                {subscribed ? (
                  // Success message shown after subscription
                  <div className="subscribe-success">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>Thank you for subscribing!</span>
                  </div>
                ) : (
                  // Newsletter subscription form
                  <form className="newsletter-form" onSubmit={handleSubscribe}>
                    <input 
                      type="email" 
                      placeholder="Your email address"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      required
                    />
                    <button type="submit" className="subscribe-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  </form>
                )}
              </div>
            </div>
            
            {/* Navigation links that open modals */}
            <div className="footer-nav">
              <button className="footer-link" onClick={() => openModal('about')}>About Us</button>
              <button className="footer-link" onClick={() => openModal('faqs')}>FAQs</button>
              <button className="footer-link" onClick={() => openModal('privacy')}>Privacy Policy</button>
              <button className="footer-link" onClick={() => openModal('legal')}>Legal & Compliance</button>
            </div>
          </div>
          
          {/* Divider between top and bottom sections */}
          <div className="footer-divider"></div>
          
          {/* Footer Bottom: Contains copyright, contact info, and social links */}
          <div className="footer-bottom">
            {/* Copyright notice with current year */}
            <div className="copyright">
              © {new Date().getFullYear()} Finovators. All rights reserved.
            </div>
            
            {/* Contact information with phone and email */}
            <div className="contact-info">
            <div className="contact-item">
  <img
    src="/icons/phone-icon.svg"
    alt="Phone"
    className="contact-icon"
  />
  <a href="tel:+12345678900" className="contact-link">+1 234-567-8900</a>
</div>

<div className="contact-item">
  <img
    src="/icons/mail-icon.svg"
    alt="Email"
    className="contact-icon"
  />
  <a href="mailto:contact@finovators.com" className="contact-link">
    contact@finovators.com
  </a>
</div>

            </div>
            
            {/* Social media links */}
            <div className="social-links">
            <div className="social-links">
            <a
  href="https://twitter.com"
  target="_blank"
  rel="noopener noreferrer"
  className="social-link"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M4.5 3h3.8l4 5.6L16.6 3H21l-6.9 9.5L21 21h-3.9l-4.3-6L8 21H3l7.3-10L4.5 3z"/>
  </svg>
</a>

  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
    <img src="/icons/instagram-icon.svg" alt="Instagram" className="social-icon" />
  </a>
  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
    <img src="/icons/linkedin-icon.svg" alt="LinkedIn" className="social-icon" />
  </a>
</div>

            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;