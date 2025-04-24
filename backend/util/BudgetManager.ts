// enum TransactionCategory {
//   FOOD
//   RENT
//   ENTERTAINMENT
//   UTILITIES
//   TRANSPORTATION
//   HEALTHCARE
//   OTHER
//   INCOME
//   PERSONAL
// }
//
// model Budget {
//   id        String              @id @default(uuid()) // UUID instead of auto-incrementing INT
//   category  TransactionCategory
//   limit     Decimal             @db.Decimal(10, 2)
//   accountId String // Foreign Key linking to Account
//   createdAt DateTime            @default(now())
//   startDate DateTime
//   endDate   DateTime
//
//   // Relationship to Account model
//   account Account @relation(fields: [accountId], references: [id], onDelete: Cascade)
// }

import { AccountManager } from ".";
import { Account } from "@prisma/client";
import { PrismaDBClient as prisma, PrismaDBClient } from "../index";
import { TransactionCategory } from "./TransactionManager";

export interface BudgetDetails {
  id?: string;
  account?: Account;
  category?: TransactionCategory;
  limit?: number;
  currentSaved?: number;
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

//   export interface BudgetDetails {
//   id?: string;
//   account?: Account;
//   category?: TransactionCategory;
//   limit?: number;
//   currentSaved?: number;
//   startDate?: Date;
//   createdAt?: Date;
//   accountId?: string;
// }

  public static async createBudget(accountID: string, budget: BudgetDetails) {
    if (!budget.category || !budget.limit || !accountID)
      throw new TypeError(
        "Missing required parameters. 'budget.category' and/or 'budget.limit' are required fields."
      );
    const account = await AccountManager.getAccount({ id: accountID });
    if (!account) throw new Error(`Account with ID '${accountID}' not found.`);

    const passedBudgetQuery = {
      category: budget.category.trim(),
      limit: Number(budget.limit),
      currentSaved: budget.currentSaved ? Number(budget.currentSaved) : 0,
      createdAt: new Date(),
      accountId: account.id,
      startDate: budget.startDate ? new Date(budget.startDate) : new Date(),
      endDate: budget.endDate ? new Date(budget.endDate) : new Date(),
    };

    return PrismaDBClient.budget.create({ data: passedBudgetQuery });
  }

  public static async updateGoal(goalID: string, g: GoalDetails) {
    if (!g.name && !g.targetAmount && !g.currentSaved && !g.deadline)
      throw new RangeError("No applicable data set to be modified.");
    const goal = await this.getGoal(goalID);
    if (!goal) throw new Error(`Goal with ID '${goalID}' not found.`);

    const updateDetails = {
      name: g.name && g.name.length > 0 ? g.name.trim() : undefined,
      targetAmount: g.targetAmount ? Number(g.targetAmount) : undefined,
      currentSaved: g.currentSaved ? Number(g.currentSaved) : undefined,
      deadline: g.deadline ? new Date(g.deadline) : undefined,
    };

    return PrismaDBClient.goal.update({
      where: { id: goalID },
      data: updateDetails,
    });
  }

  public static async deleteGoal(goalID: string) {
    const goal = await this.getGoal(goalID);
    if (!goal) throw new Error(`Goal with ID '${goalID}' not found.`);

    return PrismaDBClient.goal.delete({ where: { id: goalID } });
  }
}
