// src/Dashboard/utils/chartUtils.ts
import { MonthlyData, IncomeExpenseData } from '../types';
import * as d3 from 'd3';

export const monthlyChartData: MonthlyData[] = [
  { month: 'Jan', value: 700 },
  { month: 'Feb', value: 1200 },
  { month: 'Mar', value: 1000 },
  { month: 'Apr', value: 1000 },
  { month: 'May', value: 900 },
  { month: 'Jun', value: 1500 },
  { month: 'Jul', value: 800 },
  { month: 'Aug', value: 1100 },
  { month: 'Sep', value: 700 },
  { month: 'Oct', value: 1000 },
  { month: 'Nov', value: 800 },
  { month: 'Dec', value: 900 },
];

export const incomeExpenseData: IncomeExpenseData[] = [
  { date: '1', income: 800, expense: 1000 },
  { date: '2', income: 750, expense: 1300 },
  { date: '3', income: 850, expense: 1200 },
  { date: '4', income: 900, expense: 950 },
  { date: '5', income: 1000, expense: 1100 },
  { date: '6', income: 950, expense: 800 },
  { date: '7', income: 1100, expense: 900 },
  { date: '8', income: 1200, expense: 700 },
  { date: '9', income: 1050, expense: 850 },
];

export const generateMonthlyChart = (containerRef: React.RefObject<HTMLDivElement>, data: MonthlyData[], maxValue: number) => {
  if (!containerRef.current) return;
  
  d3.select(containerRef.current).selectAll("*").remove();
  
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = containerRef.current.clientWidth - margin.left - margin.right;
  const height = containerRef.current.clientHeight - margin.top - margin.bottom;
  
  const svg = d3.select(containerRef.current)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
    
  const x = d3.scaleBand()
    .domain(data.map(d => d.month))
    .range([0, width])
    .padding(0.4);
    
  const y = d3.scaleLinear()
    .domain([0, maxValue])
    .range([height, 0]);
  
  // Add horizontal max line
  svg.append("line")
    .attr("x1", 0)
    .attr("y1", y(maxValue))
    .attr("x2", width)
    .attr("y2", y(maxValue))
    .attr("stroke", "#ff6b6b")
    .attr("stroke-dasharray", "5,5")
    .attr("opacity", 0.7);
    
  // Add max label
  svg.append("text")
    .attr("x", width)
    .attr("y", y(maxValue) - 5)
    .attr("text-anchor", "end")
    .attr("font-size", "22px")
    .attr("fill", "#ff6b6b")
    .text("MAX");
  
  // Add bars
  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.month) || 0)
    .attr("width", x.bandwidth())
    .attr("y", d => y(d.value))
    .attr("height", d => height - y(d.value))
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("fill", d => d.month === 'Jun' ? "#ff6b6b" : "#2ecc71");
    
  // Add x-axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("font-size", "24px")
    .attr("fill", "#aaa");
    
  // Remove x-axis line
  svg.select(".domain").remove();
  svg.selectAll(".tick line").remove();
};

export const generateIncomeExpenseChart = (containerRef: React.RefObject<HTMLDivElement>, data: IncomeExpenseData[]) => {
  if (!containerRef.current) return;
  
  d3.select(containerRef.current).selectAll("*").remove();
  
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = containerRef.current.clientWidth - margin.left - margin.right;
  const height = containerRef.current.clientHeight - margin.top - margin.bottom;
  
  const svg = d3.select(containerRef.current)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
    
  const x = d3.scaleBand()
    .domain(data.map(d => d.date))
    .range([0, width])
    .padding(0.4);
    
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => Math.max(d.income, d.expense)) || 1500])
    .range([height, 0]);
  
  // Create line generators
  const incomeLine = d3.line<IncomeExpenseData>()
    .x(d => (x(d.date) || 0) + x.bandwidth() / 2)
    .y(d => y(d.income));
    
  const expenseLine = d3.line<IncomeExpenseData>()
    .x(d => (x(d.date) || 0) + x.bandwidth() / 2)
    .y(d => y(d.expense));
  
  // Add income line
  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#2ecc71")
    .attr("stroke-width", 2)
    .attr("d", incomeLine);
    
  // Add expense line
  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#ff6b6b")
    .attr("stroke-width", 2)
    .attr("d", expenseLine);
    
  // Add income dots
  svg.selectAll(".income-dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "income-dot")
    .attr("cx", d => (x(d.date) || 0) + x.bandwidth() / 2)
    .attr("cy", d => y(d.income))
    .attr("r", 4)
    .attr("fill", "#2ecc71");
    
  // Add expense dots
  svg.selectAll(".expense-dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "expense-dot")
    .attr("cx", d => (x(d.date) || 0) + x.bandwidth() / 2)
    .attr("cy", d => y(d.expense))
    .attr("r", 4)
    .attr("fill", "#ff6b6b");
    
  // Add x-axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("font-size", "24px")
    .attr("fill", "#aaa");
    
  // Remove x-axis line
  svg.select(".domain").remove();
  svg.selectAll(".tick line").remove();
};