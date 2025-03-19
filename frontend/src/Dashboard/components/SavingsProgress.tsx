// src/components/SavingsProgress.tsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const SavingsProgress: React.FC = () => {
  const progressRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (progressRef.current) {
      d3.select(progressRef.current).selectAll("*").remove();
      
      const width = progressRef.current.clientWidth;
      const height = 8;
      
      const svg = d3.select(progressRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
        
      // Background bar
      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", "#444");
        
      // Progress bar
      svg.append("rect")
        .attr("width", width * 0.45)
        .attr("height", height)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", "#2ecc71");
    }
  }, []);
  
  return (
    <div className="savings-progress">
      <div className="section-header">Savings Progress</div>
      <div className="savings-content">
        <div className="savings-goal">Goal: $10,000</div>
        <div className="current-savings">Current Savings: $4,500</div>
        <div className="progress-container">
          <div className="progress-bar" ref={progressRef}></div>
          <div className="progress-label">$4,500 of $10,000</div>
        </div>
        <button className="savings-button">Update Savings</button>
      </div>
    </div>
  );
};

export default SavingsProgress;
