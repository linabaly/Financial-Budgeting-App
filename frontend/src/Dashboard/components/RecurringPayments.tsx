import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { API_BASE_URL } from '../../config';

// ================================
// DATA INTERFACES
// ================================

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
  variableAmount: boolean;
}

const RecurringPayments: React.FC = () => {
  const paymentsRef = useRef<HTMLDivElement>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // ================================
  // DATA FETCHING
  // ================================
  
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

  // ================================
  // RECURRING PATTERN DETECTION CORE
  // ================================
  
  const detectRecurringPayments = (transactions: Transaction[]) => {
    if (!transactions.length) return [];
    
    // Only consider expenses with recent transactions
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Group by normalized descriptor
    const groups: { [key: string]: Transaction[] } = {};
    expenses.forEach(transaction => {
      const normalizedDescriptor = normalizeDescriptor(transaction.descriptor);
      if (!groups[normalizedDescriptor]) {
        groups[normalizedDescriptor] = [];
      }
      groups[normalizedDescriptor].push(transaction);
    });
    
    // Process groups to find patterns
    const recurringPaymentCandidates: RecurringPayment[] = [];
    
    Object.entries(groups).forEach(([descriptor, groupTransactions]) => {
      // Need at least 2 transactions for pattern detection
      if (groupTransactions.length < 2) return;
      
      // Sort transactions chronologically
      const sortedTransactions = [...groupTransactions].sort(
        (a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime()
      );

      // Skip if no recent transactions
      const hasRecentTransaction = sortedTransactions.some(transaction => {
        const txDate = new Date(transaction.postedAt);
        const txMonth = txDate.getMonth();
        const txYear = txDate.getFullYear();
        
        return (txMonth === currentMonth && txYear === currentYear) ||
               (txMonth === lastMonth && txYear === lastMonthYear);
      });
      
      if (!hasRecentTransaction) return;
      
      // Group by amount (exact match required)
      const amountGroups: { [amount: string]: Transaction[] } = {};
      sortedTransactions.forEach(transaction => {
        const amountKey = transaction.amount.toFixed(2);
        if (!amountGroups[amountKey]) {
          amountGroups[amountKey] = [];
        }
        amountGroups[amountKey].push(transaction);
      });
      
      // Check each amount group for recurring patterns
      Object.values(amountGroups).forEach(sameAmountTransactions => {
        if (sameAmountTransactions.length < 2) return;
        
        const sortedByDate = [...sameAmountTransactions].sort(
          (a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime()
        );
        
        // Try to detect patterns in order from shortest to longest interval
        const patterns = [
          detectDailyPattern,
          detectWeeklyPattern,
          detectBiweeklyPattern,
          detectMonthlyPattern,
          detectQuarterlyPattern,
          detectBiannualPattern,
          detectYearlyPattern
        ];
        
        for (const detectPattern of patterns) {
          const pattern = detectPattern(sortedByDate);
          if (pattern) {
            recurringPaymentCandidates.push(pattern);
            return;
          }
        }
      });
    });
    
    // Sort by next payment date
    return recurringPaymentCandidates.sort(
      (a, b) => new Date(a.nextEstimatedDate).getTime() - new Date(b.nextEstimatedDate).getTime()
    );
  };
  
  // ================================
  // PATTERN DETECTION FUNCTIONS
  // ================================
  
  // Daily pattern - transactions occur every day
  const detectDailyPattern = (transactions: Transaction[]): RecurringPayment | null => {
    if (transactions.length < 3) return null;
    
    // Calculate intervals and check if all are 1 day apart
    const daysBetween = calculateIntervals(transactions, 1);
    const isStrictlyDaily = daysBetween.every(days => days === 1);
    
    if (isStrictlyDaily) {
      const lastTransaction = transactions[transactions.length - 1];
      const nextDate = new Date(lastTransaction.postedAt);
      nextDate.setDate(nextDate.getDate() + 1);
      
      // Move to tomorrow if the next date is already past
      const now = new Date();
      if (nextDate < now) {
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        // Preserve original transaction time
        tomorrow.setHours(
          nextDate.getHours(),
          nextDate.getMinutes(),
          nextDate.getSeconds()
        );
        return createRecurringPayment(lastTransaction, tomorrow, 'Daily', 1, transactions);
      }
      
      return createRecurringPayment(lastTransaction, nextDate, 'Daily', 1, transactions);
    }
    
    return null;
  };
  
  // Weekly pattern - transactions occur every 7 days
  const detectWeeklyPattern = (transactions: Transaction[]): RecurringPayment | null => {
    if (transactions.length < 3) return null;
    
    // Check if all intervals are within 1 day of a week
    const tolerance = 1;
    for (let i = 1; i < transactions.length; i++) {
      const prevDate = new Date(transactions[i-1].postedAt);
      const currDate = new Date(transactions[i].postedAt);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (Math.abs(diffDays - 7) > tolerance) {
        return null;
      }
    }
    
    // Calculate next payment date
    const lastTransaction = transactions[transactions.length - 1];
    const nextDate = calculateNextOccurrence(lastTransaction.postedAt, 7);
    
    return createRecurringPayment(lastTransaction, nextDate, 'Weekly', 7, transactions);
  };

  // Biweekly pattern - transactions occur every 14 days
  const detectBiweeklyPattern = (transactions: Transaction[]): RecurringPayment | null => {
    if (transactions.length < 2) return null;
    
    // Check if all intervals are within 2 days of two weeks
    const tolerance = 2;
    for (let i = 1; i < transactions.length; i++) {
      const prevDate = new Date(transactions[i-1].postedAt);
      const currDate = new Date(transactions[i].postedAt);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (Math.abs(diffDays - 14) > tolerance) {
        return null;
      }
    }
    
    // Calculate next payment date
    const lastTransaction = transactions[transactions.length - 1];
    const nextDate = calculateNextOccurrence(lastTransaction.postedAt, 14);
    
    return createRecurringPayment(lastTransaction, nextDate, 'Biweekly', 14, transactions);
  };
  
  // Monthly pattern - transactions occur on the same day of each month
  const detectMonthlyPattern = (transactions: Transaction[]): RecurringPayment | null => {
    // Group by day of month
    const dayOfMonthGroups: { [day: number]: Transaction[] } = {};
    
    transactions.forEach(transaction => {
      const txDate = new Date(transaction.postedAt);
      const dayOfMonth = txDate.getDate();
      
      if (!dayOfMonthGroups[dayOfMonth]) {
        dayOfMonthGroups[dayOfMonth] = [];
      }
      dayOfMonthGroups[dayOfMonth].push(transaction);
    });
    
    // Look for recurring patterns on the same day of month
    for (const [dayOfMonth, sameDayTransactions] of Object.entries(dayOfMonthGroups)) {
      if (sameDayTransactions.length < 2) continue;
      
      // Check for different months
      const months = new Set(sameDayTransactions.map(t => {
        const date = new Date(t.postedAt);
        return `${date.getFullYear()}-${date.getMonth()}`;
      }));
      
      if (months.size < 2) continue;
      
      // Sort by date
      const sortedByDate = [...sameDayTransactions].sort(
        (a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime()
      );
      
      // Check if intervals are approximately monthly (28-31 days)
      const isMonthly = areIntervalsApproximately(sortedByDate, 30, 3);
      
      if (isMonthly) {
        const lastTransaction = sortedByDate[sortedByDate.length - 1];
        
        // Calculate next occurrence
        const nextDate = estimateNextMonthDayDate(
          lastTransaction.postedAt, 
          [parseInt(dayOfMonth)]
        );
        
        return createRecurringPayment(lastTransaction, nextDate, 'Monthly', 30, sortedByDate);
      }
    }
    
    return null;
  };
  
  // Quarterly pattern - transactions occur every 3 months
  const detectQuarterlyPattern = (transactions: Transaction[]): RecurringPayment | null => {
    if (transactions.length < 2) return null;
    
    // Group by position in quarter and day
    const monthDayGroups: { [key: string]: Transaction[] } = {};
    
    transactions.forEach(transaction => {
      const txDate = new Date(transaction.postedAt);
      const month = txDate.getMonth();
      const day = txDate.getDate();
      const quarterMonth = month % 3; // 0, 1, or 2 representing position in quarter
      const key = `${quarterMonth}-${day}`;
      
      if (!monthDayGroups[key]) {
        monthDayGroups[key] = [];
      }
      monthDayGroups[key].push(transaction);
    });
    
    // Check each group for quarterly pattern
    for (const [monthDay, sameMonthDayTxs] of Object.entries(monthDayGroups)) {
      if (sameMonthDayTxs.length < 2) continue;
      
      // Sort by date
      const sortedByDate = [...sameMonthDayTxs].sort(
        (a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime()
      );
      
      // Check if intervals are approximately quarterly (85-95 days)
      const isQuarterly = areIntervalsApproximately(sortedByDate, 90, 10);
      
      if (isQuarterly) {
        const lastTransaction = sortedByDate[sortedByDate.length - 1];
        const lastDate = new Date(lastTransaction.postedAt);
        
        // Calculate next date (3 months from last transaction)
        const nextDate = new Date(lastDate);
        nextDate.setMonth(nextDate.getMonth() + 3);
        
        // If in the past, calculate the next quarter date
        const now = new Date();
        if (nextDate < now) {
          const [quarterMonth, day] = monthDay.split('-').map(Number);
          const currentQuarterBase = Math.floor(now.getMonth() / 3) * 3;
          const targetMonth = currentQuarterBase + quarterMonth;
          
          const targetDate = new Date(now.getFullYear(), targetMonth, day);
          if (targetDate < now) {
            targetDate.setMonth(targetDate.getMonth() + 3);
          }
          
          return createRecurringPayment(lastTransaction, targetDate, 'Quarterly', 90, sortedByDate);
        }
        
        return createRecurringPayment(lastTransaction, nextDate, 'Quarterly', 90, sortedByDate);
      }
    }
    
    return null;
  };

  // Biannual pattern - transactions occur every 6 months
  const detectBiannualPattern = (transactions: Transaction[]): RecurringPayment | null => {
    if (transactions.length < 2) return null;
    
    // Check if all transactions are 6 months apart
    for (let i = 1; i < transactions.length; i++) {
      const prevDate = new Date(transactions[i-1].postedAt);
      const currDate = new Date(transactions[i].postedAt);
      
      const diffMonths = (currDate.getFullYear() - prevDate.getFullYear()) * 12 + 
                         (currDate.getMonth() - prevDate.getMonth());
      
      if (Math.abs(diffMonths - 6) > 1) { // Allow one month of wiggle room
        return null;
      }
    }
    
    // Calculate next payment date
    const lastTransaction = transactions[transactions.length - 1];
    const nextDate = new Date(lastTransaction.postedAt);
    nextDate.setMonth(nextDate.getMonth() + 6);
    
    // If in the past, add another 6 months
    const now = new Date();
    if (nextDate < now) {
      const adjustedDate = new Date(lastTransaction.postedAt);
      const monthsToAdd = 6 + (Math.floor((now.getTime() - nextDate.getTime()) / 
                            (30 * 24 * 60 * 60 * 1000)) + 1) * 6;
      adjustedDate.setMonth(adjustedDate.getMonth() + monthsToAdd);
      return createRecurringPayment(lastTransaction, adjustedDate, 'Biannually', 182, transactions);
    }
    
    return createRecurringPayment(lastTransaction, nextDate, 'Biannually', 182, transactions);
  };
  
  // Yearly pattern - transactions occur on the same date each year
  const detectYearlyPattern = (transactions: Transaction[]): RecurringPayment | null => {
    if (transactions.length < 2) return null;
    
    // Group by month and day
    const monthDayGroups: { [key: string]: Transaction[] } = {};
    
    transactions.forEach(transaction => {
      const txDate = new Date(transaction.postedAt);
      const month = txDate.getMonth();
      const day = txDate.getDate();
      const key = `${month}-${day}`;
      
      if (!monthDayGroups[key]) {
        monthDayGroups[key] = [];
      }
      monthDayGroups[key].push(transaction);
    });
    
    // Check each group for yearly pattern
    for (const [monthDay, sameMonthDayTxs] of Object.entries(monthDayGroups)) {
      if (sameMonthDayTxs.length < 2) continue;
      
      // Check for different years
      const years = new Set(sameMonthDayTxs.map(t => {
        const date = new Date(t.postedAt);
        return date.getFullYear();
      }));
      
      if (years.size < 2) continue;
      
      // Sort by date
      const sortedByDate = [...sameMonthDayTxs].sort(
        (a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime()
      );
      
      // Check if intervals are approximately yearly (350-380 days)
      const isYearly = areIntervalsApproximately(sortedByDate, 365, 15);
      
      if (isYearly) {
        const lastTransaction = sortedByDate[sortedByDate.length - 1];
        const [month, day] = monthDay.split('-').map(Number);
        
        // Calculate next occurrence
        const now = new Date();
        const thisYearDate = new Date(now.getFullYear(), month, day);
        
        // If this year's date is in the past, use next year
        if (thisYearDate < now) {
          thisYearDate.setFullYear(thisYearDate.getFullYear() + 1);
        }
        
        // Handle Feb 29 edge case
        if (month === 1 && day === 29) {
          const nextYear = thisYearDate.getFullYear();
          const isLeapYear = (nextYear % 4 === 0 && nextYear % 100 !== 0) || (nextYear % 400 === 0);
          if (!isLeapYear) {
            thisYearDate.setDate(28);
          }
        }
        
        return createRecurringPayment(lastTransaction, thisYearDate, 'Yearly', 365, sortedByDate);
      }
    }
    
    return null;
  };
  
  // ================================
  // HELPER FUNCTIONS
  // ================================
  
  // Calculate time intervals between consecutive transactions in days
  const calculateIntervals = (transactions: Transaction[], divisor: number = 1): number[] => {
    const intervals: number[] = [];
    
    for (let i = 1; i < transactions.length; i++) {
      const prevDate = new Date(transactions[i-1].postedAt);
      const currDate = new Date(transactions[i].postedAt);
      
      const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) / divisor;
      
      intervals.push(diffDays);
    }
    
    return intervals;
  };
  
  // Check if intervals between dates are approximately the target interval
  const areIntervalsApproximately = (
    transactions: Transaction[], 
    targetDays: number, 
    tolerance: number
  ): boolean => {
    const intervals = calculateIntervals(transactions);
    
    // Check if most intervals are within tolerance of target
    const minDays = targetDays - tolerance;
    const maxDays = targetDays + tolerance;
    
    // Require at least 65% of intervals to be within tolerance
    const validIntervals = intervals.filter(days => days >= minDays && days <= maxDays);
    return validIntervals.length / intervals.length >= 0.65;
  };
  
  // Calculate the next occurrence date based on days interval
  const calculateNextOccurrence = (lastDateStr: string, daysToAdd: number): Date => {
    const lastDate = new Date(lastDateStr);
    const now = new Date();
    
    // First try adding days to last occurrence
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    
    // If that's in the past, calculate from today
    if (nextDate < now) {
      // For weekly/biweekly, find the right weekday
      if (daysToAdd === 7 || daysToAdd === 14) {
        const targetDayOfWeek = lastDate.getDay();
        const currentDayOfWeek = now.getDay();
        let daysUntilTarget = (targetDayOfWeek - currentDayOfWeek + 7) % 7;
        
        // If today is the target day but we've passed the time, use next week
        if (daysUntilTarget === 0) {
          daysUntilTarget = 7;
        }
        
        // For biweekly, ensure proper sequence
        if (daysToAdd === 14) {
          // Calculate days between last occurrence and calculated next date
          const calculatedNext = new Date(now);
          calculatedNext.setDate(now.getDate() + daysUntilTarget);
          
          const daysSinceLastOccurrence = Math.round(
            (calculatedNext.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          // If not divisible by 14, add a week
          if (daysSinceLastOccurrence % 14 !== 0) {
            daysUntilTarget += 7;
          }
        }
        
        // Create new date with proper day of week
        const adjustedDate = new Date(now);
        adjustedDate.setDate(now.getDate() + daysUntilTarget);
        
        // Preserve original time
        adjustedDate.setHours(
          lastDate.getHours(),
          lastDate.getMinutes(),
          lastDate.getSeconds()
        );
        
        return adjustedDate;
      }
      
      // For other intervals, add appropriate days to today
      const adjustedDate = new Date(now);
      adjustedDate.setDate(now.getDate() + daysToAdd);
      
      // Preserve original time
      adjustedDate.setHours(
        lastDate.getHours(),
        lastDate.getMinutes(),
        lastDate.getSeconds()
      );
      
      return adjustedDate;
    }
    
    return nextDate;
  };
  
  // Estimate next date based on day of month
  const estimateNextMonthDayDate = (lastDateStr: string, monthDays: number[]): Date => {
    const lastDate = new Date(lastDateStr);
    const now = new Date();
    
    // If multiple days are found, use the first one
    const targetDay = monthDays[0];
    
    // Start with current month/year
    let targetMonth = now.getMonth();
    let targetYear = now.getFullYear();
    
    // Create a target date for current month
    let nextDate = new Date(targetYear, targetMonth, targetDay);
    nextDate.setHours(lastDate.getHours(), lastDate.getMinutes(), lastDate.getSeconds());
    
    // If the date is in the past, move to next month
    if (nextDate < now) {
      targetMonth = (targetMonth + 1) % 12;
      if (targetMonth === 0) targetYear++;
      nextDate = new Date(targetYear, targetMonth, 1);
      nextDate.setHours(lastDate.getHours(), lastDate.getMinutes(), lastDate.getSeconds());
    }
    
    // Adjust for month end (handle February, 30/31 day months)
    const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    if (targetDay > lastDayOfMonth) {
      nextDate.setDate(lastDayOfMonth);
    } else {
      nextDate.setDate(targetDay);
    }
    
    return nextDate;
  };
  
  // Create a RecurringPayment object from transaction data
  const createRecurringPayment = (
    transaction: Transaction,
    nextDate: Date,
    frequency: string,
    daysBetween: number,
    transactions: Transaction[]
  ): RecurringPayment => {
    return {
      descriptor: transaction.descriptor,
      amount: transaction.amount,
      category: transaction.category,
      type: transaction.type,
      lastDate: transaction.postedAt,
      nextEstimatedDate: nextDate.toISOString(),
      frequency: frequency,
      daysBetween: daysBetween,
      transactions: transactions,
      variableAmount: false
    };
  };
  
  // Normalize transaction descriptor by removing variable parts
  const normalizeDescriptor = (descriptor: string): string => {
    // Convert to lowercase
    let normalized = descriptor.toLowerCase();
    
    // Remove dates in various formats
    normalized = normalized.replace(/\d{1,2}[\/-]\d{1,2}[\/-]?\d{0,4}/g, '');
    
    // Remove reference numbers, transaction IDs
    normalized = normalized.replace(/ref:?\s*#?\d+/gi, '');
    normalized = normalized.replace(/\b(id|no|num|number)[:.\s]*\d+/gi, '');
    normalized = normalized.replace(/\b\d{6,}\b/g, '');
    
    // Remove common variable parts
    normalized = normalized.replace(/payment/gi, '');
    normalized = normalized.replace(/\d{1,2}:\d{2}(am|pm)?/gi, '');
    
    // Clean up whitespace
    return normalized.replace(/\s+/g, ' ').trim();
  };
  
  // ================================
  // FORMATTING & DISPLAY FUNCTIONS
  // ================================
  
  // Format currency amount
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
  
  // Calculate days remaining until next payment
  const getDaysRemaining = (dateString: string): number => {
    const nextDate = new Date(dateString);
    const today = new Date();
    
    // Clone dates to avoid modifying originals
    const nextDateCopy = new Date(nextDate);
    const todayCopy = new Date(today);
    
    // Reset time for accurate day calculation
    nextDateCopy.setHours(0, 0, 0, 0);
    todayCopy.setHours(0, 0, 0, 0);
    
    const timeDiff = nextDateCopy.getTime() - todayCopy.getTime();
    return Math.round(timeDiff / (1000 * 60 * 60 * 24));
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
  
  // Get emoji icon based on payment category
  const getPaymentIcon = (payment: RecurringPayment): string => {
    const category = payment.category.toLowerCase();
    
    switch (category) {
      case 'food': return "🍽️";
      case 'rent': return "🏠";
      case 'utilities': return "💡";
      case 'healthcare': return "🏥";
      case 'entertainment': return "🎬";
      case 'personal': return "👤";
      case 'transportation': return "🚗";
      case 'income': return "💵";
      case 'other': return "📦";
      default: return "💰";
    }
  };

  // ================================
  // LIFECYCLE & RENDERING
  // ================================

  // Load data when component mounts
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
  
  // Render payments list with D3
  useEffect(() => {
    if (!paymentsRef.current || isLoading) return;
    
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
    
    // Create payment items
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
    
    // Animate payment items
    paymentContainer.transition()
      .duration(300)
      .delay((d, i) => Math.min(i * 80, 400))
      .style("opacity", 1)
      .style("transform", "translateY(0)");
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
          <div className="error-message" style={{ color: '#e74c3c', position: 'relative', fontSize: '1.1rem', zIndex: 1 }}>Add Transactions</div>
        ) : (
          <div className="payments-list" ref={paymentsRef}></div>
        )}
      </div>
    </div>
  );
};

export default RecurringPayments;