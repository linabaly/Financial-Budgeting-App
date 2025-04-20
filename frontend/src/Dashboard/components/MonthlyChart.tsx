import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { API_BASE_URL } from '../../config';

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface MonthlyData {
  month: string;
  value: number;
}

const generateMonthlyChart = (
  containerRef: React.RefObject<HTMLDivElement>,
  data: MonthlyData[],
  maxValue: number,
  highestMonth: string
) => {
  if (!containerRef.current) return;
  d3.select(containerRef.current).selectAll("*").remove();

  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const width = containerRef.current.clientWidth - margin.left - margin.right;
  const height = 300;

  const svg = d3.select(containerRef.current)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("font-family", "sans-serif")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(data.map(d => d.month))
    .range([0, width])
    .padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, maxValue * 1.1])
    .range([height, 0])
    .nice();

  // Red dotted MAX line
  svg.append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", y(maxValue))
    .attr("y2", y(maxValue))
    .attr("stroke", "#dc143c")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "4 2");

  svg.append("text")
    .attr("x", width)
    .attr("y", y(maxValue) - 8)
    .attr("text-anchor", "end")
    .attr("fill", "#dc143c")
    .attr("font-size", "14px")
    .text("MAX");

  // Tooltip
  const tooltip = d3.select(containerRef.current)
    .append("div")
    .style("position", "absolute")
    .style("background", "#111")
    .style("color", "#fff")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("font-size", "14px")
    .style("pointer-events", "none")
    .style("opacity", 0);

  // Bars
  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(d.month)!)
    .attr("width", x.bandwidth())
    .attr("y", d => y(d.value))
    .attr("height", d => height - y(d.value))
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("fill", d => d.month === highestMonth ? "#dc143c" : "#2ecc71")
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(`<strong>${d.month}</strong><br/>$${d.value.toFixed(2)}`)
        .style("left", event.offsetX + "px")
        .style("top", (event.offsetY - 40) + "px");
    })
    .on("mouseout", function () {
      tooltip.transition().duration(200).style("opacity", 0);
    });

  // X-axis 
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("fill", "#ccc")
    .style("font-size", "18px");

  // Y-axis 
  svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `$${d}`))
      .selectAll("text")
      .attr("fill", "#ccc")
      .style("font-size", "14px");

  // Remove inner tick lines
  svg.selectAll(".tick line").remove();
};

const MonthlyChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [highest, setHighest] = useState<MonthlyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found.");

        const response = await fetch(`${API_BASE_URL}/transaction`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": token
          }
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || "Failed to fetch transactions");
        }

        const transactions = await response.json();

        const months: MonthlyData[] = MONTH_NAMES.map(m => ({ month: m, value: 0 }));

        transactions.forEach((tx: any) => {
          const date = new Date(tx.postedAt);
          if (tx.type === "EXPENSE" && date.getFullYear() === year) {
            months[date.getMonth()].value += parseFloat(tx.amount);
          }
        });

        const max = months.reduce((a, b) => (b.value > a.value ? b : a), months[0]);

        setMonthlyData(months);
        setHighest(max);
      } catch (e: any) {
        console.error("Error loading transactions:", e.message);
        setError(e.message);
      }
    };

    fetchTransactions();
  }, [year]);

  useEffect(() => {
    if (chartRef.current && monthlyData.length > 0 && highest) {
      generateMonthlyChart(chartRef, monthlyData, highest.value || 100, highest.month);
    }
  }, [monthlyData, highest]);

  return (
    <div className="monthly-chart-container" style={{ padding: '1rem', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        {/* Year Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => setYear(prev => prev - 1)}>&larr;</button>
          <span style={{ fontSize: '1.8rem', fontWeight: 600 }}>Expenses – {year}</span>
          <button onClick={() => setYear(prev => prev + 1)} disabled={year >= new Date().getFullYear()}>&rarr;</button>
        </div>

        {/* Max info */}
        {highest && (
          <div style={{ fontSize: '1.1rem', color: '#dc143c', fontWeight: 600 }}>
            Peak: ${highest.value.toFixed(2)} in {highest.month}
          </div>
        )}
      </div>

      {error ? (
        <div className="error-message" style={{ color: '#e74c3c', position: 'relative', zIndex: 1, fontSize: '1.5rem' }}>Add Transactions to Render a Graph</div>
      ) : (
        <div ref={chartRef} style={{ height: '350px', position: 'relative' }} />
      )}
    </div>
  );
};

export default MonthlyChart;
