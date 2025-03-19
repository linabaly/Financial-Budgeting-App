// src/components/SmartInsights.tsx
import React from 'react';

const SmartInsights: React.FC = () => {
  return (
    <div className="smart-insights">
      <div className="section-header">Smart AI Insights</div>
      <div className="insight-item danger">
        <div className="insight-icon">!</div>
        <div className="insight-text">
          "Your spending on Groceries is 20% higher than usual."
        </div>
      </div>
      <div className="insight-item info">
        <div className="insight-icon">?</div>
        <div className="insight-text">
          "Cut back on Subscriptions to save $56/month."
        </div>
      </div>
    </div>
  );
};

export default SmartInsights;
