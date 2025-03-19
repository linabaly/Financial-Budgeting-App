// src/Dashboard/types/index.ts
export interface MonthlyData {
    month: string;
    value: number;
  }
  
  export interface IncomeExpenseData {
    date: string;
    income: number;
    expense: number;
  }
  
  export interface RecurringPayment {
    service: string;
    amount: string;
    dueDate: string;
  }
  
  export interface Alert {
    type: 'warning' | 'danger' | 'info';
    message: string;
  }
  