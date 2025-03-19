import { PrismaDBClient as prisma } from "../index";

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export enum Category {
  FOOD = "FOOD",
  RENT = "RENT",
  ENTERTAINMENT = "ENTERTAINMENT",
  UTILITIES = "UTILITIES",
  TRANSPORTATION = "TRANSPORTATION",
  HEALTHCARE = "HEALTHCARE",
  OTHER = "OTHER",
  INCOME = "INCOME",
}


export interface TransactionDetails {
  id?: string;
  amount: number | string; // Handle Decimal type
  descriptor: string;
  type: TransactionType;
  category: Category;
  postedAt: Date;
  accountId: string;
  currency?: string;
  createdAt?: Date;
}

export interface TransactionFilters {
  accountId?: string;
  category?: Category;
  type?: TransactionType;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface TransactionSummary {
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  categorySummary: Record<Category, number>;
  monthlyBreakdown: Record<string, {
    income: number;
    expenses: number;
    net: number;
  }>;
}

/**
 * TransactionManager class for handling CRUD operations on financial transactions
 * Follows similar pattern to AccountManager
 */
export default class TransactionManager {
  /**
   * Creates a new transaction in the database
   * @param transaction Transaction details to create
   * @returns The created transaction
   */
  public static async createTransaction(transaction: TransactionDetails) {
    try {
      // Validate transaction data
      this.validateTransactionData(transaction);
      
      // Create transaction
      return prisma.transaction.create({
        data: {
          ...transaction,
          // Default currency if not provided
          currency: transaction.currency || "USD"
        }
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Retrieves a transaction by ID
   * @param transactionId ID of the transaction to retrieve
   * @returns The transaction details
   */
  public static async getTransaction(transactionId: string) {
    try {
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }

      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId }
      });
      
      if (!transaction) {
        throw new Error(`Transaction with ID ${transactionId} not found`);
      }
      
      return transaction;
    } catch (error) {
      console.error('Error retrieving transaction:', error);
      throw error;
    }
  }

  /**
   * Retrieves transactions with optional filtering
   * @param filters Optional filters for transactions
   * @param limit Maximum number of transactions to return
   * @param skip Number of transactions to skip (for pagination)
   * @param orderBy Field to order by and direction
   * @returns Array of transaction objects
   */
  public static async getTransactions(
    filters: TransactionFilters = {}, 
    limit: number = 100, 
    skip: number = 0,
    orderBy: { field: string, direction: 'asc' | 'desc' } = { field: 'postedAt', direction: 'desc' }
  ) {
    try {
      // Build where clause based on filters
      const where: any = {};
      
      if (filters.accountId) where.accountId = filters.accountId;
      if (filters.category) where.category = filters.category;
      if (filters.type) where.type = filters.type;
      
      // Date range filtering
      if (filters.startDate || filters.endDate) {
        where.postedAt = {};
        if (filters.startDate) where.postedAt.gte = filters.startDate;
        if (filters.endDate) where.postedAt.lte = filters.endDate;
      }
      
      // Amount range filtering
      if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
        where.amount = {};
        if (filters.minAmount !== undefined) where.amount.gte = filters.minAmount;
        if (filters.maxAmount !== undefined) where.amount.lte = filters.maxAmount;
      }
      
      // Execute query with pagination and sorting
      return prisma.transaction.findMany({
        where,
        orderBy: { [orderBy.field]: orderBy.direction },
        skip,
        take: limit
      });
    } catch (error) {
      console.error('Error retrieving transactions:', error);
      throw error;
    }
  }

