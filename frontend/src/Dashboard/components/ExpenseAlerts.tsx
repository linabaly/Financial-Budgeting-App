import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { API_BASE_URL } from '../../config';

// Define interface for Alert objects
interface Alert {
  type: 'danger' | 'warning' | 'info';
  message: string;
  id?: string; // Unique ID for each alert
}

// Define interfaces for data from API
interface Transaction {
  id: string;
  descriptor: string;
  date: string;
  amount: number;
  category: string;
  type: string;
  postedAt: string;
}

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentSaved: number;
  deadline?: string;
  createdAt?: string;
}

const ExpenseAlerts: React.FC = () => {
  const alertsRef = useRef<HTMLDivElement>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch transaction data from API
  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No token found.");
      }
      
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
    
      // Format transactions for display and analysis
      const formattedTransactions = data.map((transaction: any) => ({
        id: transaction.id,
        descriptor: transaction.descriptor,
        date: new Date(transaction.postedAt).toLocaleDateString('en-US'),
        amount: parseFloat(transaction.amount),
        category: transaction.category,
        type: transaction.type,
        postedAt: transaction.postedAt
      }));
  
      setTransactions(formattedTransactions);
      return formattedTransactions;
      
    } catch (error: any) {
      console.error("Error fetching transactions:", error.message);
      setError(error.message);
      return [];
    }
  };

  // Fetch goals data from API
  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`${API_BASE_URL}/goal`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });

      // Handle empty response (204 No Content)
      if (response.status === 204) {
        return [];
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch goals');
      }

      const data = await response.json();
      setGoals(data);
      return data;
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching goals');
      console.error('Error fetching goals:', err);
      return [];
    }
  };

  // Analyze data and generate alerts
  const generateAlerts = (transactions: Transaction[], goals: Goal[]) => {
    const newAlerts: Alert[] = [];
    
    // Only proceed if we have data to analyze
    if (transactions.length === 0) {
      return [{ type: 'info' as 'info', message: "Add transactions to see personalized alerts", id: "no-transactions" }];
    }
    
    // 1. Check for budget overspending by category
    const categorySpending = analyzeSpendingByCategory(transactions);
    
    // 2. Check month-over-month spending comparison
    const monthlyComparison = compareMonthlySpending(transactions);
    if (monthlyComparison.percentChange > 25) {
      newAlerts.push({
        type: 'warning',
        message: `Your spending is ${monthlyComparison.percentChange.toFixed(0)}% higher this month compared to last month.`,
        id: "monthly-increase"
      });
    } else if (monthlyComparison.percentChange < -10) {
      newAlerts.push({
        type: 'info',
        message: `Your spending has decreased by ${Math.abs(monthlyComparison.percentChange).toFixed(0)}% this month compared to last month.`,
        id: "monthly-decrease"
      });
    }
    
    // 3. Check for large recent transactions
    const largeTransactions = findLargeTransactions(transactions);
    if (largeTransactions.length > 0) {
      newAlerts.push({
        type: 'warning',
        message: `You had ${largeTransactions.length} unusually large expense${largeTransactions.length > 1 ? 's' : ''} recently.`,
        id: "large-transactions"
      });
    }
    
    // 4. Alert for categories where spending is over typical amount
    for (const category in categorySpending) {
      if (categorySpending[category].isOverTypical) {
        newAlerts.push({
          type: 'danger',
          message: `You're over budget in ${formatCategoryName(category)}!`,
          id: `over-budget-${category.toLowerCase()}`
        });
      }
    }
    
    // 5. Check goal progress and deadline proximity
    if (goals.length > 0) {
      goals.forEach(goal => {
        const progressPercent = (goal.currentSaved / goal.targetAmount) * 100;
        
        if (progressPercent < 30 && goal.deadline) {
          // Calculate days remaining
          const deadlineDate = new Date(goal.deadline);
          const today = new Date();
          const timeRemaining = deadlineDate.getTime() - today.getTime();
          const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
          
          if (daysRemaining < 30) {
            newAlerts.push({
              type: 'danger',
              message: `Your goal "${goal.name}" is only ${progressPercent.toFixed(0)}% complete with ${daysRemaining} days remaining.`,
              id: `goal-behind-${goal.id}`
            });
          }
        }
      });
    }
    
    // If we have too many alerts, prioritize them
    if (newAlerts.length > 3) {
      // Sort by priority (danger > warning > info)
      newAlerts.sort((a, b) => {
        const priorityMap = { danger: 3, warning: 2, info: 1 };
        return priorityMap[b.type] - priorityMap[a.type];
      });
      
      // Limit to 3 alerts
      return newAlerts.slice(0, 3);
    }
    
    // If we don't have enough alerts, add some generic ones
    if (newAlerts.length === 0) {
      newAlerts.push({
        type: 'info',
        message: "No issues detected with your spending this month.",
        id: "no-issues"
      });
    }
    
    if (newAlerts.length === 1) {
      newAlerts.push({
        type: 'info',
        message: "Keep tracking your transactions to get more detailed insights.",
        id: "keep-tracking"
      });
    }
    
    if (newAlerts.length === 2 && !goals.length) {
      newAlerts.push({
        type: 'info',
        message: "Set a savings goal to track your progress toward financial objectives.",
        id: "set-goal"
      });
    }
    
    return newAlerts;
  };
  
  // Helper functions for analysis
  
  const analyzeSpendingByCategory = (transactions: Transaction[]) => {
    // TODO: will be replaced with users' set budgets
    const categoryThresholds: { [key: string]: number } = {
      FOOD: 500,
      RENT: 1500,
      UTILITIES: 300,
      ENTERTAINMENT: 200,
      TRANSPORTATION: 300,
      PERSONAL: 250,
      HEALTHCARE: 200,
      OTHER: 250
    };
    
    // Get current month and year
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Calculate total spending by category for current month
    const categorySpending: { 
      [key: string]: { 
        total: number, 
        transactions: Transaction[],
        isOverTypical: boolean
      } 
    } = {};
    
    // Initialize category spending
    Object.keys(categoryThresholds).forEach(category => {
      categorySpending[category] = {
        total: 0,
        transactions: [],
        isOverTypical: false
      };
    });
    
    // Sum expenses by category for current month
    transactions.forEach(transaction => {
      if (transaction.type === 'EXPENSE') {
        const transactionDate = new Date(transaction.postedAt);
        if (transactionDate.getMonth() === currentMonth && 
            transactionDate.getFullYear() === currentYear) {
          
          if (categorySpending[transaction.category]) {
            categorySpending[transaction.category].total += transaction.amount;
            categorySpending[transaction.category].transactions.push(transaction);
            
            // Check if over threshold
            if (categorySpending[transaction.category].total > categoryThresholds[transaction.category]) {
              categorySpending[transaction.category].isOverTypical = true;
            }
          }
        }
      }
    });
    
    return categorySpending;
  };
  
  const compareMonthlySpending = (transactions: Transaction[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentYear = now.getFullYear();
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    let currentMonthTotal = 0;
    let lastMonthTotal = 0;
    
    transactions.forEach(transaction => {
      if (transaction.type === 'EXPENSE') {
        const transactionDate = new Date(transaction.postedAt);
        const transMonth = transactionDate.getMonth();
        const transYear = transactionDate.getFullYear();
        
        if (transMonth === currentMonth && transYear === currentYear) {
          currentMonthTotal += transaction.amount;
        } else if (transMonth === lastMonth && transYear === lastMonthYear) {
          lastMonthTotal += transaction.amount;
        }
      }
    });
    
    // Avoid division by zero
    if (lastMonthTotal === 0) return { percentChange: 0 };
    
    const percentChange = ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
    return { percentChange, currentMonthTotal, lastMonthTotal };
  };
  
  const findLargeTransactions = (transactions: Transaction[]) => {
    // Find recent transactions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Get expense transactions only
    const expenseTransactions = transactions.filter(t => 
      t.type === 'EXPENSE' && new Date(t.postedAt) >= sevenDaysAgo
    );
    
    if (expenseTransactions.length < 5) return []; // Not enough data
    
    // Calculate average and standard deviation
    const amounts = expenseTransactions.map(t => t.amount);
    const avg = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
    const variance = amounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    
    // Find transactions more than 2 standard deviations from mean
    const threshold = avg + (2 * stdDev);
    return expenseTransactions.filter(t => t.amount > threshold);
  };
  
  const formatCategoryName = (category: string): string => {
    return category.charAt(0) + category.slice(1).toLowerCase();
  };

  // Fetch data and generate alerts on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const transactionData = await fetchTransactions();
        const goalData = await fetchGoals();
        
        // Generate alerts based on the data
        const generatedAlerts = generateAlerts(transactionData, goalData);
        setAlerts(generatedAlerts);
      } catch (err) {
        console.error("Error analyzing data:", err);
        setAlerts([{ 
          type: 'warning' as 'warning', 
          message: "Unable to generate personalized alerts at this time.",
          id: "error-alert"
        }]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Render alerts with D3
  useEffect(() => {
    if (alertsRef.current && !isLoading) {
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
  }, [alerts, isLoading]);
  
  return (
    <div className="expense-alerts widget">
      <div className="widget-header">
        <div className="section-header">Expense Alerts & Warnings</div>
      </div>
      <div className="widget-body">
        {isLoading ? (
          <div className="loading-alerts">Loading alerts...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="alerts-list" ref={alertsRef}></div>
        )}
      </div>
    </div>
  );
};

export default ExpenseAlerts;