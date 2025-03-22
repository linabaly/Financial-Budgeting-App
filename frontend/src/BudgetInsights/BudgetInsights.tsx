import React, { useEffect, useRef, useState } from 'react';
import './BudgetInsights.css';
import Header from '../Dashboard/components/Header';
import Footer from '../Dashboard/components/Footer';
import { generateExpensePieChart, generateMonthlyComparisonChart } from './utils/insightChartUtils';

// Define the expense data structure
interface ExpenseCategory {
  category: string;
  value: number;
  color: string;
  percentage: number;
  type: 'needs' | 'wants' | 'savings'; // Categorization for 50-30-20 rule
}

// Sample expense data with categorization for 50-30-20 rule
const expenseData: ExpenseCategory[] = [
  { category: 'Rent', value: 1500, color: '#e74c3c', percentage: 48.8, type: 'needs' },
  { category: 'Groceries', value: 600, color: '#2ecc71', percentage: 24.3, type: 'needs' },
  { category: 'Entertainment', value: 200, color: '#e57373', percentage: 12.3, type: 'wants' },
  { category: 'Utilities', value: 300, color: '#2ed8c7', percentage: 14.6, type: 'needs' },
];

// Additional data - monthly income for 50-30-20 calculations
const monthlyIncome = 4800;

const BudgetInsights: React.FC = () => {
  const pieChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  const [report, setReport] = useState<string>('Click the "Generate AI Insights" button to analyze your spending patterns and receive personalized recommendations based on the 50-30-20 budgeting rule.');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);
  
  useEffect(() => {
    // Initialize charts when component mounts
    if (pieChartRef.current) {
      generateExpensePieChart(pieChartRef);
    }
    
    if (barChartRef.current) {
      generateMonthlyComparisonChart(barChartRef);
    }
    
    // Handle resize events
    const handleResize = () => {
      if (pieChartRef.current) {
        generateExpensePieChart(pieChartRef);
      }
      
      if (barChartRef.current) {
        generateMonthlyComparisonChart(barChartRef);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to generate AI insights based on 50-30-20 rule
  const generateAiReport = () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Calculate insights
      const totalSpent = expenseData.reduce((sum, item) => sum + item.value, 0);
      
      // Calculate current allocation
      const needsTotal = expenseData
        .filter(item => item.type === 'needs')
        .reduce((sum, item) => sum + item.value, 0);
      
      const wantsTotal = expenseData
        .filter(item => item.type === 'wants')
        .reduce((sum, item) => sum + item.value, 0);
      
      const savingsTotal = 900; // Based on the provided "Total Saved" value
      
      // Calculate percentages of income
      const needsPercentage = (needsTotal / monthlyIncome) * 100;
      const wantsPercentage = (wantsTotal / monthlyIncome) * 100;
      const savingsPercentage = (savingsTotal / monthlyIncome) * 100;
      
      // Determine if allocations meet the 50-30-20 rule
      const needsIdeal = 50;
      const wantsIdeal = 30;
      const savingsIdeal = 20;
      
      const needsDifference = needsPercentage - needsIdeal;
      const wantsDifference = wantsPercentage - wantsIdeal;
      const savingsDifference = savingsPercentage - savingsIdeal;
      
      // Generate the report text with 50-30-20 analysis
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
    }, 2000); // Simulate a 2 second delay for "AI processing"
  };
  
  return (
    <div className="app">
      <Header />
      
      <main className="insights-content">
        {/* Top Cards Section */}
        <div className="insights-summary">
          <div className="summary-card">
            <div className="summary-inner">
              <h3>Remaining Budget</h3>
              <div className="amount positive">$10,300</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-inner">
              <h3>Total Expenses</h3>
              <div className="amount negative">$3,500</div>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-inner">
              <h3>Total Saved</h3>
              <div className="amount positive">$900</div>
            </div>
          </div>
        </div>
        
        {/* Pie Chart Section */}
        <div className="chart-container pie-chart-container">
          <div className="pie-chart-wrapper" ref={pieChartRef}></div>
          <div className="legend-container">
            <div className="legend-item">
              <div className="legend-color rent"></div>
              <div className="legend-name">Rent</div>
              <div className="legend-value">$ 1,500</div>
            </div>
            <div className="legend-item">
              <div className="legend-color groceries"></div>
              <div className="legend-name">Groceries</div>
              <div className="legend-value">$ 600</div>
            </div>
            <div className="legend-item">
              <div className="legend-color entertainment"></div>
              <div className="legend-name">Entertainment</div>
              <div className="legend-value">$ 200</div>
            </div>
            <div className="legend-item">
              <div className="legend-color utilities"></div>
              <div className="legend-name">Utilities</div>
              <div className="legend-value">$ 300</div>
            </div>
          </div>
        </div>
        
        {/* Bar Chart and Details Section */}
        <div className="bottom-container">
          <div className="chart-container bar-chart-container">
            <div className="bar-chart-wrapper" ref={barChartRef}></div>
          </div>
          
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
                {report.split('\n').map((line, index) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={index}>{line.substring(2)}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={index}>{line.substring(3)}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={index}>{line.substring(4)}</h3>;
                  } else if (line.startsWith('- ')) {
                    return <p key={index} className="list-item">{line}</p>;
                  } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
                    return <p key={index} className="numbered-item">{line}</p>;
                  } else {
                    return <p key={index}>{line}</p>;
                  }
                })}
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