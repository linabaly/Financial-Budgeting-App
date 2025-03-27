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
  const labelsRef = useRef<HTMLDivElement>(null);
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
    updateLabels();
  }, [currentSavings]);
  
  // Function to update the labels using D3
  const updateLabels = () => {
    if (labelsRef.current) {
      d3.select(labelsRef.current).selectAll("*").remove();
      
      const labelsContainer = d3.select(labelsRef.current);
      
      // Create label container
      const labelDiv = labelsContainer.append("div")
        .attr("class", "progress-label")
        .style("display", "flex")
        .style("justify-content", "space-between")
        .style("margin-top", "0.5rem");
      
      // Calculate progress percentage
      const progressPercent = Math.round((currentSavings / goalAmount) * 100);
      
      // Add percentage on the left
      labelDiv.append("span")
        .style("color", "#2ecc71")
        .style("font-weight", "600")
        .text(`${progressPercent}%`);
      
      // Add goal on the right
      labelDiv.append("span")
        .text(`Goal: $${goalAmount.toLocaleString()}`);
    }
  };
  
  // Function to update the D3 visualization
  const updateProgressBar = () => {
    if (progressRef.current) {
      d3.select(progressRef.current).selectAll("*").remove();
      
      const width = progressRef.current.clientWidth;
      const height = 12; // Slightly taller for better visibility
      
      const svg = d3.select(progressRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
        
      // Background bar with subtle gradient
      const gradientId = "savingsGradient";
      
      // Define gradient
      const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");
        
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#2ecc71");
        
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#3498db");
      
      // Background bar
      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("fill", "#444");
        
      // Calculate progress percentage (capped at 100%)
      const progressPercentage = Math.min((currentSavings / goalAmount), 1);
      
      // Progress bar with animation
      svg.append("rect")
        .attr("width", 0) // Start at 0 for animation
        .attr("height", height)
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("fill", `url(#${gradientId})`)
        .transition() // Add transition
        .duration(750) // Animation duration in milliseconds
        .attr("width", width * progressPercentage); // Animate to final width
        
      // Add milestone markers
      const milestones = [0.25, 0.5, 0.75];
      
      milestones.forEach(milestone => {
        const x = width * milestone;
        
        // Milestone line
        svg.append("line")
          .attr("x1", x)
          .attr("y1", 0)
          .attr("x2", x)
          .attr("y2", height)
          .attr("stroke", "rgba(255, 255, 255, 0.5)")
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", "2,2")
          .style("opacity", 0)
          .transition()
          .delay(750) // Start after the bar animation completes
          .duration(300)
          .style("opacity", 0.7);
      });
      
      // Add milestone values
      milestones.forEach(milestone => {
        const x = width * milestone;
        const milestoneValue = milestone * goalAmount;
        
        // Add milestone tooltip on hover
        const tooltip = svg.append("g")
          .attr("class", "milestone-tooltip")
          .style("opacity", 0);
        
        // Tooltip background
        tooltip.append("rect")
          .attr("x", x - 30)
          .attr("y", -30)
          .attr("width", 60)
          .attr("height", 20)
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("fill", "#333");
        
        // Tooltip text
        tooltip.append("text")
          .attr("x", x)
          .attr("y", -17)
          .attr("text-anchor", "middle")
          .attr("fill", "#fff")
          .attr("font-size", "10px")
          .text(`$${milestoneValue.toLocaleString()}`);
        
        // Tooltip pointer
        tooltip.append("path")
          .attr("d", `M${x-5},${-10} L${x},${-5} L${x+5},${-10}`)
          .attr("fill", "#333");
        
        // Create hover area - fixing the type error here by using a different approach
        const hoverRect = svg.append("rect")
          .attr("x", x - 10)
          .attr("y", 0)
          .attr("width", 20)
          .attr("height", height)
          .attr("fill", "transparent")
          .style("cursor", "pointer");
        
        // Using proper type-safe event handling
        hoverRect.on("mouseover", function(event) {
          // Use d3.select with the SVG element directly
          svg.selectAll(".milestone-tooltip")
            .filter(function() {
              // Find the tooltip that's at the same x position
              const tooltipX = d3.select(this).select("text").attr("x");
              return parseFloat(tooltipX) === x;
            })
            .transition()
            .duration(200)
            .style("opacity", 1);
        });
        
        hoverRect.on("mouseout", function(event) {
          // Use d3.select with the SVG element directly
          svg.selectAll(".milestone-tooltip")
            .filter(function() {
              // Find the tooltip that's at the same x position
              const tooltipX = d3.select(this).select("text").attr("x");
              return parseFloat(tooltipX) === x;
            })
            .transition()
            .duration(200)
            .style("opacity", 0);
        });
      });
    }
  };
  
  // Handler for the update button with animation effect
  const handleUpdateClick = () => {
    if (typeof onUpdateClick === 'function') {
      const button = document.querySelector('.savings-button') as HTMLElement;
      
      // Add a quick animation effect
      if (button) {
        button.style.transform = 'scale(0.95)';
        button.style.backgroundColor = '#4050D4';
        
        setTimeout(() => {
          button.style.transform = '';
          button.style.backgroundColor = '#3040C4';
          
          // Call the parent component handler
          onUpdateClick();
        }, 150);
      } else {
        // Fallback if button not found
        onUpdateClick();
      }
    }
  };
  
  return (
    <div className="savings-progress">
      <div className="section-header">Savings Progress</div>
      <div className="savings-content">
        <div className="savings-goal">Goal: ${goalAmount.toLocaleString()}</div>
        <div className="current-savings">Current Savings: ${currentSavings.toLocaleString()}</div>
        <div className="progress-container">
          <div className="progress-bar" ref={progressRef}></div>
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

export default SavingsProgress;