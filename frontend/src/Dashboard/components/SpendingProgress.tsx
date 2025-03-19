// src/components/SpendingProgress.tsx
import React from 'react';

const SpendingProgress: React.FC = () => {
  return (
    <div className="spending-progress">
      <div className="label">Spent during this month</div>
      <div className="progress-bar">
        <div className="progress" style={{ width: '30%' }}></div>
      </div>
    </div>
  );
};

export default SpendingProgress;
