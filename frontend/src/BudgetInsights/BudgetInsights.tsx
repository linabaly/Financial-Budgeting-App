import React, { useEffect, useRef, useState } from 'react';
import './BudgetInsights.css';
import Header from '../Dashboard/components/Header';
import Footer from '../Dashboard/components/Footer';
import { generateEnhancedPieChart, generateMonthlyComparisonChart } from './utils/insightChartUtils';

/**
 * Expense category structure used for visualizations and analysis
 * Each category includes all data needed for display and 50-30-20 rule calculations
 */
interface ExpenseCategory {
  id: string;                      // Unique identifier for category styling and referencing
  category: string;                // Display name 
  value: number;                   // Monetary amount
  color: string;                   // HEX color code for visualizations
  percentage: number;              // Pre-calculated percentage of total expenses
  type: 'needs' | 'wants' | 'savings'; // Category type for 50-30-20 budgeting rule
}

/**
 * Sample expense data categorized according to the 50-30-20 budgeting rule
 * - Needs: Essential expenses that must be paid (50% target)
 * - Wants: Discretionary spending (30% target)
 * - Savings: Not tracked as an expense but calculated separately (20% target)
 */
const expenseData: ExpenseCategory[] = [
  { id: 'rent', category: 'Rent', value: 1500, color: '#e74c3c', percentage: 48.8, type: 'needs' },
  { id: 'groceries', category: 'Groceries', value: 600, color: '#2ecc71', percentage: 24.3, type: 'needs' },
  { id: 'utilities', category: 'Utilities', value: 300, color: '#2ed8c7', percentage: 14.6, type: 'needs' },
  { id: 'entertainment', category: 'Entertainment', value: 200, color: '#e57373', percentage: 12.3, type: 'wants' },
];

// Financial constants used throughout the component
const MONTHLY_INCOME = 4800;      // Monthly income for 50-30-20
const REMAINING_BUDGET = 10300;   // Amount left in budget
const TOTAL_EXPENSES = 3500;      // Sum of all expenses
const TOTAL_SAVED = 900;          // Amount saved this period

/**
 * BudgetInsights Component
 * 
 * A financial dashboard that visualizes budget allocation and provides AI-generated
 * financial insights based on the 50-30-20 budgeting rule.
 */
const BudgetInsights: React.FC = () => {
  // Chart container references
  const pieChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  
  // Report state management
  const [report, setReport] = useState<string>(
    'Click the "Generate AI Insights" button to analyze your spending patterns and receive personalized recommendations based on the 50-30-20 budgeting rule.'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);
  
  /**
   * Initialize and rerender charts when component mounts or window resizes
   */
  useEffect(() => {
    // Function to render both chart visualizations
    const renderCharts = () => {
      if (pieChartRef.current) {
        generateEnhancedPieChart(pieChartRef.current, expenseData);
      }
      
      if (barChartRef.current) {
        generateMonthlyComparisonChart(barChartRef);
      }
    };
    
    // Initial chart rendering
    renderCharts();
    
    // Set up responsive chart resizing
    window.addEventListener('resize', renderCharts);
    
    // Clean up event listener on unmount
    return () => window.removeEventListener('resize', renderCharts);
  }, []);

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
      
      const savingsTotal = TOTAL_SAVED;
      
      // Calculate percentage of income for each category
      const needsPercentage = (needsTotal / MONTHLY_INCOME) * 100;
      const wantsPercentage = (wantsTotal / MONTHLY_INCOME) * 100;
      const savingsPercentage = (savingsTotal / MONTHLY_INCOME) * 100;
      
      // Define 50-30-20 rule targets
      const needsIdeal = 50;
      const wantsIdeal = 30;
      const savingsIdeal = 20;
      
      // Calculate deviation from ideal targets
      const needsDifference = needsPercentage - needsIdeal;
      const wantsDifference = wantsPercentage - wantsIdeal;
      const savingsDifference = savingsPercentage - savingsIdeal;
      
      // Generate the financial report with markdown formatting
      const newReport = `
# Financial Insights: 50-30-20 Rule Analysis

## Your Current Allocation
- **Needs:** $${needsTotal.toFixed(2)} (${needsPercentage.toFixed(1)}% of income)
- **Wants:** $${wantsTotal.toFixed(2)} (${wantsPercentage.toFixed(1)}% of income)
- **Savings:** $${savingsTotal.toFixed(2)} (${savingsPercentage.toFixed(1)}% of income)

## Ideal 50-30-20 Allocation
- **Needs (50%):** $${(MONTHLY_INCOME * 0.5).toFixed(2)}
- **Wants (30%):** $${(MONTHLY_INCOME * 0.3).toFixed(2)}
- **Savings (20%):** $${(MONTHLY_INCOME * 0.2).toFixed(2)}

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
1. ${needsPercentage > 50 ? `Reduce needs spending by $${((needsPercentage - 50) * MONTHLY_INCOME / 100).toFixed(2)} per month` : `Maintain your current spending on needs`}
2. ${wantsPercentage > 30 ? `Reduce discretionary spending by $${((wantsPercentage - 30) * MONTHLY_INCOME / 100).toFixed(2)} per month` : `Maintain your current level of discretionary spending`}
3. ${savingsPercentage < 20 ? `Increase savings by $${((20 - savingsPercentage) * MONTHLY_INCOME / 100).toFixed(2)} per month` : `Continue your excellent savings habits`}

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
  
  return (
    <div className="app">
      <Header />
      
      <main className="insights-content">
        {/* Financial Summary Cards Section */}
        <div className="insights-summary">
          <div className="summary-card">
            <div className="summary-inner">
              <h3>Remaining Budget</h3>
              <div className="amount positive">${REMAINING_BUDGET.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-inner">
              <h3>Total Expenses</h3>
              <div className="amount negative">${TOTAL_EXPENSES.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-inner">
              <h3>Total Saved</h3>
              <div className="amount positive">${TOTAL_SAVED.toLocaleString()}</div>
            </div>
          </div>
        </div>
        
        {/* Expense Breakdown Pie Chart Section */}
        <div className="chart-container pie-chart-container">
          <div className="pie-chart-wrapper" ref={pieChartRef}></div>
          
          <div className="legend-container">
            {expenseData.map(expense => (
              <div className="legend-item" key={expense.id}>
                <div className={`legend-color ${expense.id}`}></div>
                <div className="legend-name">{expense.category}</div>
                <div className="legend-value">${expense.value.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Monthly Comparison and Financial Report Section */}
        <div className="bottom-container">
          {/* Monthly Comparison Chart */}
          <div className="chart-container bar-chart-container">
            <div className="bar-chart-wrapper" ref={barChartRef}></div>
          </div>
          
          {/* AI Financial Analysis */}
          <div className="category-details">
            <div className="insights-header">
              <h3>Financial Analysis</h3>
              
              <button 
                className={`generate-btn ${isGenerating ? 'generating' : ''} ${reportGenerated ? 'regenerate' : ''}`}
                onClick={generateAiReport}
                disabled={isGenerating}
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