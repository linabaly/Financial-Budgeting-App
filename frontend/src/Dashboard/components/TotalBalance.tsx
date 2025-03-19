// src/components/TotalBalance.tsx
import React from 'react';

const TotalBalance: React.FC = () => {
  return (
    <div className="total-balance-card">
      <div className="label">Total Balance</div>
      <div className="balance-amount">$7,540.00</div>
      <div className="balance-growth">+8.00%</div>
    </div>
  );
};

export default TotalBalance;