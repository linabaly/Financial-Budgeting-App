import React from 'react';
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
  return (
    <div className="app">
      <Header />
      
      <main className="main-content">
        <div className="greeting-section">
          <h1>Hello, User Name!</h1>
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
        
        <div className="action-buttons">
          <button className="action-button">Log Transactions</button>
          <button className="action-button">See Budget Insights</button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
