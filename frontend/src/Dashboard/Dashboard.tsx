import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import Header from './components/Header';
import TotalBalance from './components/TotalBalance';
import SpendingProgress from './components/SpendingProgress';
import MonthlyChart from './components/MonthlyChart';
import IncomeExpenseChart from './components/IncomeExpenseChart';
import SmartInsights from './components/SmartInsights';
import SavingsProgress from './components/SavingsProgress';
import RecurringPayments from './components/RecurringPayments';
import ExpenseAlerts from './components/ExpenseAlerts';
import Footer from './components/Footer';

/**
 * Dashboard Component
 * 
 * Main dashboard page displaying financial summary, charts, insights,
 * and providing modal forms for different financial activities.
 */
const Dashboard: React.FC = () => {
  // ===== STATE MANAGEMENT =====
  
  // Modal visibility states
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  
  // User and account related states
  const [currentDate] = useState(new Date());
  const [currentSavings, setCurrentSavings] = useState(4500);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // ===== DATA FETCHING =====
  
  /**
   * Fetch user's account data from API on component mount
   * Retrieves personal and financial information to populate the dashboard
   */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get authentication token from local storage
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found. Please log in again.");
  
        // Fetch user data from API
        const response = await fetch("http://localhost:5005/account/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });
  
        // Handle error responses
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || "Failed to fetch dashboard data");
        }
  
        // Process and store successful response
        const data = await response.json();
        setDashboardData(data);
      } catch (error: any) {
        setDashboardError(error.message);
      }
    };
  
    fetchDashboardData();
  }, []);
  
  // ===== MODAL HANDLERS =====
  
  /**
   * Close savings modal
   * Used when clicking outside the modal
   */
  const closeSavingsModal = () => {
    setShowSavingsModal(false);
  };

  /**
   * Handle savings update form submission
   * Updates savings amount and submits data to backend (currently mock implementation)
   * 
   * @param e - Form submission event
   */
  const handleSavingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract form data
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Extract and validate amount
    const amount = formData.get('amount');
    const newAmount = amount ? parseFloat(amount.toString()) : 0;
    
    // Create data object for API submission
    const savingsData = {
      amount: newAmount,
      savingsType: formData.get('savingsType'),
      date: formData.get('date'),
      notes: formData.get('notes')
    };
    
    // TODO: Connect to actual API endpoint
    console.log('Savings data submitted:', savingsData);
    
    // Update local state with new amount
    if (newAmount > 0) {
      setCurrentSavings(newAmount);
    }
    
    // Display confirmation and close modal
    alert('Savings updated successfully!');
    setShowSavingsModal(false);
  };

  return (
    <div className="app">
      {/* Main navigation and header */}
      <Header />
      
      <main className="main-content">
        {/* User greeting section with date */}
        <div className="greeting-section">
          <div>
            <h1>Hello, <span className="name">{dashboardData ? dashboardData.name || "User" : "Loading..."}</span>!</h1>
            <div className="greeting-date">
              {currentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
        
        {/* Primary dashboard financial summary */}
        <div className="dashboard-section">
          <div className="left-column">
            <TotalBalance />
            <SpendingProgress />
          </div>
          <div className="right-column">
            <MonthlyChart />
          </div>
        </div>
        
        {/* Analytics and insights section */}
        <div className="analytics-container">
          <div className="analytics-section">
            <div className="income-expense-chart-container">
              <IncomeExpenseChart />
            </div>
            <div className="insights-container">
              <SmartInsights />
              <SavingsProgress 
                currentSavings={currentSavings} 
                onUpdateClick={() => setShowSavingsModal(true)} 
              />
              <RecurringPayments />
              <ExpenseAlerts />
            </div>
          </div>
        </div>
        
        {/* === MODAL COMPONENTS === */}
        
        {/* Savings Modal - For updating savings amount */}
        {showSavingsModal && (
          <div className="modal-overlay" onClick={closeSavingsModal}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header" style={{ textAlign: 'center' }}>
                <h2 style={{ width: '100%' }}>Update Savings</h2>
              </div>
              <div className="modal-content">
                <form className="modal-form" onSubmit={handleSavingsSubmit}>
                  <div className="form-group">
                    <label htmlFor="savings-amount">Savings Amount</label>
                    <input 
                      type="number" 
                      id="savings-amount" 
                      name="amount"
                      placeholder="0.00" 
                      step="0.01"
                      min="0"
                      defaultValue={currentSavings}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="savings-type">Savings Type</label>
                    <select id="savings-type" name="savingsType" required>
                      <option value="emergency">Emergency Fund</option>
                      <option value="retirement">Retirement</option>
                      <option value="vacation">Vacation</option>
                      <option value="education">Education</option>
                      <option value="house">House Down Payment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="savings-date">Date</label>
                    <input 
                      type="date" 
                      id="savings-date" 
                      name="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="savings-notes">Notes</label>
                    <textarea 
                      id="savings-notes" 
                      name="notes"
                      placeholder="Add any additional details about your savings update..."
                    ></textarea>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="submit-btn">
                      Update Savings
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Site footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;