import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { API_BASE_URL } from '../../config';

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

const IncomeExpenseChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<MonthlyData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const res = await fetch(`${API_BASE_URL}/transaction`, {
          headers: {
            "Authorization": token,
            "Content-Type": "application/json"
          }
        });

        const transactions = await res.json();

        const monthly: MonthlyData[] = MONTH_NAMES.map(m => ({
          month: m,
          income: 0,
          expense: 0
        }));

        transactions.forEach((tx: any) => {
          const date = new Date(tx.postedAt);
          if (date.getFullYear() === year) {
            const m = date.getMonth();
            const amt = parseFloat(tx.amount);
            if (tx.type === "INCOME") monthly[m].income += amt;
            if (tx.type === "EXPENSE") monthly[m].expense += amt;
          }
        });

        setData(monthly);
      } catch (e: any) {
        console.error(e.message);
        setError(e.message);
      }
    };

    fetchData();
  }, [year]);

  useEffect(() => {
    if (chartRef.current && data.length > 0) drawChart();
  }, [data]);

  const drawChart = () => {
    d3.select(chartRef.current).selectAll("*").remove();
    const margin = { top: 30, right: 30, bottom: 40, left: 60 };
    const width = chartRef.current!.clientWidth - margin.left - margin.right;
    const height = 320;

    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("font-family", "sans-serif")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint()
      .domain(data.map(d => d.month))
      .range([0, width])
      .padding(0.5);

    const maxY = d3.max(data, d => Math.max(d.income, d.expense)) || 100;

    const y = d3.scaleLinear()
      .domain([0, maxY * 1.1])
      .range([height, 0])
      .nice();

    // Add Legend
        
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
      .attr("y", 3)
      .attr("fill", "#fff")
      .attr("font-size", "20px")
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
      .attr("y", 3)
      .attr("fill", "#fff")
      .attr("font-size", "20px")
      .text("Expenses");

    // Tooltip
    const tooltip = d3.select(chartRef.current)
      .append("div")
      .style("position", "absolute")
      .style("background", "#111")
      .style("color", "#fff")
      .style("padding", "6px 10px")
      .style("border-radius", "4px")
      .style("font-size", "14px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    const lineIncome = d3.line<MonthlyData>()
      .x(d => x(d.month)!)
      .y(d => y(d.income))
      .curve(d3.curveMonotoneX);

    const lineExpense = d3.line<MonthlyData>()
      .x(d => x(d.month)!)
      .y(d => y(d.expense))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#2ecc71")
      .attr("stroke-width", 3)
      .attr("d", lineIncome);

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#ff6b6b")
      .attr("stroke-width", 3)
      .attr("d", lineExpense);

    // Dots
    const drawDots = (key: 'income' | 'expense', color: string) => {
      svg.selectAll(`.${key}-dot`)
        .data(data)
        .enter()
        .append("circle")
        .attr("class", `${key}-dot`)
        .attr("cx", d => x(d.month)!)
        .attr("cy", d => y(d[key]))
        .attr("r", 5)
        .attr("fill", color)
        .on("mouseover", (event, d) => {
          tooltip
            .html(`<strong>${d.month}</strong><br/>${key.charAt(0).toUpperCase() + key.slice(1)}: $${d[key].toFixed(2)}`)
            .style("left", event.offsetX + "px")
            .style("top", event.offsetY - 40 + "px")
            .transition().duration(200).style("opacity", 0.9);
        })
        .on("mouseout", () => {
          tooltip.transition().duration(200).style("opacity", 0);
        });
    };

    drawDots("income", "#2ecc71");
    drawDots("expense", "#ff6b6b");

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("fill", "#ccc")
      .style("font-size", "14px");

    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `$${d}`))
      .selectAll("text")
      .attr("fill", "#ccc")
      .style("font-size", "14px");
    // Remove inner tick lines
    svg.selectAll(".tick line").remove();
  };

  return (
    <div style={{ padding: '1rem', position: 'relative' }}>
      {/* Header & Year Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => setYear(prev => prev - 1)}>&larr;</button>
          <span style={{ fontSize: '1.6rem', fontWeight: 600}}>Income vs Expense – {year}</span>
          <button onClick={() => setYear(prev => prev + 1)} disabled={year >= new Date().getFullYear()}>&rarr;</button>
        </div>
      </div>

      {/* Chart or Error */}
      {error ? (
        <div style={{ color: '#e74c3c', fontSize: '1.4rem' }}>Add Transactions to Load Chart</div>
      ) : (
        <div ref={chartRef} style={{ height: '360px', position: 'relative' }} />
      )}
    </div>
  );
};

export default IncomeExpenseChart;
