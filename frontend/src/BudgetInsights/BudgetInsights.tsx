import React, { useEffect, useRef, useState } from 'react';
import './BudgetInsights.css';
import Header from '../Dashboard/components/Header';
import Footer from '../Dashboard/components/Footer';
import { ExpenseCategory, generateEnhancedPieChart, generateMonthlyComparisonChart, recommendedAllocationPercentages } from './utils/insightChartUtils';
import * as d3 from 'd3';
import { API_BASE_URL } from "./../config";

interface BudgetInsightsProps {
  onTransactionChange?: boolean;
}

/**
 * BudgetInsights Component
 * 
 * A financial dashboard that visualizes budget allocation and provides AI-generated
 * financial insights based on the 50-30-20 budgeting rule.
 */
const BudgetInsights: React.FC<BudgetInsightsProps> = ({ onTransactionChange = false }) => {
  // Chart container references
  const pieChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  
  // Financial data state
  const [transactions, setTransactions] = useState<any[]>([]);
  const [expenseData, setExpenseData] = useState<ExpenseCategory[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [remainingBudget, setRemainingBudget] = useState<number>(0);
  const [totalSaved, setTotalSaved] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation state
  const today = new Date();
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0);
  
  // Report state management
  const [report, setReport] = useState<string>(
    'Click the "Generate AI Insights" button to analyze your spending patterns and receive personalized recommendations based on the 50-30-20 budgeting rule.'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);
  
  /**
   * Fetch transaction data from API
   */
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

  /**
   * Process transaction data and calculate financial metrics
   */
  useEffect(() => {
    if (isLoading || error || transactions.length === 0) return;
    
    // For pie chart visualization, we may want to filter out the income category
    // when displaying expense breakdown only
    const shouldIncludeIncomeInPieChart = false; // Set to true if you want income in the pie chart

    const currentDate = new Date();
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + selectedMonthOffset, 1);
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    // Initialize category accumulators
    const categories: Record<string, { 
      id: string, 
      category: string, 
      value: number, 
      color: string, 
      type: 'needs' | 'wants' | 'savings' 
    }> = {
      'food': { id: 'food', category: 'Food', value: 0, color: '#2ecc71', type: 'needs' },
      'rent': { id: 'rent', category: 'Rent', value: 0, color: '#e74c3c', type: 'needs' },
      'utilities': { id: 'utilities', category: 'Utilities', value: 0, color: '#2ed8c7', type: 'needs' },
      'healthcare': { id: 'healthcare', category: 'Healthcare', value: 0, color: '#3498db', type: 'needs' },
      'entertainment': { id: 'entertainment', category: 'Entertainment', value: 0, color: '#e57373', type: 'wants' },
      'personal': { id: 'personal', category: 'Personal', value: 0, color: '#9b59b6', type: 'wants' },
      'transportation': { id: 'transportation', category: 'Transportation', value: 0, color: '#f39c12', type: 'needs' },
      'income': { id: 'income', category: 'Income', value: 0, color: '#27ae60', type: 'savings' },
      'other': { id: 'other', category: 'Other', value: 0, color: '#95a5a6', type: 'wants' }
    };

    let totalIncome = 0;
    let totalExpense = 0;
    
    // Process transactions for the target month
    transactions.forEach((tx: any) => {
      const amount = parseFloat(tx.amount);
      const postedDate = new Date(tx.postedAt);
      const month = postedDate.getMonth();
      const year = postedDate.getFullYear();

      if (month === targetMonth && year === targetYear) {
        if (tx.type === 'INCOME') {
          totalIncome += amount;
          // Also track income in the income category for the pie chart
          categories.income.value += amount;
        } else if (tx.type === 'EXPENSE') {
          totalExpense += amount;
          
          // Map transaction to a category based on its description or category field
          // This is a simplified example and would need to be adjusted based on your actual data structure
          if (tx.category) {
            const categoryLower = tx.category.toLowerCase();
            
            if (categoryLower.includes('rent') || categoryLower.includes('mortgage') || categoryLower.includes('housing')) {
              categories.rent.value += amount;
            } else if (categoryLower.includes('groceries') || categoryLower.includes('food') || categoryLower.includes('restaurant') || categoryLower.includes('dining')) {
              categories.food.value += amount;
            } else if (categoryLower.includes('utilities') || categoryLower.includes('bill') || categoryLower.includes('electricity') || categoryLower.includes('water') || categoryLower.includes('internet')) {
              categories.utilities.value += amount;
            } else if (categoryLower.includes('health') || categoryLower.includes('medical') || categoryLower.includes('doctor') || categoryLower.includes('pharmacy')) {
              categories.healthcare.value += amount;
            } else if (categoryLower.includes('entertainment') || categoryLower.includes('fun') || categoryLower.includes('movie') || categoryLower.includes('subscription')) {
              categories.entertainment.value += amount;
            } else if (categoryLower.includes('personal') || categoryLower.includes('clothing') || categoryLower.includes('beauty') || categoryLower.includes('haircut')) {
              categories.personal.value += amount;
            } else if (categoryLower.includes('transport') || categoryLower.includes('gas') || categoryLower.includes('car') || categoryLower.includes('bus') || categoryLower.includes('uber')) {
              categories.transportation.value += amount;
            } else {
              categories.other.value += amount;
            }
          } else if (tx.description) {
            // Try to categorize based on description if category is not available
            const descLower = tx.description.toLowerCase();
            
            if (descLower.includes('rent') || descLower.includes('mortgage') || descLower.includes('apartment')) {
              categories.rent.value += amount;
            } else if (descLower.includes('grocery') || descLower.includes('food') || descLower.includes('restaurant') || descLower.includes('cafe')) {
              categories.food.value += amount;
            } else if (descLower.includes('utility') || descLower.includes('electric') || descLower.includes('water') || descLower.includes('internet') || descLower.includes('phone')) {
              categories.utilities.value += amount;
            } else if (descLower.includes('doctor') || descLower.includes('medical') || descLower.includes('pharmacy') || descLower.includes('health')) {
              categories.healthcare.value += amount;
            } else if (descLower.includes('movie') || descLower.includes('netflix') || descLower.includes('entertainment') || descLower.includes('game')) {
              categories.entertainment.value += amount;
            } else if (descLower.includes('clothing') || descLower.includes('personal') || descLower.includes('haircut') || descLower.includes('salon')) {
              categories.personal.value += amount;
            } else if (descLower.includes('gas') || descLower.includes('uber') || descLower.includes('lyft') || descLower.includes('car') || descLower.includes('train') || descLower.includes('bus')) {
              categories.transportation.value += amount;
            } else {
              categories.other.value += amount;
            }
          } else {
            // Default category if no category or description field exists
            categories.other.value += amount;
          }
        }
      }
    });

    // Calculate savings (simple calculation: income - expenses)
    const savings = Math.max(0, totalIncome - totalExpense);
    
    // Calculate remaining budget
    const remaining = Math.max(0, totalIncome - totalExpense);

    // Calculate percentages for each category
    const totalExpenseAmount = totalExpense > 0 ? totalExpense : 1; // Prevent divide by zero
    const formattedCategories = Object.values(categories)
      .filter(cat => cat.value > 0) // Only include categories with values
      .filter(cat => shouldIncludeIncomeInPieChart || cat.id !== 'income') // Optionally exclude income from pie chart
      .map(cat => ({
        ...cat,
        percentage: cat.id === 'income' 
          ? (cat.value / (totalIncome > 0 ? totalIncome : 1)) * 100 // Income as percentage of total income
          : (cat.value / totalExpenseAmount) * 100 // Expenses as percentage of total expenses
      }));

    // Update state with calculated values
    setExpenseData(formattedCategories);
    setMonthlyIncome(totalIncome);
    setTotalExpenses(totalExpense);
    setRemainingBudget(remaining);
    setTotalSaved(savings);
  }, [transactions, selectedMonthOffset, isLoading, error]);

  /**
   * Initialize and rerender charts when component mounts or financial data changes
   */
  useEffect(() => {
    // Function to render both chart visualizations
    const renderCharts = () => {
      if (pieChartRef.current && expenseData.length > 0) {
        generateEnhancedPieChart(pieChartRef.current, expenseData);
      }
      
      if (barChartRef.current) {
        // Pass monthly income to the bar chart generation function
        generateMonthlyComparisonChart(barChartRef, expenseData, monthlyIncome);
      }
    };
    
    // Initial chart rendering
    renderCharts();
    
    // Set up responsive chart resizing
    window.addEventListener('resize', renderCharts);
    
    // Clean up event listener on unmount
    return () => window.removeEventListener('resize', renderCharts);
  }, [expenseData, monthlyIncome]);

  /**
   * Generates an AI financial insights report based on the 50-30-20 rule
   * Analyzes current spending patterns and provides personalized recommendations
   */
  const generateAiReport = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Missing token");
  
      const response = await fetch(`${API_BASE_URL}/insights/transactions-gpt`, {
        method: "GET",
        headers: {
          "Authorization": token,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to fetch AI report");
      }
  
      const html = await response.text();
      setReport(html); // Save HTML directly
      setReportGenerated(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  
  /**
   * Transforms markdown text into appropriate React elements
   * Handles headings, list items, and paragraphs
   * 
   * @param line Single line of markdown text
   * @param index Array index for React key prop
   * @returns Appropriate React element based on markdown syntax
   */
  const renderMarkdownLine = (line: string, index: number) => {
    if (line.startsWith('# ')) {
      return <h1 key={index}>{line.substring(2)}</h1>;
    } else if (line.startsWith('## ')) {
      return <h2 key={index}>{line.substring(3)}</h2>;
    } else if (line.startsWith('### ')) {
      return <h3 key={index}>{line.substring(4)}</h3>;
    } else if (line.startsWith('- ')) {
      return <p key={index} className="list-item">{line}</p>;
    } else if (/^[0-9]+\.\s/.test(line)) {
      return <p key={index} className="numbered-item">{line}</p>;
    } else {
      return <p key={index}>{line}</p>;
    }
  };

  const monthLabel = new Date(today.getFullYear(), today.getMonth() + selectedMonthOffset).toLocaleString('default', { month: 'long', year: 'numeric' });
  const isCurrentMonth = selectedMonthOffset === 0;
  
  return (
    <div className="app">
      <Header />
      
      <main className="insights-content">
        {/* Month navigation controls */}
        <div className="month-navigation" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{monthLabel}</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setSelectedMonthOffset(offset => offset - 1)}>&larr; Previous</button>
            <button onClick={() => setSelectedMonthOffset(offset => Math.min(offset + 1, 0))} disabled={isCurrentMonth}>Next &rarr;</button>
          </div>
        </div>
        
        {/* Financial Summary Cards Section */}
        <div className="insights-summary">
          <div className="summary-card">
            <div className="summary-inner">
              <h3>Remaining Budget</h3>
              {isLoading ? (
                <div className="loading-indicator">Loading...</div>
              ) : error ? (
                <div className="error-message">Error loading data</div>
              ) : (
                <div className="amount positive">${remainingBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              )}
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-inner">
              <h3>Total Expenses</h3>
              {isLoading ? (
                <div className="loading-indicator">Loading...</div>
              ) : error ? (
                <div className="error-message">Error loading data</div>
              ) : (
                <div className="amount negative">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              )}
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-inner">
              <h3>Monthly Income</h3>
              {isLoading ? (
                <div className="loading-indicator">Loading...</div>
              ) : error ? (
                <div className="error-message">Error loading data</div>
              ) : (
                <div className="amount positive">${monthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Expense Breakdown Pie Chart Section */}
        <div className="chart-container pie-chart-container">
          {isLoading ? (
            <div className="loading-indicator" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading expense data...</div>
          ) : error ? (
            <div className="error-message" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Error loading expense data</div>
          ) : expenseData.length === 0 ? (
            <div className="no-data-message" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No expense data available for this month</div>
          ) : (
            <>
              <div className="pie-chart-wrapper" ref={pieChartRef}></div>
              
              <div className="legend-container" style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '10px' }}>
                {expenseData.map(expense => (
                  <div className="legend-item" key={expense.id}>
                    <div className="legend-color" style={{ backgroundColor: expense.color }}></div>
                    <div className="legend-name">{expense.category}</div>
                    <div className="legend-value">${expense.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({expense.percentage.toFixed(1)}%)</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Monthly Comparison and Financial Report Section */}
        <div className="bottom-container">
          {/* Monthly Comparison Chart */}
          <div className="chart-container bar-chart-container">
            {isLoading ? (
              <div className="loading-indicator" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading comparison data...</div>
            ) : error ? (
              <div className="error-message" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Error loading comparison data</div>
            ) : expenseData.length === 0 ? (
              <div className="no-data-message" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No expense data available for this month</div>
            ) : (
              <div className="bar-chart-wrapper" ref={barChartRef}></div>
            )}
          </div>
          
          {/* AI Financial Analysis */}
          <div className="category-details full-width-report">
            <div className="insights-header">
              <h3>Financial Analysis</h3>
              
              <button 
                className={`generate-btn ${isGenerating ? 'generating' : ''} ${reportGenerated ? 'regenerate' : ''}`}
                onClick={generateAiReport}
                disabled={isGenerating || isLoading || error !== null || expenseData.length === 0}
              >
                {isGenerating ? (
                  <>
                    <span className="spinner"></span>
                    Analyzing Data...
                  </>
                ) : reportGenerated ? (
                  <>
                    <span className="btn-icon">↻</span>
                    Refresh Analysis
                  </>
                ) : (
                  <>
                    <span className="btn-icon">✨</span>
                    Generate AI Insights
                  </>
                )}
              </button>
            </div>
            
            <div
  className="report-content"
  dangerouslySetInnerHTML={{ __html: report }}
></div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BudgetInsights;