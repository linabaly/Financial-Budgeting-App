import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { RecurringPayment } from '../types';

const recurringPayments: RecurringPayment[] = [
  { service: "Netflix", amount: "$15.99", dueDate: "due on 25th" },
  { service: "Car Insurance", amount: "$129", dueDate: "due on 1st" },
  { service: "Spotify", amount: "$9.99", dueDate: "due on 15th" }
];

const RecurringPayments: React.FC = () => {
  const paymentsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (paymentsRef.current) {
      // Clear any existing content
      d3.select(paymentsRef.current).selectAll("*").remove();
      
      // Create payment items with D3
      const paymentContainer = d3.select(paymentsRef.current)
        .selectAll(".payment-item")
        .data(recurringPayments)
        .enter()
        .append("div")
        .attr("class", "payment-item")
        .style("opacity", 0)
        .style("transform", "translateX(-10px)");
      
      // Add icon
      paymentContainer.append("div")
        .attr("class", "payment-icon")
        .text(d => {
          switch(d.service) {
            case "Netflix": return "▶";
            case "Spotify": return "♫";
            case "Car Insurance": return "🚗";
            default: return "💵";
          }
        });
      
      // Add service name
      paymentContainer.append("div")
        .attr("class", "payment-service")
        .text(d => d.service);
      
      // Add payment details
      const details = paymentContainer.append("div")
        .attr("class", "payment-details");
      
      details.append("div")
        .attr("class", "payment-amount")
        .text(d => d.amount);
      
      details.append("div")
        .attr("class", "payment-date")
        .text(d => d.dueDate);
      
      // Animate payment items
      paymentContainer.transition()
        .duration(300)
        .delay((d, i) => i * 100)
        .style("opacity", 1)
        .style("transform", "translateX(0)");
    }
  }, []);
  
  return (
    <div className="recurring-payments">
      <div className="section-header">Recurring Payments Reminder</div>
      <div className="payments-list" ref={paymentsRef}></div>
    </div>
  );
};

export default RecurringPayments;