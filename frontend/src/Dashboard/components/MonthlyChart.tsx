import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { monthlyChartData, generateMonthlyChart } from '../utils/chartUtils';

const MonthlyChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [maxValue] = useState(1500);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Calculate total amount from chart data
  useEffect(() => {
    const total = monthlyChartData.reduce((sum, item) => sum + item.value, 0);
    setTotalAmount(total);
  }, []);
  
  // Create the chart
  useEffect(() => {
    if (chartRef.current) {
      const updateChart = () => {
        // Need to pass the ref directly and not the current property
        generateMonthlyChart({current: chartRef.current}, monthlyChartData, maxValue);
      };
      
      // Initial render
      updateChart();
      
      // Also update on resize for responsiveness
      const handleResize = () => {
        updateChart();
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [maxValue]);
  
  // Create the header with D3
  useEffect(() => {
    if (headerRef.current) {
      d3.select(headerRef.current).selectAll("*").remove();
      
      const header = d3.select(headerRef.current)
        .append("div")
        .attr("class", "chart-header")
        .style("display", "flex")
        .style("justify-content", "space-between")
        .style("align-items", "center")
        .style("margin-bottom", "0.5rem");
      
      // Add the amount with animation
      const amountDisplay = header.append("div")
        .attr("class", "chart-amount")
        .style("font-size", "2.4rem")
        .style("font-weight", "600")
        .text("$0");
      
      // Animate the amount counting up
      const duration = 1500;
      const start = Date.now();
      
      const animateValue = () => {
        const now = Date.now();
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentValue = Math.floor(progress * maxValue);
        amountDisplay.text(`$${currentValue.toLocaleString()}`);
        
        if (progress < 1) {
          requestAnimationFrame(animateValue);
        }
      };
      
      animateValue();
      
      // Add description
      header.append("div")
        .attr("class", "chart-subtitle")
        .style("font-size", "1.4rem")
        .style("color", "#aaa")
        .text("Monthly Spending Limit");
    }
  }, [maxValue]);
  
  return (
    <div className="monthly-chart-container">
      <div ref={headerRef}></div>
      <div className="chart" ref={chartRef}></div>
    </div>
  );
};

export default MonthlyChart;