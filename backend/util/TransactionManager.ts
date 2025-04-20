import { v4 as uuid } from "uuid";
import { PrismaDBClient as prisma } from "../index";
import { Account } from "@prisma/client";

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export enum TransactionCategory {
  FOOD = "FOOD",
  RENT = "RENT",
  ENTERTAINMENT = "ENTERTAINMENT",
  UTILITIES = "UTILITIES",
  TRANSPORTATION = "TRANSPORTATION",
  HEALTHCARE = "HEALTHCARE",
  OTHER = "OTHER",
  PERSONAL = "PERSONAL",
  INCOME = "INCOME",
}

export interface TransactionDetails {
  id?: string;
  amount: number | string; // TODO Handle Decimal type
  descriptor: string;
  type: TransactionType;
  category: TransactionCategory;
  postedAt: Date;
  accountID: string;
  currency?: string;
  createdAt?: Date;
}

// TODO: this should be deleted, filtering should happen on the frontend
export interface TransactionFilters {
  accountId?: string;
  category?: TransactionCategory;
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
  categorySummary: Record<TransactionCategory, number>;
  monthlyBreakdown: Record<
    string,
    {
      income: number;
      expenses: number;
      net: number;
    }
  >;
}

export enum RecurringTransactionFrequency {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  BIWEEKLY = "BIWEEKLY",
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  BIANNUALLY = "BIANNUALLY",
  ANNUALLY = "ANNUALLY",
}

export interface RecurringTransactionDetails {
  account?: Account;
  accountId: string;
  amount: number;
  category: TransactionCategory;
  createdAt?: Date;
  descriptor: string;
  endDate: Date;
  frequency: RecurringTransactionFrequency;
  id?: string;
  startDate?: Date;
  type: TransactionType;
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
      postedAt: transaction.postedAt ? new Date(transaction.postedAt) : new Date(),
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

  /**
   * This method deletes a transaction from the database using its ID.
   * @author Matthew R
   * @param transactionID The ID of the transaction which is to be deleted.
   */
  public static async deleteTransactionByID(transactionID: string) {
    const transaction = this.getTransactionById(transactionID);
    if (!transaction) {
      throw new Error(`Transaction '${transactionID}' does not exist.`);
    }
    return prisma.transaction.delete({ where: { id: transactionID } });
  }

  /**
   * This method returns all associated/related RecurringTransactions for the specified Account
   * @author Matthew R
   * @param accountID The ID for the Account entry to search recurring transactions related to
   */
  public static async getAssociatedRecurringTransactionsForAccount(accountID: string) {
    const recurringTransactions = await prisma.recurringTransaction.findMany({
      where: { account: { id: accountID } },
    });
    if (!recurringTransactions || recurringTransactions?.length === 0) {
      return null;
    }
    return recurringTransactions;
  }

  /**
   * This method returns a RecurringTransaction object from the database using its ID
   * @author Matthew R
   * @param id The ID of the RecurringTransaction in which to fetch
   */
  public static async getRecurringTransactionByID(id: string) {
    const recurringTransaction = await prisma.recurringTransaction.findUnique({
      where: { id },
    });
    if (!recurringTransaction) return null;
    return recurringTransaction;
  }

  /**
   * This method creates a new RecurringTransaction and saves it in the database
   * @author Matthew R
   * @param recurringTransaction The constructed recurring transaction object
   */
  public static async createRecurringTransaction(
    recurringTransaction: RecurringTransactionDetails
  ) {
    // check required fields and return an error if one or more of them are not specified
    if (
      !recurringTransaction.amount ||
      !recurringTransaction.descriptor ||
      !recurringTransaction.type ||
      !recurringTransaction.category ||
      !recurringTransaction.accountId ||
      !recurringTransaction.frequency
    ) {
      throw new Error(
        `Expected 'recurringTransaction.amount', 'recurringTransaction.descriptor', 'recurringTransaction.type', 'recurringTransaction.category', 'recurringTransaction.frequency', and 'recurringransaction.accountId' however one or more was not supplied.`
      );
    }
    // The query to send to the database is built here
    const query = {
      id: uuid(),
      amount: recurringTransaction.amount,
      descriptor: recurringTransaction.descriptor,
      type: recurringTransaction.type,
      category: recurringTransaction.category,
      // if the transaction post date is not specified then we default to the current time
      startDate: recurringTransaction.startDate
        ? new Date(recurringTransaction.startDate)
        : new Date(),
      account: {
        connect: { id: recurringTransaction.accountId },
      },
      // if the transaction created at date is not specified then we default to the current time
      createdAt: recurringTransaction.createdAt ?? new Date(),
      endDate: recurringTransaction.endDate || null,
      frequency: recurringTransaction.frequency,
    };
    try {
      // execute the query and return the result from the ORM
      return prisma.recurringTransaction.create({ data: query });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public static async updateRecurringTransactionByID() {}

  /**
   * This method deletes a RecurringTransaction from the database using its ID.
   * @author Matthew R
   * @param id The ID of the recurring transaction which is to be deleted.
   */
  public static async deleteRecurringTransactionByID(id: string) {
    const transaction = this.getTransactionById(id);
    if (!transaction) {
      throw new Error(`Recurring Transaction '${id}' does not exist.`);
    }
    return prisma.transaction.delete({ where: { id } });
  }
}
