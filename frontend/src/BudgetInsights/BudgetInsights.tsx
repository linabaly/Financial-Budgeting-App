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
  const generateAiReport = () => {
    setIsGenerating(true);
    
    // Simulate API call delay (would be a real API call in production)
    setTimeout(() => {
      // Calculate current spending allocation by category type
      const needsTotal = expenseData
        .filter(item => item.type === 'needs')
        .reduce((sum, item) => sum + item.value, 0);
      
      const wantsTotal = expenseData
        .filter(item => item.type === 'wants')
        .reduce((sum, item) => sum + item.value, 0);
      
      const savingsTotal = totalSaved;
      
      // Calculate percentage of income for each category
      const needsPercentage = monthlyIncome > 0 ? (needsTotal / monthlyIncome) * 100 : 0;
      const wantsPercentage = monthlyIncome > 0 ? (wantsTotal / monthlyIncome) * 100 : 0;
      const savingsPercentage = monthlyIncome > 0 ? (savingsTotal / monthlyIncome) * 100 : 0;
      
      // Define 50-30-20 rule targets
      const needsIdeal = 50;
      const wantsIdeal = 30;
      const savingsIdeal = 20;
      
      // Calculate deviation from ideal targets
      const needsDifference = needsPercentage - needsIdeal;
      const wantsDifference = wantsPercentage - wantsIdeal;
      const savingsDifference = savingsPercentage - savingsIdeal;
      
      // Use the same recommended percentages as defined in insightChartUtils
      // for consistency between the chart and the report
      const suggestedPercentages = recommendedAllocationPercentages;
      
      // Calculate category analysis
      const categoryAnalysis = expenseData
        .filter(cat => cat.id !== 'income') // Exclude income from analysis
        .map(cat => {
          const suggestedPercentage = suggestedPercentages[cat.id as keyof typeof suggestedPercentages] || 5;
          const suggestedAmount = monthlyIncome * (suggestedPercentage / 100);
          const actualAmount = cat.value;
          const difference = actualAmount - suggestedAmount;
          const percentDifference = suggestedAmount > 0 ? (difference / suggestedAmount) * 100 : 0;
          
          return {
            category: cat.category,
            actual: actualAmount,
            suggested: suggestedAmount,
            difference,
            percentDifference
          };
        })
        .filter(cat => Math.abs(cat.percentDifference) > 20) // Only include significant differences
        .sort((a, b) => Math.abs(b.percentDifference) - Math.abs(a.percentDifference)); // Sort by largest difference
      
      // Generate category-specific recommendations
      const categoryRecommendations = categoryAnalysis.map(cat => {
        const isOverspending = cat.difference > 0;
        
        if (isOverspending) {
          return `- **${cat.category}**: Spending ${cat.percentDifference.toFixed(0)}% more than suggested ($${cat.actual.toFixed(0)} vs suggested $${cat.suggested.toFixed(0)}). Consider ${
            cat.category === 'Rent' ? 'looking for more affordable housing options or getting a roommate' :
            cat.category === 'Food' ? 'meal planning, buying groceries in bulk, or reducing dining out' :
            cat.category === 'Entertainment' ? 'finding free or low-cost alternatives for entertainment' :
            cat.category === 'Transportation' ? 'using public transportation, carpooling, or biking when possible' :
            cat.category === 'Personal' ? 'creating a dedicated budget for personal expenses and sticking to it' :
            cat.category === 'Utilities' ? 'reducing energy consumption or negotiating better rates with providers' :
            cat.category === 'Healthcare' ? 'reviewing your healthcare plans for more cost-effective options' :
            'reviewing your spending in this category for potential savings'
          }.`;
        } else {
          return `- **${cat.category}**: Good job! You're spending ${Math.abs(cat.percentDifference).toFixed(0)}% less than suggested ($${cat.actual.toFixed(0)} vs suggested $${cat.suggested.toFixed(0)}), which helps with your overall budget.`;
        }
      }).join('\n');
      
      // Generate the financial report with markdown formatting
      const newReport = `
# Financial Insights: 50-30-20 Rule Analysis

## Your Current Allocation
- **Needs:** $${needsTotal.toFixed(2)} (${needsPercentage.toFixed(1)}% of income)
- **Wants:** $${wantsTotal.toFixed(2)} (${wantsPercentage.toFixed(1)}% of income)
- **Savings:** $${savingsTotal.toFixed(2)} (${savingsPercentage.toFixed(1)}% of income)

## Ideal 50-30-20 Allocation
- **Needs (50%):** $${(monthlyIncome * 0.5).toFixed(2)}
- **Wants (30%):** $${(monthlyIncome * 0.3).toFixed(2)}
- **Savings (20%):** $${(monthlyIncome * 0.2).toFixed(2)}

## Key Observations
${needsDifference > 5 ? `- ⚠️ Your spending on needs is ${needsDifference.toFixed(1)}% higher than recommended.` : 
  needsDifference < -5 ? `- 👍 Your spending on needs is ${Math.abs(needsDifference).toFixed(1)}% lower than the 50% recommendation, which gives you flexibility.` :
  `- ✅ Your spending on needs is very close to the ideal 50% target.`}

${wantsDifference > 5 ? `- ⚠️ Your discretionary spending is ${wantsDifference.toFixed(1)}% higher than recommended.` : 
  wantsDifference < -5 ? `- 👍 Your discretionary spending is ${Math.abs(wantsDifference).toFixed(1)}% lower than the 30% recommendation, showing good restraint.` :
  `- ✅ Your discretionary spending is very close to the ideal 30% target.`}

${savingsDifference > 5 ? `- 🎉 Your savings rate is ${savingsDifference.toFixed(1)}% higher than recommended - excellent job!` : 
  savingsDifference < -5 ? `- ⚠️ Your savings rate is ${Math.abs(savingsDifference).toFixed(1)}% lower than the 20% recommendation.` :
  `- ✅ Your savings rate is very close to the ideal 20% target.`}

## Category Analysis 
### Based on Monthly Income: $${monthlyIncome.toFixed(2)}
${categoryRecommendations || '- All your category spending is within reasonable ranges of the suggested amounts.'}

## Personalized Recommendations

${needsPercentage > 60 ? `### Optimizing Essential Expenses
Your spending on essential needs is significantly higher than the recommended 50%. Consider:
- Exploring more affordable housing options (your largest expense)
- Negotiating utility bills or finding more economical plans
- Meal planning to reduce grocery expenses
- Refinancing any high-interest debt` : ''}

${wantsPercentage > 35 ? `### Managing Discretionary Spending
Your "wants" category exceeds the 30% recommendation. Try:
- Creating a separate fun money account with a fixed monthly transfer
- Implementing a 24-hour rule before making non-essential purchases
- Finding free or low-cost alternatives for entertainment
- Using cash-back or rewards programs for discretionary purchases` : ''}

${savingsPercentage < 15 ? `### Boosting Your Savings
Your current savings rate is below the recommended 20%. Consider:
- Setting up automatic transfers to savings on payday
- Starting with small increases (1-2% of income) to your savings rate
- Exploring higher-yield savings options
- Looking for additional income opportunities` : 
 savingsPercentage > 25 ? `### Maximizing Your Savings
You're exceeding the 20% savings target, which is excellent! Consider:
- Diversifying your savings into different investment vehicles
- Creating specific savings buckets for short, medium, and long-term goals
- Exploring tax-advantaged savings options
- Ensuring you have an adequate emergency fund before focusing on other savings goals` : ''}

## Action Plan
1. ${needsPercentage > 50 ? `Reduce needs spending by $${((needsPercentage - 50) * monthlyIncome / 100).toFixed(2)} per month` : `Maintain your current spending on needs`}
2. ${wantsPercentage > 30 ? `Reduce discretionary spending by $${((wantsPercentage - 30) * monthlyIncome / 100).toFixed(2)} per month` : `Maintain your current level of discretionary spending`}
3. ${savingsPercentage < 20 ? `Increase savings by $${((20 - savingsPercentage) * monthlyIncome / 100).toFixed(2)} per month` : `Continue your excellent savings habits`}

The 50-30-20 rule is a guideline, not a strict requirement. Your unique financial situation may require different allocations, but this analysis provides a starting point for optimizing your financial health.
      `;
      
      setReport(newReport);
      setIsGenerating(false);
      setReportGenerated(true);
    }, 2000);
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
          <div className="category-details">
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
            
            <div className={`report-container ${reportGenerated ? 'has-content' : ''}`}>
              <div className="report-content">
                {report.split('\n').map(renderMarkdownLine)}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BudgetInsights;