import { v4 as uuid } from "uuid";
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
  amount: number | string; // TODO Handle Decimal type
  descriptor: string;
  type: TransactionType;
  category: Category;
  postedAt: Date;
  accountID: string;
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
  monthlyBreakdown: Record<
    string,
    {
      income: number;
      expenses: number;
      net: number;
    }
  >;
}

/**
 * This class provides static utility functions for managing trans
 * @author Matthew R
 */
export default class TransactionManager {
  /**
   * This method returns a single unique transaction based on its ID.
   * @author Matthew R
   * @param id The unique ID of the transaction to find by.
   */
  public static async getTransactionById(id: string) {
    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction) return null;
    return transaction;
  }

  /**
   * This method returns all associated/related Transactions for the specified Account
   * @author Matthew R
   * @param accountID The ID for the Account entry to search transactions related to
   */
  public static async getAssociatedTransactionsForAccount(accountID: string) {
    const transactions = await prisma.transaction.findMany({
      where: { account: { id: accountID } },
    });
    if (!transactions || transactions?.length === 0) {
      return null;
    }
    return transactions;
  }

  /**
   * This method creates a single new transaction and saves the value in the database.
   * @author Matthew R
   * @param transaction An object containing information (required/optional) about the transaction to create.
   */
  public static async createTransaction(transaction: TransactionDetails) {
    // check required fields and return an error if one or more of them are not specified
    if (
      !transaction.amount ||
      !transaction.descriptor ||
      !transaction.type ||
      !transaction.category ||
      !transaction.accountID
    ) {
      throw new Error(
        `Expected 'transaction.amount', 'transaction.descriptor', 'transaction.type', 'transaction.category', and 'transaction.accountID' however one or more was not supplied.`
      );
    }
    // The query to send to the database is built here
    const query = {
      id: uuid(),
      amount: transaction.amount,
      descriptor: transaction.descriptor,
      type: transaction.type,
      category: transaction.category,
      // if the transaction post date is not specified then we default to the current time
      postedAt: transaction.postedAt ?? new Date(),
      // if the currency is not specified we default to USD
      currency: transaction.currency ?? "USD",
      account: {
        connect: { id: transaction.accountID },
      },
      // if the transaction created at date is not specified then we default to the current time
      createdAt: transaction.createdAt ?? new Date(),
    };
    try {
      // execute the query and return the result from the ORM
      return prisma.transaction.create({ data: query });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
