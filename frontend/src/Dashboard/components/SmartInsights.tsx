import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Insight {
  type: 'danger' | 'info' | 'success';
  text: string;
  icon: string;
}

const insights: Insight[] = [
  {
    type: 'danger',
    text: 'Your spending on Groceries is 20% higher than usual.',
    icon: '!'
  },
  {
    type: 'info',
    text: 'Cut back on Subscriptions to save $56/month.',
    icon: '?'
  },
  {
    type: 'success',
    text: 'Great job! You stayed under budget in Entertainment.',
    icon: '✓'
  }
];

const SmartInsights: React.FC = () => {
  const insightsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (insightsRef.current) {
      // Clear any existing content
      d3.select(insightsRef.current).selectAll("*").remove();
      
      // Create insights with D3
      const insightContainer = d3.select(insightsRef.current)
        .selectAll(".insight-item")
        .data(insights)
        .enter()
        .append("div")
        .attr("class", d => `insight-item ${d.type}`)
        .style("opacity", 0)
        .style("transform", "translateY(10px)");
      
      // Add icon
      insightContainer.append("div")
        .attr("class", "insight-icon")
        .text(d => d.icon);
      
      // Add text
      insightContainer.append("div")
        .attr("class", "insight-text")
        .text(d => d.text);
      
      // Animate insights
      insightContainer.transition()
        .duration(300)
        .delay((d, i) => i * 150)
        .style("opacity", 1)
        .style("transform", "translateY(0)");
    }
  }, []);
  
  return (
    <div className="smart-insights">
      <div className="section-header">Smart AI Insights</div>
      <div ref={insightsRef}></div>
    </div>
  );
};

export default SmartInsights;