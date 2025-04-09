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
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
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
   * Close all modal windows
   * Used when clicking outside a modal or clicking cancel/close buttons
   */
  const closeAllModals = () => {
    setShowTransactionModal(false);
    setShowBudgetModal(false);
    setShowGoalModal(false);
    setShowSavingsModal(false);
  };

  // ===== FORM SUBMISSION HANDLERS =====
  
  /**
   * Handle new transaction form submission
   * Processes and submits transaction data to backend (currently mock implementation)
   * 
   * @param e - Form submission event
   */
  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract form data
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const transactionData = {
      type: formData.get('type'),
      amount: formData.get('amount'),
      category: formData.get('category'),
      date: formData.get('date'),
      notes: formData.get('notes')
    };
    
    // TODO: Connect to actual API endpoint
    console.log('Transaction data submitted:', transactionData);
    
    // Display confirmation and close modal
    alert('Transaction added successfully!');
    setShowTransactionModal(false);
  };

  /**
   * Handle budget setting form submission
   * Processes and submits budget data to backend (currently mock implementation)
   * 
   * @param e - Form submission event
   */
  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract form data
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const budgetData = {
      category: formData.get('category'),
      amount: formData.get('amount'),
      period: formData.get('period')
    };
    
    // TODO: Connect to actual API endpoint
    console.log('Budget data submitted:', budgetData);
    
    // Display confirmation and close modal
    alert('Budget set successfully!');
    setShowBudgetModal(false);
  };

  /**
   * Handle financial goal form submission
   * Processes and submits financial goal data to backend (currently mock implementation)
   * 
   * @param e - Form submission event
   */
  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract form data
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const goalData = {
      name: formData.get('name'),
      targetAmount: formData.get('targetAmount'),
      targetDate: formData.get('targetDate'),
      description: formData.get('description')
    };
    
    // TODO: Connect to actual API endpoint
    console.log('Goal data submitted:', goalData);
    
    // Display confirmation and close modal
    alert('Goal added successfully!');
    setShowGoalModal(false);
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
        
        {/* Transaction Modal - For adding new transactions */}
        {showTransactionModal && (
          <div className="modal-overlay" onClick={closeAllModals}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add New Transaction</h2>
                <button className="close-button" onClick={closeAllModals}>×</button>
              </div>
              <div className="modal-content">
                <form className="modal-form" onSubmit={handleTransactionSubmit}>
                  <div className="form-group">
                    <label htmlFor="transaction-type">Type</label>
                    <select id="transaction-type" name="type" required>
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                      <option value="transfer">Transfer</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="transaction-amount">Amount</label>
                    <input 
                      type="number" 
                      id="transaction-amount" 
                      name="amount"
                      placeholder="0.00" 
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="transaction-category">Category</label>
                    <select id="transaction-category" name="category" required>
                      <option value="food">Food & Dining</option>
                      <option value="shopping">Shopping</option>
                      <option value="housing">Housing</option>
                      <option value="transportation">Transportation</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="health">Health & Fitness</option>
                      <option value="travel">Travel</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="transaction-date">Date</label>
                    <input 
                      type="date" 
                      id="transaction-date" 
                      name="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="transaction-notes">Notes</label>
                    <textarea 
                      id="transaction-notes" 
                      name="notes"
                      placeholder="Add any additional details..."
                    ></textarea>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={closeAllModals}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      Save Transaction
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Budget Modal - For setting category budgets */}
        {showBudgetModal && (
          <div className="modal-overlay" onClick={closeAllModals}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Set Budget</h2>
                <button className="close-button" onClick={closeAllModals}>×</button>
              </div>
              <div className="modal-content">
                <form className="modal-form" onSubmit={handleBudgetSubmit}>
                  <div className="form-group">
                    <label htmlFor="budget-category">Category</label>
                    <select id="budget-category" name="category" required>
                      <option value="food">Food & Dining</option>
                      <option value="shopping">Shopping</option>
                      <option value="housing">Housing</option>
                      <option value="transportation">Transportation</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="health">Health & Fitness</option>
                      <option value="travel">Travel</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="budget-amount">Budget Amount</label>
                    <input 
                      type="number" 
                      id="budget-amount" 
                      name="amount"
                      placeholder="0.00" 
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="budget-period">Budget Period</label>
                    <select id="budget-period" name="period" required>
                      <option value="monthly">Monthly</option>
                      <option value="weekly">Weekly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={closeAllModals}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      Save Budget
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Goal Modal - For creating financial goals */}
        {showGoalModal && (
          <div className="modal-overlay" onClick={closeAllModals}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Financial Goal</h2>
                <button className="close-button" onClick={closeAllModals}>×</button>
              </div>
              <div className="modal-content">
                <form className="modal-form" onSubmit={handleGoalSubmit}>
                  <div className="form-group">
                    <label htmlFor="goal-name">Goal Name</label>
                    <input 
                      type="text" 
                      id="goal-name" 
                      name="name"
                      placeholder="e.g., Vacation Fund, Emergency Savings" 
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="goal-amount">Target Amount</label>
                    <input 
                      type="number" 
                      id="goal-amount" 
                      name="targetAmount"
                      placeholder="0.00" 
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="goal-date">Target Date</label>
                    <input 
                      type="date" 
                      id="goal-date" 
                      name="targetDate"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="goal-description">Description</label>
                    <textarea 
                      id="goal-description" 
                      name="description"
                      placeholder="Describe your goal..."
                    ></textarea>
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={closeAllModals}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      Save Goal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        
        {/* Savings Modal - For updating savings amount */}
        {showSavingsModal && (
          <div className="modal-overlay" onClick={closeAllModals}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Update Savings</h2>
                <button className="close-button" onClick={closeAllModals}>×</button>
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
                      <option value="emergency" defaultValue="emergency">Emergency Fund</option>
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
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={closeAllModals}
                    >
                      Cancel
                    </button>
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