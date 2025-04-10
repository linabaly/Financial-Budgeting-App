import React, { useEffect, useRef } from 'react';
import { Alert } from '../types';
import * as d3 from 'd3';

const alerts: Alert[] = [
  { type: 'danger', message: "You're over budget in Dining Out!" },
  { type: 'warning', message: "Spending is 25% higher this month vs last month." },
  { type: 'info', message: "Your utility bills have decreased by 10% this month." }
];

const ExpenseAlerts: React.FC = () => {
  const alertsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (alertsRef.current) {
      // Clear any existing content
      d3.select(alertsRef.current).selectAll("*").remove();
      
      // Create alerts with D3
      const alertContainer = d3.select(alertsRef.current)
        .selectAll(".alert-item")
        .data(alerts)
        .enter()
        .append("div")
        .attr("class", d => `alert-item ${d.type}`)
        .style("opacity", 0)
        .style("transform", "translateY(-10px)");
      
      // Add icon
      alertContainer.append("div")
        .attr("class", "alert-icon")
        .text(d => d.type === 'danger' ? "⚠️" : d.type === 'warning' ? "⚠" : "ℹ️");
      
      // Add message
      alertContainer.append("div")
        .attr("class", "alert-message")
        .text(d => d.message);
      
      // Animate alerts
      alertContainer.transition()
        .duration(300)
        .delay((d, i) => i * 100)
        .style("opacity", 1)
        .style("transform", "translateY(0)");
    }
  }, []);
  
  return (
    <div className="expense-alerts widget">
  <div className="widget-header">
    <div className="section-header">Expense Alerts & Warnings</div>
  </div>
  <div className="widget-body alerts-list" ref={alertsRef}></div>
</div>

  );
};

export default ExpenseAlerts;