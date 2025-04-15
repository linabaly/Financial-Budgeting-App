import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface SavingsProgressProps {
  onUpdateClick?: () => void;
  currentSavings?: number;
}

const SavingsProgress: React.FC<SavingsProgressProps> = ({ 
  onUpdateClick,
  currentSavings: propCurrentSavings
}) => {
  const [currentSavings, setCurrentSavings] = useState(propCurrentSavings || 4500);
  const progressRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const goalAmount = 10000;
  
  const progressPercent = Math.round((currentSavings / goalAmount) * 100);
  
  useEffect(() => {
    if (propCurrentSavings !== undefined) {
      setCurrentSavings(propCurrentSavings);
    }
  }, [propCurrentSavings]);
  
  useEffect(() => {
    updateProgressBar();
    updateLabels();
  }, [currentSavings]);
  
  // Function to get color based on progress percentage
  const getColorForPercentage = (percentage: number) => {
    if (percentage < 0.3) return { 
      main: "#dc143c", // ← crimson red
      light: "rgba(220, 20, 60, 0.3)", 
      text: "#dc143c" 
    };
    if (percentage < 0.7) return { 
      main: "#ffdf64", // ← pastel yellow
      light: "rgba(255, 223, 100, 0.3)", 
      text: "#ffdf64" 
    };
    return { 
      main: "#2ecc71", // ← emerald green
      light: "rgba(46, 204, 113, 0.3)", 
      text: "#2ecc71" 
    };
  };
  
  const updateLabels = () => {
    if (labelsRef.current) {
      d3.select(labelsRef.current).selectAll("*").remove();
      
      const labelsContainer = d3.select(labelsRef.current);
      
      const colors = getColorForPercentage(progressPercent / 100);
      
      const labelDiv = labelsContainer.append("div")
        .attr("class", "progress-label")
        .style("display", "flex")
        .style("justify-content", "space-between")
        .style("margin-top", "0.5rem");
      
      // Add percentage on the left with dynamic color
      labelDiv.append("span")
  .attr("class", `progress-percent ${getLevelClass(progressPercent / 100)}`)
  .text(`${progressPercent}%`);

      
      // Add goal on the right
      labelDiv.append("span")
        .text(`$${currentSavings} / $${goalAmount.toLocaleString()}`);
    }
  };
  
  const updateProgressBar = () => {
    if (progressRef.current) {
      d3.select(progressRef.current).selectAll("*").remove();
      
      const width = progressRef.current.clientWidth;
      const height = 12;
      
      const svg = d3.select(progressRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
      
      const progressPercentage = Math.min((currentSavings / goalAmount), 1);
      const colors = getColorForPercentage(progressPercentage);
      
      // Background bar
      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("fill", "#444");
      
      // Progress bar with animation
      svg.append("rect")
        .attr("width", 0)
        .attr("height", height)
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("fill", colors.main)
        .transition()
        .duration(750)
        .attr("width", width * progressPercentage);
    }
  };
  
  const handleUpdateClick = () => {
    if (typeof onUpdateClick === 'function') {
      const button = document.querySelector('.savings-button') as HTMLElement;
      
      if (button) {
        button.style.transform = 'scale(0.95)';
        button.style.backgroundColor = '#4050D4';
        
        setTimeout(() => {
          button.style.transform = '';
          button.style.backgroundColor = '#3040C4';
          
          onUpdateClick();
        }, 150);
      } else {
        onUpdateClick();
      }
    }
  };
  
  return (
    <div className="savings-progress widget">
  <div className="widget-header">
    <div className="section-header">Savings Progress</div>
  </div>
  <div className="widget-body savings-content">

        <div className="savings-goal">Goal: ${goalAmount.toLocaleString()}</div>
        <div 
          className="current-savings" 
          style={{ 
            color: getColorForPercentage(currentSavings / goalAmount).text 
          }}
        >
          Current Savings: ${currentSavings.toLocaleString()}
        </div>
        <div className="progress-container">
          <div 
            className={`progress-bar ${
              progressPercent < 30 ? 'glow-low' : 
              progressPercent < 70 ? 'glow-medium' : 
              'glow-high'
            }`} 
            ref={progressRef}
          ></div>
          <div ref={labelsRef}></div>
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

function getLevelClass(percentage: number): string {
  if (percentage < 0.3) return 'low';
  if (percentage < 0.7) return 'medium';
  return 'high';
}

export default SavingsProgress;

