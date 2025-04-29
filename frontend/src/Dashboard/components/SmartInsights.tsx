import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { API_BASE_URL } from '../../config';
// Define interfaces for data types
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

interface Insight {
  title: string;
  description: string;
  actionable: string;
  icon: string;
  category: 'trends' | 'opportunities' | 'achievements';
}

const SmartInsights: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'trends' | 'opportunities' | 'achievements'>('trends');
  
  const insightsRef = useRef<HTMLDivElement>(null);
  
  // Fetch transaction data
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
    
      // Format transactions
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

  // Fetch goals data
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

      // Handle empty response
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

  // Generate financial insights that focus on trends, opportunities, and achievements
  const generateInsights = (transactions: Transaction[], goals: Goal[]): Insight[] => {
    const allInsights: Insight[] = [];
    
    // Only proceed if we have data to analyze
    if (transactions.length === 0) {
      return [{
        title: "No Transaction Data",
        description: "Add transactions to see AI-powered financial insights",
        actionable: "Track your spending to unlock powerful insights",
        icon: "📊",
        category: 'trends'
      }];
    }
    
    // ---------------------------------------
    // 1. TREND INSIGHTS
    // ---------------------------------------
    
    // Analyze weekly spending patterns
    const weekdaySpending = analyzeWeekdaySpending(transactions);
    const highestDay = Object.keys(weekdaySpending).reduce((a, b) => 
      weekdaySpending[a] > weekdaySpending[b] ? a : b
    );
    
    if (highestDay && weekdaySpending[highestDay] > 0) {
      allInsights.push({
        title: "Peak Spending Day",
        description: `You spend the most on ${highestDay}s, averaging $${Math.round(weekdaySpending[highestDay]/4)} per ${highestDay}.`,
        actionable: `Consider planning lower-cost activities on ${highestDay}s to reduce spending`,
        icon: "📆",
        category: 'trends'
      });
    }
    
    // Analyze spending by category
    const categorySpending = analyzeSpendingByCategory(transactions);
    const highestCategory = findHighestSpendingCategory(categorySpending);
    
    if (highestCategory) {
      allInsights.push({
        title: "Top Spending Category",
        description: `${formatCategoryName(highestCategory.category)} is your largest expense at $${highestCategory.amount.toFixed(0)} this month.`,
        actionable: `Set a budget limit for ${formatCategoryName(highestCategory.category.toLowerCase())} expenses`,
        icon: "🔝",
        category: 'trends'
      });
    }
    
    // Monthly spending trend
    const monthlyComparison = compareMonthlySpending(transactions);
    if (Math.abs(monthlyComparison.percentChange) > 10) {
      const trend = monthlyComparison.percentChange > 0 ? "increased" : "decreased";
      const icon = monthlyComparison.percentChange > 0 ? "📈" : "📉";
      
      allInsights.push({
        title: "Monthly Spending Trend",
        description: `Your spending has ${trend} by ${Math.abs(monthlyComparison.percentChange).toFixed(0)}% compared to last month.`,
        actionable: monthlyComparison.percentChange > 0 ? 
          "Review your recent purchases to identify areas to cut back" : 
          "Keep up the good work with your spending habits",
        icon: icon,
        category: 'trends'
      });
    }
    
    // Analyze income vs expense trends
    const incomeVsExpense = analyzeIncomeVsExpense(transactions);
    if (incomeVsExpense.income > 0) {
      const savingsRate = ((incomeVsExpense.income - incomeVsExpense.expense) / incomeVsExpense.income) * 100;
      const savingsIcon = savingsRate >= 15 ? "💰" : "💸";
      
      allInsights.push({
        title: "Savings Rate Trend",
        description: `Your current savings rate is ${Math.max(savingsRate, 0).toFixed(0)}% of your income.`,
        actionable: savingsRate < 15 ? 
          "Try to reach at least 15% savings rate for financial stability" : 
          "You're saving at a healthy rate. Consider investing your surplus",
        icon: savingsIcon,
        category: 'trends'
      });
    }
    
    // Category growth trends
    const categoryGrowth = analyzeCategoryGrowth(transactions);
    if (categoryGrowth.fastestGrowing) {
      allInsights.push({
        title: "Growing Expense Category",
        description: `Your ${formatCategoryName(categoryGrowth.fastestGrowing.category)} spending has increased by ${categoryGrowth.fastestGrowing.growthRate.toFixed(0)}% recently.`,
        actionable: "Monitor this category closely to prevent budget overruns",
        icon: "📈",
        category: 'trends'
      });
    }
    
    // ---------------------------------------
    // 2. OPPORTUNITY INSIGHTS
    // ---------------------------------------
    
    // Identify potential savings in specific categories
    const savingsOpportunities = findSavingsOpportunities(transactions);
    if (savingsOpportunities.length > 0) {
      const category = savingsOpportunities[0].category;
      const amount = savingsOpportunities[0].potentialSavings;
      
      allInsights.push({
        title: "Savings Opportunity",
        description: `You could save approximately $${amount.toFixed(0)}/month by optimizing ${formatCategoryName(category.toLowerCase())} expenses.`,
        actionable: `Try setting a specific ${formatCategoryName(category.toLowerCase())} budget that's 20% lower than current spending`,
        icon: "✂️",
        category: 'opportunities'
      });
    }
    
    // Identify subscription services that could be reconsidered
    const recurringPayments = identifyRecurringPayments(transactions);
    if (recurringPayments.length > 0) {
      const totalRecurring = recurringPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      allInsights.push({
        title: "Subscription Audit",
        description: `You spend approximately $${totalRecurring.toFixed(0)}/month on ${recurringPayments.length} subscription services.`,
        actionable: "Review your subscriptions and consider canceling unused services",
        icon: "🔄",
        category: 'opportunities'
      });
    }
    
    // Suggest refinancing opportunities based on major expenses
    const hasLargeRecurringExpenses = transactions.some(t => 
      t.type === 'EXPENSE' && t.amount > 1000 && 
      ['RENT', 'MORTGAGE', 'AUTO', 'LOAN'].includes(t.category)
    );
    
    if (hasLargeRecurringExpenses) {
      allInsights.push({
        title: "Refinancing Opportunity",
        description: "You have large recurring expenses that might benefit from refinancing in the current rate environment.",
        actionable: "Compare current market rates to your loans to see if refinancing makes sense",
        icon: "💱",
        category: 'opportunities'
      });
    }
    
    // Suggest tax optimization opportunities
    const hasTaxDeductibleExpenses = transactions.some(t => 
      t.type === 'EXPENSE' && 
      ['MEDICAL', 'EDUCATION', 'CHARITY', 'BUSINESS', 'HEALTHCARE'].includes(t.category)
    );
    
    if (hasTaxDeductibleExpenses) {
      allInsights.push({
        title: "Tax Optimization",
        description: "You have expenses that may qualify for tax deductions or credits.",
        actionable: "Organize receipts for these categories and consult a tax professional",
        icon: "📑",
        category: 'opportunities'
      });
    }
    
    // Cash flow optimization
    if (incomeVsExpense.income > 0 && incomeVsExpense.expense > 0) {
      const expenseToIncomeRatio = (incomeVsExpense.expense / incomeVsExpense.income) * 100;
      
      if (expenseToIncomeRatio > 80) {
        allInsights.push({
          title: "Cash Flow Improvement",
          description: `Your expenses consume ${expenseToIncomeRatio.toFixed(0)}% of your income, leaving little buffer.`,
          actionable: "Try to reduce your expense-to-income ratio to below 80% for better financial security",
          icon: "💵",
          category: 'opportunities'
        });
      }
    }
    
    // ---------------------------------------
    // 3. ACHIEVEMENT INSIGHTS
    // ---------------------------------------
    
    // Goal progress achievements
    if (goals.length > 0) {
      // Find goal with highest progress
      const successGoal = goals.find(g => (g.currentSaved / g.targetAmount) > 0.9);
      if (successGoal) {
        allInsights.push({
          title: "Goal Nearly Achieved",
          description: `You're ${Math.round((successGoal.currentSaved / successGoal.targetAmount) * 100)}% of the way to your "${successGoal.name}" goal!`,
          actionable: "Start thinking about your next financial goal after this one is complete",
          icon: "🎯",
          category: 'achievements'
        });
      }
      
      // Find goal with good progress
      const progressGoal = goals.find(g => 
        (g.currentSaved / g.targetAmount) > 0.5 && 
        (g.currentSaved / g.targetAmount) <= 0.9
      );
      
      if (progressGoal) {
        allInsights.push({
          title: "Halfway Milestone",
          description: `You've reached the halfway point for your "${progressGoal.name}" goal!`,
          actionable: "Keep up the momentum to reach your target on schedule",
          icon: "🏆",
          category: 'achievements'
        });
      }
    }
    
    // Spending reduction achievements
    if (monthlyComparison.percentChange < -15) {
      allInsights.push({
        title: "Spending Reduction",
        description: `Great job! You've reduced spending by ${Math.abs(monthlyComparison.percentChange).toFixed(0)}% compared to last month.`,
        actionable: "Consider putting the money saved toward one of your financial goals",
        icon: "🌟",
        category: 'achievements'
      });
    }
    
    // Positive savings rate achievement
    if (incomeVsExpense.income > 0) {
      const savingsRate = ((incomeVsExpense.income - incomeVsExpense.expense) / incomeVsExpense.income) * 100;
      
      if (savingsRate > 20) {
        allInsights.push({
          title: "Excellent Savings Rate",
          description: `You're saving ${savingsRate.toFixed(0)}% of your income this month!`,
          actionable: "Consider investing some of your savings for long-term growth",
          icon: "🥇",
          category: 'achievements'
        });
      }
    }
    
    // Category budget achievement
    for (const category in categorySpending) {
      if (categorySpending[category].isUnderTypical && categorySpending[category].total > 100) {
        allInsights.push({
          title: "Under Budget Success",
          description: `You've kept your ${formatCategoryName(category)} spending under budget this month!`,
          actionable: "Maintain these good habits for continued financial success",
          icon: "✅",
          category: 'achievements'
        });
        break; // Just show one of these achievements
      }
    }
    
    // If no insights generated for a category, add default ones
    const trendInsights = allInsights.filter(insight => insight.category === 'trends');
    const opportunityInsights = allInsights.filter(insight => insight.category === 'opportunities');
    const achievementInsights = allInsights.filter(insight => insight.category === 'achievements');
    
    if (trendInsights.length === 0) {
      allInsights.push({
        title: "Building Your Profile",
        description: "Add more transactions to see personalized spending trend insights",
        actionable: "Continue tracking your finances consistently",
        icon: "📊",
        category: 'trends'
      });
    }
    
    if (opportunityInsights.length === 0) {
      allInsights.push({
        title: "Seeking Opportunities",
        description: "We're analyzing your spending patterns to find optimization opportunities",
        actionable: "Add more transactions to receive tailored savings recommendations",
        icon: "🔍",
        category: 'opportunities'
      });
    }
    
    if (achievementInsights.length === 0) {
      allInsights.push({
        title: "Achievement Tracker",
        description: "Set financial goals and build good habits to earn achievements",
        actionable: "Create a savings goal to start tracking your progress",
        icon: "🏅",
        category: 'achievements'
      });
    }
    
    return allInsights;
  };
  
  // Helper functions for analysis
  
  const analyzeSpendingByCategory = (transactions: Transaction[]) => {
    // Category thresholds based on typical spending amounts
    const categoryThresholds: { [key: string]: number } = {
      FOOD: 500,
      RENT: 1500,
      UTILITIES: 300,
      ENTERTAINMENT: 200,
      TRANSPORTATION: 300,
      PERSONAL: 250,
      HEALTHCARE: 200,
      SHOPPING: 300,
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
        isOverTypical: boolean,
        isUnderTypical: boolean,
        percentOverTypical: number
      } 
    } = {};
    
    // Initialize category spending
    Object.keys(categoryThresholds).forEach(category => {
      categorySpending[category] = {
        total: 0,
        transactions: [],
        isOverTypical: false,
        isUnderTypical: false,
        percentOverTypical: 0
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
              categorySpending[transaction.category].percentOverTypical = 
                ((categorySpending[transaction.category].total - categoryThresholds[transaction.category]) / 
                 categoryThresholds[transaction.category]) * 100;
            } else if (categorySpending[transaction.category].total < categoryThresholds[transaction.category] * 0.8 &&
                      categorySpending[transaction.category].total > 50) {
              // Under typical by at least 20% and still significant spending
              categorySpending[transaction.category].isUnderTypical = true;
            }
          }
        }
      }
    });
    
    return categorySpending;
  };
  
  const findHighestSpendingCategory = (categorySpending: ReturnType<typeof analyzeSpendingByCategory>) => {
    let highestCategory = null;
    let highestAmount = 0;
    
    for (const category in categorySpending) {
      if (categorySpending[category].total > highestAmount && categorySpending[category].total > 100) {
        highestAmount = categorySpending[category].total;
        highestCategory = category;
      }
    }
    
    if (highestCategory) {
      return {
        category: highestCategory,
        amount: highestAmount
      };
    }
    
    return null;
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
  
  const findSavingsOpportunities = (transactions: Transaction[]) => {
    const categoryOpportunities: {
      category: string;
      potentialSavings: number;
    }[] = [];
    
    // Get category spending
    const categorySpending = analyzeSpendingByCategory(transactions);
    
    // Define optimization targets (percentage that could reasonably be reduced)
    const optimizationTargets: { [key: string]: number } = {
      ENTERTAINMENT: 0.3, // 30% could be reduced
      SHOPPING: 0.25,
      FOOD: 0.2, // Eating out could be reduced
      PERSONAL: 0.2,
      TRANSPORTATION: 0.15,
      UTILITIES: 0.1
    };
    
    for (const category in categorySpending) {
      if (optimizationTargets[category] && categorySpending[category].total > 100) {
        const potentialSavings = categorySpending[category].total * optimizationTargets[category];
        if (potentialSavings >= 20) { // Only suggest if savings are meaningful
          categoryOpportunities.push({
            category,
            potentialSavings
          });
        }
      }
    }
    
    // Sort by potential savings (highest first)
    return categoryOpportunities.sort((a, b) => b.potentialSavings - a.potentialSavings);
  };
  
  const analyzeCategoryGrowth = (transactions: Transaction[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const currentYear = now.getFullYear();
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Get current and previous month transactions
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.postedAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    const lastMonthTransactions = transactions.filter(t => {
      const date = new Date(t.postedAt);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });
    
    // Calculate spending by category for current and previous month
    const currentMonthByCategory: { [category: string]: number } = {};
    const lastMonthByCategory: { [category: string]: number } = {};
    
    currentMonthTransactions.forEach(t => {
      if (t.type === 'EXPENSE') {
        currentMonthByCategory[t.category] = (currentMonthByCategory[t.category] || 0) + t.amount;
      }
    });
    
    lastMonthTransactions.forEach(t => {
      if (t.type === 'EXPENSE') {
        lastMonthByCategory[t.category] = (lastMonthByCategory[t.category] || 0) + t.amount;
      }
    });
    
    // Calculate growth rates
    const categoryGrowth: { category: string; growthRate: number }[] = [];
    
    for (const category in currentMonthByCategory) {
      if (lastMonthByCategory[category] && lastMonthByCategory[category] > 50) {
        const growthRate = ((currentMonthByCategory[category] - lastMonthByCategory[category]) / 
                           lastMonthByCategory[category]) * 100;
        
        if (growthRate > 20) { // Only consider significant growth
          categoryGrowth.push({ category, growthRate });
        }
      }
    }
    
    // Sort by growth rate (highest first)
    categoryGrowth.sort((a, b) => b.growthRate - a.growthRate);
    
    return {
      fastestGrowing: categoryGrowth.length > 0 ? categoryGrowth[0] : null,
      categories: categoryGrowth
    };
  };
  
  const analyzeIncomeVsExpense = (transactions: Transaction[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let income = 0;
    let expense = 0;
    
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.postedAt);
      if (transactionDate.getMonth() === currentMonth && 
          transactionDate.getFullYear() === currentYear) {
        
        if (transaction.type === 'INCOME') {
          income += transaction.amount;
        } else if (transaction.type === 'EXPENSE') {
          expense += transaction.amount;
        }
      }
    });
    
    return { income, expense };
  };
  
  const identifyRecurringPayments = (transactions: Transaction[]) => {
    const recurringPaymentKeywords = [
      'netflix', 'spotify', 'hulu', 'amazon prime', 'disney+', 'subscription',
      'hbo', 'apple', 'gym', 'membership', 'monthly', 'recurring'
    ];
    
    // Identify potential recurring payments based on descriptor and consistent amounts
    const lastThreeMonths = new Date();
    lastThreeMonths.setMonth(lastThreeMonths.getMonth() - 3);
    
    // Get recurring expense transactions
    const recurringCandidates = transactions.filter(transaction => {
      if (transaction.type !== 'EXPENSE') return false;
      
      const transactionDate = new Date(transaction.postedAt);
      if (transactionDate < lastThreeMonths) return false;
      
      // Check if descriptor contains recurring keywords
      const descriptor = transaction.descriptor.toLowerCase();
      return recurringPaymentKeywords.some(keyword => descriptor.includes(keyword));
    });
    
    // Group by similar descriptor and amount
    const grouped: {[key: string]: Transaction[]} = {};
    
    recurringCandidates.forEach(transaction => {
      // Create a key based on first few chars of descriptor and rounded amount
      const key = `${transaction.descriptor.substring(0, 10)}-${Math.round(transaction.amount)}`;
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      
      grouped[key].push(transaction);
    });
    
    // Find groups with multiple occurrences (likely recurring)
    const recurringPayments: {descriptor: string, amount: number}[] = [];
    
    for (const key in grouped) {
      if (grouped[key].length >= 2) {
        // This appears multiple times, likely recurring
        recurringPayments.push({
          descriptor: grouped[key][0].descriptor,
          amount: grouped[key][0].amount
        });
      }
    }
    
    return recurringPayments;
  };
  
  const analyzeWeekdaySpending = (transactions: Transaction[]) => {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekdaySpending: {[key: string]: number} = {};
    
    // Initialize weekday spending
    weekdays.forEach(day => {
      weekdaySpending[day] = 0;
    });
    
    // Get transactions from the last 60 days
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    transactions.forEach(transaction => {
      if (transaction.type === 'EXPENSE') {
        const transactionDate = new Date(transaction.postedAt);
        if (transactionDate >= sixtyDaysAgo) {
          const weekday = weekdays[transactionDate.getDay()];
          weekdaySpending[weekday] += transaction.amount;
        }
      }
    });
    
    return weekdaySpending;
  };
  
  const formatCategoryName = (category: string): string => {
    return category.charAt(0) + category.slice(1).toLowerCase();
  };

  // Fetch data and generate insights on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const transactionData = await fetchTransactions();
        const goalData = await fetchGoals();
        
        // Generate insights based on the data
        const generatedInsights = generateInsights(transactionData, goalData);
        setInsights(generatedInsights);
      } catch (err) {
        console.error("Error analyzing data:", err);
        setInsights([{ 
          title: "Error",
          description: "Unable to generate personalized insights at this time",
          actionable: "Please try again later",
          icon: "⚠️",
          category: 'trends'
        }]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Filter insights by selected category
  const filteredInsights = insights.filter(insight => insight.category === selectedCategory);
  
  // Render insights with D3
  useEffect(() => {
    if (insightsRef.current && !isLoading) {
      // Clear any existing content
      d3.select(insightsRef.current).selectAll("*").remove();
      
      // Create insights cards
      const insightContainer = d3.select(insightsRef.current)
        .selectAll(".insight-card")
        .data(filteredInsights)
        .enter()
        .append("div")
        .attr("class", "insight-card")
        .style("opacity", 0)
        .style("transform", "translateY(10px)");
      
      // Add icon container
      const iconContainer = insightContainer.append("div")
        .attr("class", "insight-icon-container");
      
      // Add icon
      iconContainer.append("div")
        .attr("class", "insight-icon")
        .text(d => d.icon);
      
      // Add content container
      const contentContainer = insightContainer.append("div")
        .attr("class", "insight-content");
      
      // Add title
      contentContainer.append("h3")
        .attr("class", "insight-title")
        .text(d => d.title);
      
      // Add description
      contentContainer.append("p")
        .attr("class", "insight-description")
        .text(d => d.description);
      
      // Add actionable advice
      contentContainer.append("p")
        .attr("class", "insight-actionable")
        .text(d => d.actionable);
      
      // Animate insights in with a staggered delay
      insightContainer
        .transition()
        .duration(500)
        .delay((d, i) => i * 100)
        .style("opacity", 1)
        .style("transform", "translateY(0)");
    }
  }, [filteredInsights, isLoading]);
  
  return (
    <div className="smart-insights widget">
      <h2 className="insights-header">Smart Financial Insights</h2>
      
      {isLoading ? (
        <div className="insights-loading">
          <div className="spinner"></div>
          <p>Analyzing your financial data...</p>
        </div>
      ) : error ? (
        <div className="error-message" style={{ color: '#e74c3c', position: 'relative', fontSize: '1.8rem', zIndex: 1 }}>Add Financial Information
          <p></p>
          <button onClick={() => {
            setError(null);
            fetchTransactions();
            fetchGoals();
          }}>
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="insights-category-tabs">
            <button 
              className={selectedCategory === 'trends' ? 'active' : ''} 
              onClick={() => setSelectedCategory('trends')}
            >
              Trends
            </button>
            <button 
              className={selectedCategory === 'opportunities' ? 'active' : ''} 
              onClick={() => setSelectedCategory('opportunities')}
            >
              Opportunities
            </button>
            <button 
              className={selectedCategory === 'achievements' ? 'active' : ''} 
              onClick={() => setSelectedCategory('achievements')}
            >
              Achievements
            </button>
          </div>
          
          <div className="insights-content" ref={insightsRef}>
            {/* D3 will render insights here */}
          </div>
          
          {filteredInsights.length === 0 && (
            <div className="no-insights">
              <p>No insights available for this category yet. Continue using the app to generate more personalized insights.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SmartInsights;