import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface TotalBalanceProps {
  balance?: number;
  growth?: number;
}

const TotalBalance: React.FC<TotalBalanceProps> = ({ 
  balance = 7540.00,
  growth = 8.00
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [displayedBalance, setDisplayedBalance] = useState(0);
  
  // Animate the balance counter
  useEffect(() => {
    const duration = 1500;
    const interval = 20;
    const steps = duration / interval;
    const increment = balance / steps;
    let current = 0;
    let timer: number;
    
    // Update the displayed balance
    const updateDisplay = () => {
      current += increment;
      if (current > balance) current = balance;
      setDisplayedBalance(current);
      
      if (current >= balance) {
        clearInterval(timer);
      }
    };
    
    timer = window.setInterval(updateDisplay, interval);
    
    return () => {
      clearInterval(timer);
    };
  }, [balance]);
  
  // Apply subtle background effect with D3
  useEffect(() => {
    if (cardRef.current) {
      // First, clear any existing SVG
      d3.select(cardRef.current).selectAll("svg").remove();
      
      const width = cardRef.current.clientWidth;
      const height = cardRef.current.clientHeight;
      
      const svg = d3.select(cardRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("position", "absolute")
        .style("top", 0)
        .style("left", 0)
        .style("z-index", -1);
      
      // Create a subtle gradient
      const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "subtleGradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");
      
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#1a1a1a");
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#222");
      
      // Apply gradient to background
      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("rx", 8)
        .attr("ry", 8)
        .attr("fill", "url(#subtleGradient)")
        .attr("opacity", 0.5);
    }
  }, []);
  
  return (
    <div 
      className="total-balance-card" 
      ref={cardRef}
      style={{ 
        position: 'relative', 
        overflow: 'hidden',
        borderRadius: '8px'
      }}
    >
      <div className="label" style={{ 
        marginBottom: '0.5rem', 
        color: '#aaa',
        position: 'relative',
        zIndex: 1
      }}>
        Total Balance
      </div>
      <div 
        className="balance-amount" 
        style={{ 
          position: 'relative', 
          zIndex: 1 
        }}
      >
        ${displayedBalance.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}
      </div>
      <div 
        className="balance-growth" 
        style={{ 
          color: growth >= 0 ? '#2ecc71' : '#e74c3c',
          marginTop: '0.25rem',
          position: 'relative',
          zIndex: 1
        }}
      >
        {growth >= 0 ? '↑' : '↓'} {Math.abs(growth).toFixed(2)}%
      </div>
    </div>
  );
};

export default TotalBalance;