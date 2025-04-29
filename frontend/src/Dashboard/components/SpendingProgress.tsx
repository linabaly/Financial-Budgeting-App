import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config';

interface SpendingProgressProps {
  onTransactionChange?: boolean;
  categoryFilter?: string;
  monthOffset?: number;
}

const SpendingProgress: React.FC<SpendingProgressProps> = ({ 
  onTransactionChange = false,
  categoryFilter,
  monthOffset = 0
}) => {
  // State for transaction data
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Financial metrics
  const [spent, setSpent] = useState<number>(0);
  const [budget, setBudget] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);

  // Fetch transaction data from API
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

  // Process transactions based on month offset and category
  useEffect(() => {
    if (isLoading || error || transactions.length === 0) return;

    const currentDate = new Date();
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, 1);
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    let totalIncome = 0;
    let totalExpense = 0;
    let categoryExpense = 0;

    // Process transactions for the target month
    transactions.forEach((tx: any) => {
      const amount = parseFloat(tx.amount);
      const postedDate = new Date(tx.postedAt);
      const month = postedDate.getMonth();
      const year = postedDate.getFullYear();

      if (month === targetMonth && year === targetYear) {
        if (tx.type === 'INCOME') {
          totalIncome += amount;
        } else if (tx.type === 'EXPENSE') {
          totalExpense += amount;
          
          // Filter by category if specified
          if (categoryFilter) {
            const txCategory = (tx.category || '').toLowerCase();
            const txDescription = (tx.description || '').toLowerCase();
            const filterLower = categoryFilter.toLowerCase();
            
            // Check if transaction matches the category filter
            const categoryMatch = matchesCategory(txCategory, txDescription, filterLower);
            if (categoryMatch) {
              categoryExpense += amount;
            }
          }
        }
      }
    });

    setMonthlyIncome(totalIncome);
    
    // Set spent amount based on category filter
    if (categoryFilter) {
      setSpent(categoryExpense);
    } else {
      setSpent(totalExpense);
    }

    // Calculate budget based on 50-30-20 rule
    if (totalIncome > 0) {
      let suggestedBudget;
      
      if (categoryFilter) {
        // Apply category-specific budget allocation
        suggestedBudget = calculateCategoryBudget(totalIncome, categoryFilter);
      } else {
        // Total budget is the entire income
        suggestedBudget = totalIncome;
      }
      
      setBudget(suggestedBudget);
    }
  }, [transactions, monthOffset, categoryFilter, isLoading, error]);

  // Calculate percentage spent
  useEffect(() => {
    if (budget > 0) {
      const calculatedPercentage = Math.min(100, Math.round((spent / budget) * 100));
      setPercentage(calculatedPercentage);
    } else {
      setPercentage(0);
    }
  }, [spent, budget]);

  // Helper function to match transaction to category
  const matchesCategory = (category: string, description: string, filter: string): boolean => {
    // Needs categories
    if (filter === 'needs' || filter === 'essentials') {
      return ['rent', 'mortgage', 'housing', 'utilities', 'bill', 'electricity', 'water', 
              'internet', 'groceries', 'food', 'healthcare', 'medical', 'doctor', 'pharmacy',
              'transportation', 'gas', 'car', 'bus', 'train'].some(term => 
                category.includes(term) || description.includes(term));
    }
    
    // Wants categories
    if (filter === 'wants' || filter === 'discretionary') {
      return ['entertainment', 'fun', 'movie', 'subscription', 'personal', 'clothing', 
              'beauty', 'haircut', 'restaurant', 'dining', 'cafe', 'travel', 'vacation'].some(term => 
                category.includes(term) || description.includes(term));
    }
    
    // Savings/debt
    if (filter === 'savings' || filter === 'debt') {
      return ['savings', 'investment', 'loan', 'debt', 'credit', 'payment'].some(term => 
                category.includes(term) || description.includes(term));
    }
    
    // Specific category matching
    const specificCategories: {[key: string]: string[]} = {
      'food': ['groceries', 'food', 'restaurant', 'dining', 'cafe'],
      'rent': ['rent', 'mortgage', 'housing', 'apartment'],
      'utilities': ['utilities', 'bill', 'electricity', 'water', 'internet', 'phone'],
      'healthcare': ['health', 'medical', 'doctor', 'pharmacy'],
      'entertainment': ['entertainment', 'fun', 'movie', 'netflix', 'subscription', 'game'],
      'personal': ['personal', 'clothing', 'beauty', 'haircut', 'salon'],
      'transportation': ['transport', 'gas', 'uber', 'lyft', 'car', 'bus', 'train']
    };
    
    // Check if we have predefined terms for this category
    if (specificCategories[filter]) {
      return specificCategories[filter].some(term => 
        category.includes(term) || description.includes(term));
    }
    
    // Direct match with transaction category
    return category.includes(filter) || description.includes(filter);
  };

  // Calculate category budget based on 50-30-20 rule
  const calculateCategoryBudget = (income: number, category: string): number => {
    // 50-30-20 allocation (50% needs, 30% wants, 20% savings)
    const needsAllocation = 0.5;
    const wantsAllocation = 0.3;
    const savingsAllocation = 0.2;
    
    // Category percentages of total income
    const categoryAllocations: {[key: string]: number} = {
      // Needs (50%)
      'food': 0.15,           // 15% of income
      'rent': 0.25,           // 25% of income
      'utilities': 0.05,      // 5% of income
      'healthcare': 0.03,     // 3% of income
      'transportation': 0.02, // 2% of income
      
      // Wants (30%)
      'entertainment': 0.10,  // 10% of income
      'personal': 0.10,       // 10% of income
      'other': 0.10,          // 10% of income
      
      // Category groups
      'needs': needsAllocation,        // 50% of income
      'essentials': needsAllocation,   // 50% of income
      'wants': wantsAllocation,        // 30% of income
      'discretionary': wantsAllocation, // 30% of income
      'savings': savingsAllocation,    // 20% of income
      'debt': savingsAllocation        // 20% of income
    };
    
    // Return either the specific category allocation or default to a reasonable percentage
    return income * (categoryAllocations[category.toLowerCase()] || 0.1);
  };

  // Determine color and icon based on spending percentage
  const getSpendingStatus = () => {
    if (percentage < 50) {
      return { 
        color: '#2ecc71', 
        icon: '💰', 
        text: 'Good spending habits' 
      };
    } else if (percentage < 80) {
      return { 
        color: '#f1c40f', 
        icon: '⚠️', 
        text: 'Approaching limit' 
      };
    } else {
      return { 
        color: '#e74c3c', 
        icon: '🚨', 
        text: 'Limit almost reached' 
      };
    }
  };

  const status = getSpendingStatus();
  const remaining = budget - spent;
  
  // Format budget title based on category filter
  const getBudgetTitle = () => {
    if (!categoryFilter) return "Monthly Spending Limit";
    
    // Format category name
    const formattedCategory = categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1);
    return `${formattedCategory} Budget (Based on 50/30/20)`;
  };
  
  return (
    <div className="spending-progress">
      {isLoading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '120px' 
        }}>
          <div>Loading transaction data...</div>
        </div>
      ) : error ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '120px',
          color: '#e74c3c' 
        }}>
          <div>Add Transactions to Track Spending</div>
        </div>
      ) : (
        <>
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '0.5rem' 
            }}
          >
            <div style={{ fontSize: '1.4rem', color: '#aaa' }}>
              {getBudgetTitle()}
            </div>
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: status.color,
                fontWeight: 500
              }}
            >
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                fontSize: '2.2rem',
                fontWeight: 'bold',
                marginRight: '0.2rem',
                color: status.color,
                textShadow: `
                  0 0 10px rgba(46, 204, 113, 0.8),
                  0 0 5px rgba(0, 0, 0, 0.6)
                `
              }}>
                {status.icon}

                {/* Cover up the built-in $ sign if using the money bag icon */}
                {status.icon === '💰' && (
                  <span style={{
                    position: 'absolute',
                    width: '1.9rem',
                    height: '1.7rem',
                    backgroundColor: '#C29F70',
                    borderRadius: '50%',
                    transform: 'translate(0px, 0px)',
                    zIndex: 1
                  }} />
                )}

                {/* Overlay custom $ if using the money bag icon */}
                {status.icon === '💰' && (
                  <span style={{
                    position: 'absolute',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#000',
                    transform: 'translate(0px, 1px)',
                    zIndex: 2,
                    pointerEvents: 'none',
                    textShadow: `
                      0 0 4px rgba(0, 0, 0, 0.8)
                    `
                  }}>
                    $
                  </span>
                )}
              </span>
              {status.text}
            </div>
          </div>
          
          <div 
            style={{ 
              height: '24px', 
              backgroundColor: '#1a1a1a', 
              borderRadius: '12px', 
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div 
              style={{
                width: `${percentage}%`,
                height: '100%',
                backgroundColor: status.color,
                transition: 'width 0.5s ease-in-out'
              }}
            />
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -44%)',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '22px',
                zIndex: 10
              }}
            >
              {percentage}%
            </div>
          </div>
          
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: '0.5rem', 
              fontSize: '1.2rem' 
            }}
          >
            <div style={{ color: '#e74c3c' }}>
              Spent: ${spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ color: '#2ecc71' }}>
              Remaining: ${remaining.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          {/* Additional section showing budget recommendation */}
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginTop: '0.5rem',
              fontSize: '1rem',
              color: '#aaa',
              borderTop: '1px solid #333',
              paddingTop: '0.5rem'
            }}
          >
            <div>
              Suggested Budget: ${budget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {categoryFilter && (
              <div>
                Based on ${monthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} income
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SpendingProgress;