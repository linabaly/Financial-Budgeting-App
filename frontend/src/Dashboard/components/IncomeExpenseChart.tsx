import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { incomeExpenseData } from '../utils/chartUtils';

const IncomeExpenseChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (chartRef.current) {
      // Make sure to use the available height effectively
      const updateChart = () => {
        // First clear any existing content
        d3.select(chartRef.current).selectAll("*").remove();
        
        // Then generate the chart with our custom implementation
        generateIncomeExpenseChart();
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
  }, []);
  
  // Custom implementation of the income expense chart
  const generateIncomeExpenseChart = () => {
    if (!chartRef.current) return;
    
    const containerWidth = chartRef.current.clientWidth;
    const containerHeight = chartRef.current.clientHeight;
    
    const margin = { top: 40, right: 65, bottom: 40, left: 65 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create legend
    const legendG = svg.append("g")
      .attr("transform", `translate(0, -20)`);
    
    // Income legend
    const incomeLegend = legendG.append("g")
      .attr("transform", "translate(0, 0)");
    
    incomeLegend.append("circle")
      .attr("cx", 5)
      .attr("cy", 0)
      .attr("r", 5)
      .attr("fill", "#2ecc71");
    
    incomeLegend.append("text")
      .attr("x", 15)
      .attr("y", 5)
      .attr("fill", "#fff")
      .attr("font-size", "14px")
      .text("Income");
    
    // Expense legend
    const expenseLegend = legendG.append("g")
      .attr("transform", "translate(100, 0)");
    
    expenseLegend.append("circle")
      .attr("cx", 5)
      .attr("cy", 0)
      .attr("r", 5)
      .attr("fill", "#ff6b6b");
    
    expenseLegend.append("text")
      .attr("x", 15)
      .attr("y", 5)
      .attr("fill", "#fff")
      .attr("font-size", "14px")
      .text("Expenses");
    
    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-size", "16px")
      .text("Income vs. Expenses");
    
    // Define scales
    const x = d3.scaleBand()
      .domain(incomeExpenseData.map(d => d.date))
      .range([0, width])
      .padding(0.4);
    
    const yMax = d3.max(incomeExpenseData, d => Math.max(d.income, d.expense)) || 1500;
    const yMin = 0; // Start from 0
    
    const y = d3.scaleLinear()
      .domain([yMin, yMax * 1.1]) // Add 10% padding at the top
      .range([height, 0]);
    
    // Create the x-axis with styling
    svg.append("g")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(x))
  .selectAll("text")
  .style("font-size", "12px")
  .style("fill", "#ccc")
  .style("text-anchor", "middle")
  .attr("dy", "1.5em"); // Push labels slightly down

    
    // Create the y-axis with dollar signs and no domain line
    svg.append("g")
      .call(
        d3.axisLeft(y)
          .tickFormat(d => `$${d}`)
          .tickSize(0) // Remove tick marks
          .ticks(6)
      )
      .call(g => g.select(".domain").remove()) // Remove domain line
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#aaa")
      .style("text-anchor", "end");
    
    // Add horizontal grid lines
    svg.selectAll(".grid-line")
      .data(y.ticks(6))
      .enter()
      .append("line")
      .attr("class", "grid-line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", d => y(d))
      .attr("y2", d => y(d))
      .attr("stroke", "#444")
      .attr("stroke-dasharray", "2,2")
      .attr("stroke-width", 1);
    
    // Add zero baseline
    svg.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", height)
      .attr("y2", height)
      .attr("stroke", "#555")
      .attr("stroke-width", 1);
    
    // Create the lines
    const incomeLine = d3.line<{date: string, income: number, expense: number}>()
      .x(d => (x(d.date) || 0) + x.bandwidth() / 2)
      .y(d => y(d.income))
      .curve(d3.curveMonotoneX);
    
    const expenseLine = d3.line<{date: string, income: number, expense: number}>()
      .x(d => (x(d.date) || 0) + x.bandwidth() / 2)
      .y(d => y(d.expense))
      .curve(d3.curveMonotoneX);
    
    // Add the income path
    svg.append("path")
      .datum(incomeExpenseData)
      .attr("fill", "none")
      .attr("stroke", "#2ecc71")
      .attr("stroke-width", 3)
      .attr("d", incomeLine);
    
    // Add the expense path
    svg.append("path")
      .datum(incomeExpenseData)
      .attr("fill", "none")
      .attr("stroke", "#ff6b6b")
      .attr("stroke-width", 3)
      .attr("d", expenseLine);
    
    // Add income dots
    svg.selectAll(".income-dot")
      .data(incomeExpenseData)
      .enter()
      .append("circle")
      .attr("class", "income-dot")
      .attr("cx", d => (x(d.date) || 0) + x.bandwidth() / 2)
      .attr("cy", d => y(d.income))
      .attr("r", 5)
      .attr("fill", "#2ecc71");
    
    // Add expense dots
    svg.selectAll(".expense-dot")
      .data(incomeExpenseData)
      .enter()
      .append("circle")
      .attr("class", "expense-dot")
      .attr("cx", d => (x(d.date) || 0) + x.bandwidth() / 2)
      .attr("cy", d => y(d.expense))
      .attr("r", 5)
      .attr("fill", "#ff6b6b");
    
    // Add final values at the right edge
    const lastData = incomeExpenseData[incomeExpenseData.length - 1];
    
    // Income value
    svg.append("text")
      .attr("x", width + 5)
      .attr("y", y(lastData.income))
      .attr("dy", "0.35em")
      .style("fill", "#2ecc71")
      .style("font-size", "12px")
      .text(`$${lastData.income}`);
    
    // Expense value
    svg.append("text")
      .attr("x", width + 5)
      .attr("y", y(lastData.expense))
      .attr("dy", "0.35em")
      .style("fill", "#ff6b6b")
      .style("font-size", "12px")
      .text(`$${lastData.expense}`);
  };
  
  return (
    <div 
      ref={chartRef} 
      className="income-expense-chart-container" 
      style={{ 
        backgroundColor: "#2A2A2A", 
        borderRadius: "12px", 
        height: "100%", 
        width: "100%",
        padding: "20px",
        boxSizing: "border-box"
      }}
    />
  );
};

export default IncomeExpenseChart;