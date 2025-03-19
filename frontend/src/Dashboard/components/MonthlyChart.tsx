// src/components/MonthlyChart.tsx
import React, { useEffect, useRef } from 'react';
import { monthlyChartData, generateMonthlyChart } from '../utils/chartUtils';

const MonthlyChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (chartRef.current) {
      generateMonthlyChart(chartRef, monthlyChartData, 1500);
      
      const handleResize = () => {
        generateMonthlyChart(chartRef, monthlyChartData, 1500);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  return (
    <div className="monthly-chart-container">
      <div className="chart-header">
        <div className="chart-amount">$1,500</div>
      </div>
      <div className="chart" ref={chartRef}></div>
    </div>
  );
};

export default MonthlyChart;
