import React, { useEffect, useRef } from 'react';
import './BudgetInsights.css';
import Header from '../Dashboard/components/Header';
import Footer from '../Dashboard/components/Footer';
import { generateExpensePieChart, generateMonthlyComparisonChart } from './utils/insightChartUtils';

const BudgetInsights: React.FC = () => {
  const pieChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Initialize charts when component mounts
    if (pieChartRef.current) {
      // Pass refs safely
      generateExpensePieChart(pieChartRef);
    }
    
    if (barChartRef.current) {
      // Pass refs safely
      generateMonthlyComparisonChart(barChartRef);
    }
    
    // Handle resize events
    const handleResize = () => {
      if (pieChartRef.current) {
        generateExpensePieChart(pieChartRef);
      }
      
      if (barChartRef.current) {
        generateMonthlyComparisonChart(barChartRef);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="app">
      <Header />
      
      <main className="insights-content">
        {/* Top Cards Section */}
        <div className="insights-summary">
          <div className="summary-card">
            <div className="summary-inner">
              <h3>Remaining Budget</h3>
              <div className="amount positive">$10,300</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-inner">
              <h3>Total Expenses</h3>
              <div className="amount negative">$3,500</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-inner">
              <h3>Total Saved</h3>
              <div className="amount positive">$900</div>
            </div>
          </div>
        </div>
        
        {/* Pie Chart Section */}
        <div className="chart-container pie-chart-container">
          <div className="pie-chart-wrapper" ref={pieChartRef}></div>
          <div className="legend-container">
            <div className="legend-item">
              <div className="legend-color rent"></div>
              <div className="legend-name">Rent</div>
              <div className="legend-value">$ 1,500</div>
            </div>
            <div className="legend-item">
              <div className="legend-color groceries"></div>
              <div className="legend-name">Groceries</div>
              <div className="legend-value">$ 600</div>
            </div>
            <div className="legend-item">
              <div className="legend-color entertainment"></div>
              <div className="legend-name">Entertainment</div>
              <div className="legend-value">$ 200</div>
            </div>
            <div className="legend-item">
              <div className="legend-color utilities"></div>
              <div className="legend-name">Utilities</div>
              <div className="legend-value">$ 300</div>
            </div>
          </div>
        </div>
        
        {/* Bar Chart and Details Section */}
        <div className="bottom-container">
          <div className="chart-container bar-chart-container">
            <div className="bar-chart-wrapper" ref={barChartRef}></div>
          </div>
          
          <div className="category-details">
            <h3>Category Name:</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget 
              dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, 
              nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla 
              consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In 
              enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.
            </p>
            <button className="generate-btn">Generate</button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BudgetInsights;