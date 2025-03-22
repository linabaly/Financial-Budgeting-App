// src/components/SavingsProgress.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface SavingsProgressProps {
  onUpdateClick?: () => void; // Optional prop for update button click handler
  currentSavings?: number; // Optional prop to update savings amount from parent
}

const SavingsProgress: React.FC<SavingsProgressProps> = ({ 
  onUpdateClick,
  currentSavings: propCurrentSavings
}) => {
  // State to track savings amount - initialize with prop or default
  const [currentSavings, setCurrentSavings] = useState(propCurrentSavings || 4500);
  const progressRef = useRef<HTMLDivElement>(null);
  const goalAmount = 10000; // Fixed goal amount
  
  // Update local state when prop changes
  useEffect(() => {
    if (propCurrentSavings !== undefined) {
      setCurrentSavings(propCurrentSavings);
    }
  }, [propCurrentSavings]);
  
  // Update progress bar when currentSavings changes
  useEffect(() => {
    updateProgressBar();
  }, [currentSavings]);
  
  // Function to update the D3 visualization
  const updateProgressBar = () => {
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
        
      // Calculate progress percentage (capped at 100%)
      const progressPercentage = Math.min((currentSavings / goalAmount), 1);
      
      // Progress bar with animation
      svg.append("rect")
        .attr("width", 0) // Start at 0 for animation
        .attr("height", height)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", "#2ecc71")
        .transition() // Add transition
        .duration(750) // Animation duration in milliseconds
        .attr("width", width * progressPercentage); // Animate to final width
    }
  };
  
  // Handler for the update button with animation effect
  const handleUpdateClick = () => {
    const button = document.querySelector('.savings-button') as HTMLElement;
    
    // Add a quick animation effect
    if (button) {
      button.style.transform = 'scale(0.95)';
      button.style.backgroundColor = '#4050D4';
      
      setTimeout(() => {
        button.style.transform = '';
        button.style.backgroundColor = '#3040C4';
        
        // Call the parent component handler if provided
        if (onUpdateClick) {
          onUpdateClick();
        }
      }, 150);
    } else {
      // Fallback if button not found
      if (onUpdateClick) {
        onUpdateClick();
      }
    }
  };
  
  // Calculate progress percentage for display
  const progressPercent = Math.round((currentSavings / goalAmount) * 100);
  
  return (
    <div className="savings-progress">
      <div className="section-header">Savings Progress</div>
      <div className="savings-content">
        <div className="savings-goal">Goal: ${goalAmount.toLocaleString()}</div>
        <div className="current-savings">Current Savings: ${currentSavings.toLocaleString()}</div>
        <div className="progress-container">
          <div className="progress-bar" ref={progressRef}></div>
          <div className="progress-label">
            ${currentSavings.toLocaleString()} of ${goalAmount.toLocaleString()} ({progressPercent}%)
          </div>
        </div>
        <button 
          className="savings-button"
          onClick={handleUpdateClick}
        >
          Update Savings
        </button>
      </div>
    </div>
  );
};

export default SavingsProgress;