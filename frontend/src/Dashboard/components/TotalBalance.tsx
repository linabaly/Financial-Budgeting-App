import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { API_BASE_URL } from "../../config";

interface TotalBalanceProps {
  onTransactionChange?: boolean;
}

interface BalanceData {
  totalBalance: number;
  currentMonthIncome: number;
  currentMonthExpenses: number;
  growth: number;
}

const TotalBalance: React.FC<TotalBalanceProps> = ({ onTransactionChange = false }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [displayedBalance, setDisplayedBalance] = useState(0);
  const [balanceData, setBalanceData] = useState<BalanceData>({
    totalBalance: 0,
    currentMonthIncome: 0,
    currentMonthExpenses: 0,
    growth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Navigation state
  const today = new Date();
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); 

  // For keeping all transactions locally
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) throw new Error("No token found.");

        const response = await fetch(`${API_BASE_URL}/transaction`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token,
          },
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || "Failed to fetch transactions");
        }

        const data = await response.json();
        setTransactions(data);
        setIsLoading(false);
      } catch (error: any) {
        console.error("Error fetching transactions:", error.message);
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchTransactionData();
  }, [onTransactionChange]);

  useEffect(() => {
    if (isLoading || error || transactions.length === 0) return;

    const currentDate = new Date();
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + selectedMonthOffset, 1);
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    let cumulativeIncome = 0;
    let cumulativeExpenses = 0;
    let currentMonthIncome = 0;
    let currentMonthExpenses = 0;
    let previousMonthIncome = 0;

    transactions.forEach((tx: any) => {
      const amount = parseFloat(tx.amount);
      const postedDate = new Date(tx.postedAt);
      const month = postedDate.getMonth();
      const year = postedDate.getFullYear();

      const txIsBeforeOrEqualToTarget = 
        year < targetYear || (year === targetYear && month <= targetMonth);

      if (txIsBeforeOrEqualToTarget) {
        if (tx.type === 'INCOME') cumulativeIncome += amount;
        else if (tx.type === 'EXPENSE') cumulativeExpenses += amount;
      }

      if (month === targetMonth && year === targetYear) {
        if (tx.type === 'INCOME') currentMonthIncome += amount;
        else if (tx.type === 'EXPENSE') currentMonthExpenses += amount;
      }

      // For growth calc: previous month only
      const previousMonthDate = new Date(targetYear, targetMonth - 1, 1);
      if (month === previousMonthDate.getMonth() && year === previousMonthDate.getFullYear()) {
        if (tx.type === 'INCOME') previousMonthIncome += amount;
      }
    });

    const totalBalance = cumulativeIncome - cumulativeExpenses;
    const growth = previousMonthIncome > 0
      ? ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100
      : currentMonthIncome > 0 ? 100 : 0;

    setBalanceData({
      totalBalance,
      currentMonthIncome,
      currentMonthExpenses,
      growth
    });
  }, [transactions, selectedMonthOffset, isLoading, error]);

  useEffect(() => {
    if (isLoading || error) return;

    const duration = 800;
    const interval = 20;
    const steps = duration / interval;
    const increment = balanceData.totalBalance / steps;
    let current = 0;
    let timer: number;

    const updateDisplay = () => {
      current += increment;
      if (current > balanceData.totalBalance) current = balanceData.totalBalance;
      setDisplayedBalance(current);

      if (current >= balanceData.totalBalance) {
        clearInterval(timer);
      }
    };

    timer = window.setInterval(updateDisplay, interval);

    return () => {
      clearInterval(timer);
    };
  }, [balanceData.totalBalance, isLoading, error]);

  useEffect(() => {
    if (cardRef.current) {
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

      const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "subtleGradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%");

      gradient.append("stop").attr("offset", "0%").attr("stop-color", "#1a1a1a");
      gradient.append("stop").attr("offset", "100%").attr("stop-color", "#222");

      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("rx", 8)
        .attr("ry", 8)
        .attr("fill", "url(#subtleGradient)")
        .attr("opacity", 0.5);
    }
  }, []);

  const monthLabel = new Date(today.getFullYear(), today.getMonth() + selectedMonthOffset).toLocaleString('default', { month: 'long', year: 'numeric' });
  const isCurrentMonth = selectedMonthOffset === 0;

  return (
    <div 
      className="total-balance-card" 
      ref={cardRef}
      style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px' }}
    >
      <div className="label" style={{ marginBottom: '0.5rem', color: '#aaa', position: 'relative', zIndex: 1 }}>
        Total Balance – {monthLabel}
      </div>

      {/* Arrows */}
      <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: '0.5rem', zIndex: 2 }}>
        <button onClick={() => setSelectedMonthOffset(offset => offset - 1)}>&larr;</button>
        <button onClick={() => setSelectedMonthOffset(offset => Math.min(offset + 1, 0))} disabled={isCurrentMonth}>&rarr;</button>
      </div>

      {isLoading ? (
        <div className="loading-indicator" style={{ position: 'relative', zIndex: 1 }}>Loading...</div>
      ) : error ? (
        <div className="error-message" style={{ color: '#e74c3c', position: 'relative', zIndex: 1 }}>Error loading balance</div>
      ) : (
        <>
          <div className="balance-amount" style={{ position: 'relative', zIndex: 1 }}>
            ${displayedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="balance-growth" style={{ color: balanceData.growth >= 0 ? '#2ecc71' : '#e74c3c', marginTop: '0.25rem', position: 'relative', zIndex: 1 }}>
            {balanceData.growth >= 0 ? '↑' : '↓'} {Math.abs(balanceData.growth).toFixed(2)}%
            <span style={{ fontSize: '0.8em', color: '#aaa', marginLeft: '0.5rem' }}>vs last month</span>
          </div>
        </>
      )}
    </div>
  );
};

export default TotalBalance;
