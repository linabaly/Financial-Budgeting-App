// src/components/RecurringPayments.tsx
import React from 'react';
import { RecurringPayment } from '../types';

const recurringPayments: RecurringPayment[] = [
  { service: "Netflix", amount: "$15.99", dueDate: "due on 25th" },
  { service: "Car Insurance", amount: "$129", dueDate: "due on 1st" }
];

const RecurringPayments: React.FC = () => {
  return (
    <div className="recurring-payments">
      <div className="section-header">Recurring Payments Reminder</div>
      <div className="payments-list">
        {recurringPayments.map((payment, index) => (
          <div className="payment-item" key={index}>
            <div className="payment-icon">{payment.service === "Netflix" ? "▶" : "🚗"}</div>
            <div className="payment-service">{payment.service}</div>
            <div className="payment-details">
              <div className="payment-amount">{payment.amount}</div>
              <div className="payment-date">{payment.dueDate}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecurringPayments;