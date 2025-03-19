// src/components/IncomeExpenseChart.tsx
import React, { useEffect, useRef } from 'react';
import { incomeExpenseData, generateIncomeExpenseChart } from '../utils/chartUtils';

const IncomeExpenseChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (chartRef.current) {
      generateIncomeExpenseChart(chartRef, incomeExpenseData);
      
      const handleResize = () => {
        generateIncomeExpenseChart(chartRef, incomeExpenseData);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  return (
    <div className="income-expense-chart-container">
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color income"></div>
          <div className="legend-label">Income</div>
        </div>
        <div className="legend-item">
          <div className="legend-color expense"></div>
          <div className="legend-label">Expenses</div>
        </div>
      </div>
      <div className="chart" ref={chartRef}></div>
    </div>
  );
};

export default IncomeExpenseChart;