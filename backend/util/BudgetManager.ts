import { AccountManager } from ".";
import { Account } from "@prisma/client";
import { PrismaDBClient as prisma, PrismaDBClient } from "../index";
import { TransactionCategory } from "./TransactionManager";

export interface BudgetDetails {
  id?: string;
  account?: Account;
  category?: TransactionCategory;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  accountId?: string;
}

export default class BudgetManager {
  public static async getBudgetsForAccountByID(accountID: string) {
    const budgets = await prisma.budget.findMany({
      where: { account: { id: accountID } },
    });
    if (!budgets || budgets?.length === 0) {
      return null;
    }
    return budgets;
  }

  public static async getBudgetByID(budgetID: string) {
    const budget = await prisma.budget.findUnique({ where: { id: budgetID } });
    if (!budget) return null;
    return budget;
  }

  public static async createBudget(accountID: string, budget: BudgetDetails) {
    if (!budget.category || !budget.limit || !accountID)
      throw new TypeError(
        "Missing required parameters. 'budget.category' and/or 'budget.limit' are required fields."
      );
    const account = await AccountManager.getAccount({ id: accountID });
    if (!account) throw new Error(`Account with ID '${accountID}' not found.`);

    const passedBudgetQuery = {
      category: budget.category,
      limit: Number(budget.limit),
      createdAt: new Date(),
      accountId: account.id,
      startDate: budget.startDate ? new Date(budget.startDate) : new Date(),
      endDate: budget.endDate ? new Date(budget.endDate) : new Date(),
    };

    return PrismaDBClient.budget.create({ data: passedBudgetQuery });
  }

  public static async updateBudget(budgetID: string, b: BudgetDetails) {
    if (!b.category && !b.limit && !b.endDate)
      throw new RangeError("No applicable data set to be modified.");
    const budget = await this.getBudgetByID(budgetID);
    if (!budget) throw new Error(`Budget with ID '${budgetID}' not found.`);

    const updateDetails = {
      category: b.category ? b.category : undefined,
      limit: b.limit ? Number(b.limit) : undefined,
      endDate: b.endDate ? new Date(b.endDate) : undefined,
    };

    return PrismaDBClient.budget.update({
      where: { id: budgetID },
      data: updateDetails,
    });
  }

  public static async deleteBudget(budgetID: string) {
    const budget = await this.getBudgetByID(budgetID);
    if (!budget) throw new Error(`Goal with ID '${budgetID}' not found.`);

    return PrismaDBClient.budget.delete({ where: { id: budgetID } });
  }
}