  /**
   * Updates an existing transaction
   * @param transactionId ID of the transaction to update
   * @param updateData Data to update in the transaction
   * @returns The updated transaction
   */
  public static async updateTransaction(
    transactionId: string, 
    updateData: Partial<TransactionDetails>
  ) {
    try {
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }

      // Check if transaction exists
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id: transactionId }
      });
      
      if (!existingTransaction) {
        throw new Error(`Transaction with ID ${transactionId} not found`);
      }
      
      // Prevent updating immutable fields
      const { id, createdAt, ...dataToUpdate } = updateData;
      
      // Update transaction
      return prisma.transaction.update({
        where: { id: transactionId },
        data: dataToUpdate
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  /**
   * Deletes a transaction
   * @param transactionId ID of the transaction to delete
   * @returns The deleted transaction
   */
  public static async deleteTransaction(transactionId: string) {
    try {
      if (!transactionId) {
        throw new Error('Transaction ID is required');
      }

      // Check if transaction exists
      const existingTransaction = await prisma.transaction.findUnique({
        where: { id: transactionId }
      });
      
      if (!existingTransaction) {
        throw new Error(`Transaction with ID ${transactionId} not found`);
      }
      
      // Delete transaction
      return prisma.transaction.delete({
        where: { id: transactionId }
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  /**
   * Calculates summary statistics for transactions
   * @param filters Optional filters for transactions to include in summary
   * @returns Summary statistics object
   */


  


  public static async getTransactionSummary(filters: TransactionFilters = {}): Promise<TransactionSummary> {
    try {
      // Get transactions based on filters (get all matching transactions)
      const transactions = await this.getTransactions(filters, 1000);
      
      // Initialize summary object with empty category summaries
      const summary: TransactionSummary = {
        totalTransactions: transactions.length,
        totalIncome: 0,
        totalExpenses: 0,
        netAmount: 0,
        categorySummary: {} as Record<Category, number>,
        monthlyBreakdown: {}
      };
      
      // Initialize all categories with zero
      Object.values(Category).forEach(category => {
        summary.categorySummary[category] = 0;
      });
      
      // Process each transaction
      transactions.forEach((transaction: TransactionDetails) => {
        const amount = Number(transaction.amount);
        
        // Update totals based on transaction type
        if (transaction.type === TransactionType.INCOME) {
          summary.totalIncome += amount;
          summary.netAmount += amount;
        } else if (transaction.type === TransactionType.EXPENSE) {
          summary.totalExpenses += amount;
          summary.netAmount -= amount;
        }
        
        // Update category summary
        if (transaction.type === TransactionType.INCOME) {
          summary.categorySummary[transaction.category] += amount;
        } else {
          summary.categorySummary[transaction.category] -= amount;
        }
        
        // Update monthly breakdown
        const month = transaction.postedAt.toISOString().substring(0, 7); // Format: YYYY-MM
        if (!summary.monthlyBreakdown[month]) {
          summary.monthlyBreakdown[month] = {
            income: 0,
            expenses: 0,
            net: 0
          };
        }
        
        if (transaction.type === TransactionType.INCOME) {
          summary.monthlyBreakdown[month].income += amount;
          summary.monthlyBreakdown[month].net += amount;
        } else {
          summary.monthlyBreakdown[month].expenses += amount;
          summary.monthlyBreakdown[month].net -= amount;
        }
      });
      
      return summary;
    } catch (error) {
      console.error('Error generating transaction summary:', error);
      throw error;
    }
  }




  /**
   * Gets transactions by account ID
   * @param accountId ID of the account to get transactions for
   * @returns Array of transactions
   */
  public static async getTransactionsByAccount(accountId: string) {
    try {
      if (!accountId) {
        throw new Error('Account ID is required');
      }

      return prisma.transaction.findMany({
        where: { accountId }
      });
    } catch (error) {
      console.error('Error retrieving transactions for account:', error);
      throw error;
    }
  }

  /**
   * Gets transactions by category
   * @param category Category to filter by
   * @param accountId Optional account ID to further filter
   * @returns Array of transactions
   */
  public static async getTransactionsByCategory(category: Category, accountId?: string) {
    try {
      const where: any = { category };
      if (accountId) where.accountId = accountId;

      return prisma.transaction.findMany({ where });
    } catch (error) {
      console.error('Error retrieving transactions by category:', error);
      throw error;
    }
  }

  /**
   * Bulk creates multiple transactions
   * @param transactions Array of transaction details to create
   * @returns The created transactions
   */
  public static async bulkCreateTransactions(transactions: TransactionDetails[]) {
    try {
      // Validate all transactions
      transactions.forEach(this.validateTransactionData);
      
      // Create all transactions
      const createdTransactions = await prisma.$transaction(
        transactions.map(transaction => 
          prisma.transaction.create({
            data: {
              ...transaction,
              currency: transaction.currency || "USD"
            }
          })
        )
      );
      
      return createdTransactions;
    } catch (error) {
      console.error('Error bulk creating transactions:', error);
      throw error;
    }
  }

  /**
   * Deletes all transactions for an account
   * @param accountId ID of the account to delete transactions for
   * @returns Count of deleted transactions
   */
  public static async deleteAccountTransactions(accountId: string) {
    try {
      if (!accountId) {
        throw new Error('Account ID is required');
      }

      const result = await prisma.transaction.deleteMany({
        where: { accountId }
      });
      
      return result.count;
    } catch (error) {
      console.error('Error deleting account transactions:', error);
      throw error;
    }
  }

  /**
   * Gets recent transactions
   * @param accountId Optional account ID to filter by
   * @param days Number of days to look back
   * @param limit Maximum number of transactions to return
   * @returns Array of recent transactions
   */
  public static async getRecentTransactions(accountId?: string, days: number = 30, limit: number = 10) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const where: any = {
        postedAt: {
          gte: startDate
        }
      };
      
      if (accountId) where.accountId = accountId;
      
      return prisma.transaction.findMany({
        where,
        orderBy: { postedAt: 'desc' },
        take: limit
      });
    } catch (error) {
      console.error('Error retrieving recent transactions:', error);
      throw error;
    }
  }

  /**
   * Validates transaction data
   * @param transaction Transaction data to validate
   * @throws Error if validation fails
   */
  private static validateTransactionData(transaction: TransactionDetails): void {
    // Required fields
    const requiredFields: (keyof TransactionDetails)[] = [
      'amount', 'descriptor', 'type', 'category', 'postedAt', 'accountId'
    ];
    
    for (const field of requiredFields) {
      if (transaction[field] === undefined || transaction[field] === null) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Validate amount is a valid number
    if (
      (typeof transaction.amount === 'string' && isNaN(parseFloat(transaction.amount))) ||
      (typeof transaction.amount === 'number' && isNaN(transaction.amount))
    ) {
      throw new Error('Transaction amount must be a valid number');
    }
    
    // Validate transaction type exists in enum
    if (!Object.values(TransactionType).includes(transaction.type)) {
      throw new Error(`Invalid transaction type. Must be one of: ${Object.values(TransactionType).join(', ')}`);
    }
    
    // Validate category exists in enum
    if (!Object.values(Category).includes(transaction.category)) {
      throw new Error(`Invalid category. Must be one of: ${Object.values(Category).join(', ')}`);
    }
    
    // Validate date is a valid date
    if (!(transaction.postedAt instanceof Date) && isNaN(new Date(transaction.postedAt).getTime())) {
      throw new Error('Invalid transaction date');
    }
  }
}