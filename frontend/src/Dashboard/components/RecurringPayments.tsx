import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { API_BASE_URL } from '../../config';

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

interface RecurringPayment {
  descriptor: string;
  amount: number;
  category: string;
  type: string;
  lastDate: string;
  nextEstimatedDate: string;
  frequency: string;
  daysBetween: number;
  transactions: Transaction[];
  variableAmount: boolean; // Will always be false in the new implementation
}

const RecurringPayments: React.FC = () => {
  const paymentsRef = useRef<HTMLDivElement>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
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

  // Detect recurring payments from transaction data
  const detectRecurringPayments = (transactions: Transaction[]) => {
    if (!transactions.length) return [];
    
    // Only consider expense transactions
    const expenses = transactions.filter(t => t.type === 'EXPENSE');

    // Get current date for "current or last month" check
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Group transactions by similar descriptors (normalize names)
    const groups: { [key: string]: Transaction[] } = {};
    
    expenses.forEach(transaction => {
      // Normalize transaction descriptor (remove dates, reference numbers, etc.)
      const normalizedDescriptor = normalizeDescriptor(transaction.descriptor);
      
      if (!groups[normalizedDescriptor]) {
        groups[normalizedDescriptor] = [];
      }
      groups[normalizedDescriptor].push(transaction);
    });
    
    // Identify potential recurring payments
    const recurringPaymentCandidates: RecurringPayment[] = [];
    
    Object.entries(groups).forEach(([descriptor, groupTransactions]) => {
      // Need at least 2 transactions to detect a pattern
      if (groupTransactions.length >= 2) {
        // Sort transactions by date (oldest first)
        const sortedTransactions = [...groupTransactions].sort(
          (a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime()
        );

        // Check if at least one transaction is from current or last month
        const hasRecentTransaction = sortedTransactions.some(transaction => {
          const txDate = new Date(transaction.postedAt);
          const txMonth = txDate.getMonth();
          const txYear = txDate.getFullYear();
          
          return (txMonth === currentMonth && txYear === currentYear) ||
                 (txMonth === lastMonth && txYear === lastMonthYear);
        });
        
        // Only proceed if we have a recent transaction
        if (!hasRecentTransaction) {
          return;
        }
        
        // Group transactions by amount (must be exactly the same amount)
        const amountGroups: { [amount: string]: Transaction[] } = {};
        
        sortedTransactions.forEach(transaction => {
          // Use exact amount as key (no tolerance)
          const amountKey = transaction.amount.toFixed(2);
          
          if (!amountGroups[amountKey]) {
            amountGroups[amountKey] = [];
          }
          amountGroups[amountKey].push(transaction);
        });
        
        // Process each amount group separately
        Object.values(amountGroups).forEach(sameAmountTransactions => {
          // Skip if less than 2 transactions with same amount
          if (sameAmountTransactions.length < 2) return;
          
          // Sort by date (oldest first)
          const sortedByDate = [...sameAmountTransactions].sort(
            (a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime()
          );
          
          // Group transactions by day of month (must be exactly the same day)
          const dayOfMonthGroups: { [day: number]: Transaction[] } = {};
          
          sortedByDate.forEach(transaction => {
            const txDate = new Date(transaction.postedAt);
            const dayOfMonth = txDate.getDate();
            
            if (!dayOfMonthGroups[dayOfMonth]) {
              dayOfMonthGroups[dayOfMonth] = [];
            }
            dayOfMonthGroups[dayOfMonth].push(transaction);
          });
          
          // Find days of month that have multiple transactions
          Object.entries(dayOfMonthGroups).forEach(([dayOfMonth, sameDayTransactions]) => {
            // Skip if less than 2 transactions on the same day of month
            if (sameDayTransactions.length < 2) return;
            
            // Check if transactions occur in different months
            const months = new Set(sameDayTransactions.map(t => {
              const date = new Date(t.postedAt);
              return `${date.getFullYear()}-${date.getMonth()}`;
            }));
            
            // Skip if all transactions are in the same month
            if (months.size < 2) return;
            
            // We found a recurring pattern: same amount, same day of month, different months
            const lastTransaction = sameDayTransactions[sameDayTransactions.length - 1];
            
            // Calculate next estimated date based on the month day pattern
            const nextMonthDayDate = estimateNextMonthDayDate(
              lastTransaction.postedAt, 
              [parseInt(dayOfMonth)]
            );
            
            recurringPaymentCandidates.push({
              descriptor: lastTransaction.descriptor,
              amount: lastTransaction.amount,
              category: lastTransaction.category,
              type: lastTransaction.type,
              lastDate: lastTransaction.postedAt,
              nextEstimatedDate: nextMonthDayDate.toISOString(),
              frequency: 'Monthly',
              daysBetween: 30, // Approximate for UI purposes
              transactions: sameDayTransactions,
              variableAmount: false // Always false since we group by exact amount
            });
          });
        });
      }
    });
    
    // Sort by next payment date
    return recurringPaymentCandidates.sort(
      (a, b) => new Date(a.nextEstimatedDate).getTime() - new Date(b.nextEstimatedDate).getTime()
    );
  };
  
  // Estimate next date based on month day pattern
  const estimateNextMonthDayDate = (lastDateStr: string, monthDays: number[]): Date => {
    const lastDate = new Date(lastDateStr);
    const now = new Date();
    
    // If multiple days are found, use the most common or the most recent one
    const targetDay = monthDays[0];
    
    // Calculate next month date
    const nextDate = new Date(now.getFullYear(), now.getMonth(), targetDay);
    
    // If the calculated date is in the past, move to next month
    if (nextDate < now) {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    
    // Make sure we're using a valid day for the month
    // This handles months with different number of days
    const month = nextDate.getMonth();
    const year = nextDate.getFullYear();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    
    // If the target day exceeds the last day of the month, use the last day instead
    if (targetDay > lastDayOfMonth) {
      nextDate.setDate(lastDayOfMonth);
    }
    
    return nextDate;
  };
  
  // Helper function to normalize transaction descriptors
  const normalizeDescriptor = (descriptor: string): string => {
    // Convert to lowercase
    let normalized = descriptor.toLowerCase();
    
    // Remove dates in various formats (MM/DD, MM-DD, etc.)
    normalized = normalized.replace(/\d{1,2}[\/-]\d{1,2}[\/-]?\d{0,4}/g, '');
    
    // Remove reference numbers, transaction IDs
    normalized = normalized.replace(/ref:?\s*#?\d+/gi, '');
    normalized = normalized.replace(/\b(id|no|num|number)[:.\s]*\d+/gi, '');
    normalized = normalized.replace(/\b\d{6,}\b/g, '');
    
    // Remove common variable parts
    normalized = normalized.replace(/payment/gi, '');
    normalized = normalized.replace(/\d{1,2}:\d{2}(am|pm)?/gi, '');
    
    // Remove extra spaces and trim
    normalized = normalized.replace(/\s+/g, ' ').trim();
    
    return normalized;
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get days remaining until next payment
  const getDaysRemaining = (dateString: string): number => {
    const nextDate = new Date(dateString);
    const today = new Date();
    
    // Reset time portion for accurate day calculation
    nextDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const timeDiff = nextDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };
  
  // Format due date string with days remaining
  const formatDueDate = (payment: RecurringPayment): string => {
    const daysRemaining = getDaysRemaining(payment.nextEstimatedDate);
    
    if (daysRemaining <= 0) {
      return "Due today";
    } else if (daysRemaining === 1) {
      return "Due tomorrow";
    } else if (daysRemaining < 7) {
      return `Due in ${daysRemaining} days`;
    } else {
      return `Due ${formatDate(payment.nextEstimatedDate)}`;
    }
  };
  
  // Get icon based on category
  const getPaymentIcon = (payment: RecurringPayment): string => {
    const category = payment.category.toLowerCase();
    
    switch (category) {
      case 'food':
        return "🍽️";
      case 'rent':
        return "🏠";
      case 'utilities':
        return "💡";
      case 'healthcare':
        return "🏥";
      case 'entertainment':
        return "🎬";
      case 'personal':
        return "👤";
      case 'transportation':
        return "🚗";
      case 'income':
        return "💵";
      case 'other':
        return "📦";
      default:
        return "💰";
    }
  };

  // Fetch data and analyze on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const transactionData = await fetchTransactions();
        const detectedRecurringPayments = detectRecurringPayments(transactionData);
        setRecurringPayments(detectedRecurringPayments);
      } catch (err) {
        console.error("Error analyzing transactions:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Render recurring payments with D3
  useEffect(() => {
    if (paymentsRef.current && !isLoading) {
      // Clear any existing content
      d3.select(paymentsRef.current).selectAll("*").remove();
      
      if (recurringPayments.length === 0) {
        d3.select(paymentsRef.current)
          .append("div")
          .attr("class", "no-payments-message")
          .text("No recurring payments detected. Add more transactions to identify patterns.");
        return;
      }
      
      // Sort payments by next due date
      const sortedPayments = [...recurringPayments].sort(
        (a, b) => new Date(a.nextEstimatedDate).getTime() - new Date(b.nextEstimatedDate).getTime()
      );
      
      // Create payment items with D3
      const paymentContainer = d3.select(paymentsRef.current)
        .selectAll(".payment-item")
        .data(sortedPayments)
        .enter()
        .append("div")
        .attr("class", "payment-item")
        .style("opacity", 0)
        .style("transform", "translateY(-10px)");
      
      // Create payment header (icon + service name)
      const paymentHeader = paymentContainer.append("div")
        .attr("class", "payment-header");
      
      // Add icon
      paymentHeader.append("div")
        .attr("class", "payment-icon")
        .text(d => getPaymentIcon(d));
      
      // Add service name
      paymentHeader.append("div")
        .attr("class", "payment-service")
        .text(d => d.descriptor);
      
      // Add payment content
      const paymentContent = paymentContainer.append("div")
        .attr("class", "payment-content");
      
      // Payment details
      const details = paymentContent.append("div")
        .attr("class", "payment-details");
      
      details.append("div")
        .attr("class", "payment-amount")
        .text(d => formatCurrency(d.amount));
      
      details.append("div")
        .attr("class", "payment-frequency")
        .text(d => d.frequency);
      
      details.append("div")
        .attr("class", d => {
          const daysRemaining = getDaysRemaining(d.nextEstimatedDate);
          return `payment-date ${daysRemaining <= 3 ? 'urgent' : daysRemaining <= 7 ? 'soon' : ''}`;
        })
        .text(d => formatDueDate(d));
      
      // Last payment info
      const history = paymentContainer.append("div")
        .attr("class", "payment-history");
      
      history.append("div")
        .attr("class", "payment-history-label")
        .text("Last paid:");
      
      history.append("div")
        .attr("class", "payment-history-date")
        .text(d => formatDate(d.lastDate));
      
      // Animate payment items with delay
      paymentContainer.transition()
        .duration(300)
        .delay((d, i) => Math.min(i * 80, 400))
        .style("opacity", 1)
        .style("transform", "translateY(0)");
    }
  }, [recurringPayments, isLoading]);
  
  return (
    <div className="recurring-payments widget">
      <div className="widget-header">
        <div className="section-header">Recurring Payments</div>
      </div>
      <div className="widget-body">
        {isLoading ? (
          <div className="loading-payments">Loading payments...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="payments-list" ref={paymentsRef}></div>
        )}
      </div>
    </div>
  );
};

export default RecurringPayments;