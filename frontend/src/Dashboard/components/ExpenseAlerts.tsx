// src/components/ExpenseAlerts.tsx
import React from 'react';
import { Alert } from '../types';

const alerts: Alert[] = [
  { type: 'danger', message: "You're over budget in Dining Out!" },
  { type: 'warning', message: "Spending is 25% higher this month vs last month." }
];

const ExpenseAlerts: React.FC = () => {
  return (
    <div className="expense-alerts">
      <div className="section-header">Expense Alerts & Warnings</div>
      <div className="alerts-list">
        {alerts.map((alert, index) => (
          <div className={`alert-item ${alert.type}`} key={index}>
            <div className="alert-icon">{alert.type === 'danger' ? "⚠️" : "⚠"}</div>
            <div className="alert-message">{alert.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseAlerts;
