import React, { useState } from 'react';
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

const Dashboard: React.FC = () => {
  // Modal states
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Handle closing all modals
  const closeAllModals = () => {
    setShowTransactionModal(false);
    setShowBudgetModal(false);
    setShowGoalModal(false);
  };

  // Example form submission handlers
  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Get form data
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const transactionData = {
      type: formData.get('type'),
      amount: formData.get('amount'),
      category: formData.get('category'),
      date: formData.get('date'),
      notes: formData.get('notes')
    };
    
    // Here you would send data to your backend
    console.log('Transaction data submitted:', transactionData);
    
    // Show success message and close modal
    alert('Transaction added successfully!');
    setShowTransactionModal(false);
  };

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const budgetData = {
      category: formData.get('category'),
      amount: formData.get('amount'),
      period: formData.get('period')
    };
    
    console.log('Budget data submitted:', budgetData);
    alert('Budget set successfully!');
    setShowBudgetModal(false);
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const goalData = {
      name: formData.get('name'),
      targetAmount: formData.get('targetAmount'),
      targetDate: formData.get('targetDate'),
      description: formData.get('description')
    };
    
    console.log('Goal data submitted:', goalData);
    alert('Goal added successfully!');
    setShowGoalModal(false);
  };

  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        <div className="greeting-section">
          <div>
            <h1>Hello, <span className="rainbow-name">Alex</span>!</h1>
            <div className="greeting-date">Saturday, March 22, 2025</div>
          </div>
          
          <div className="quick-actions">
            <div className="action-button" onClick={() => setShowTransactionModal(true)}>
              <div className="action-icon">
                💰
              </div>
              <div className="action-text">Add Transaction</div>
            </div>
            <div className="action-button" onClick={() => setShowBudgetModal(true)}>
              <div className="action-icon">
                📊
              </div>
              <div className="action-text">Set Budget</div>
            </div>
            <div className="action-button" onClick={() => setShowGoalModal(true)}>
              <div className="action-icon">
                🎯
              </div>
              <div className="action-text">Add Goal</div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-section">
          <div className="left-column">
            <TotalBalance />
            <SpendingProgress />
          </div>
          <div className="right-column">
            <MonthlyChart />
          </div>
        </div>
        
        <div className="analytics-section">
          <div className="left-column">
            <IncomeExpenseChart />
          </div>
          <div className="right-column">
            <div className="insights-container">
              <SmartInsights />
              <SavingsProgress />
              <RecurringPayments />
              <ExpenseAlerts />
            </div>
          </div>
        </div>
        
        {/* Transaction Modal */}
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
        
        {/* Budget Modal */}
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
        
        {/* Goal Modal */}
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
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;