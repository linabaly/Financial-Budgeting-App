import React, { useEffect, useRef, useState } from 'react';

interface SpendingProgressProps {
  spent?: number;
  budget?: number;
}

const SpendingProgress: React.FC<SpendingProgressProps> = ({ 
  spent = 450,
  budget = 1500
}) => {
  const [percentage, setPercentage] = useState(0);
  
  useEffect(() => {
    // Calculate percentage spent
    const calculatedPercentage = Math.min(100, Math.round((spent / budget) * 100));
    setPercentage(calculatedPercentage);
  }, [spent, budget]);
  
  // Determine color and icon based on spending percentage
  const getSpendingStatus = () => {
    if (percentage < 50) {
      return { 
        color: '#2ecc71', 
        icon: '👍', 
        text: 'Good spending habits' 
      };
    } else if (percentage < 80) {
      return { 
        color: '#f1c40f', 
        icon: '⚠️', 
        text: 'Approaching limit' 
      };
    } else {
      return { 
        color: '#e74c3c', 
        icon: '🚨', 
        text: 'Limit almost reached' 
      };
    }
  };

  const status = getSpendingStatus();
  const remaining = budget - spent;
  
  return (
    <div className="spending-progress">

      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '0.5rem' 
        }}
      >
        <div style={{ fontSize: '1.6rem', color: '#aaa' }}>
          Monthly Spending Limit
        </div>
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: status.color,
            fontWeight: 500
          }}
        >
          <span style={{ marginRight: '0.5rem' }}>{status.icon}</span>
          {status.text}
        </div>
      </div>
      
      <div 
        style={{ 
          height: '24px', 
          backgroundColor: '#1a1a1a', 
          borderRadius: '12px', 
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div 
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: status.color,
            transition: 'width 0.5s ease-in-out'
          }}
        />
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '22px',
            zIndex: 10
          }}
        >
          {percentage}%
        </div>
      </div>
      
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginTop: '0.5rem', 
          fontSize: '1.4rem' 
        }}
      >
        <div style={{ color: '#2ecc71' }}>
          Spent: ${spent.toLocaleString()}
        </div>
        <div style={{ color: '#aaa' }}>
          Remaining: ${remaining.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default SpendingProgress;