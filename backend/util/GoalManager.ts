// model Goal {
//   id           String   @id @default(uuid())
//   account      Account  @relation(fields: [accountId], references: [id])
//   name         String
//   targetAmount Decimal  @default(0) @db.Decimal(10, 2)
//   currentSaved Decimal  @default(0) @db.Decimal(10, 2)
//   deadline     DateTime @default(now())
//   createdAt    DateTime @default(now())
//   accountId    String
// }

import { AccountManager } from ".";
import { Account } from "@prisma/client";
import { PrismaDBClient as prisma, PrismaDBClient } from "../index";

export interface GoalDetails {
  id?: string;
  account?: Account;
  name?: string;
  targetAmount?: number;
  currentSaved?: number;
  deadline?: Date;
  createdAt?: Date;
  accountId?: string;
}

export default class GoalManager {
  public static async getGoalsForAccount(accountID: string) {
    const goals = await prisma.goal.findMany({
      where: { account: { id: accountID } },
    });
    if (!goals || goals?.length === 0) {
      return null;
    }
    return goals;
  }

  public static async getGoal(goalID: string) {
    const goal = await prisma.goal.findUnique({ where: { id: goalID } });
    if (!goal) return null;
    return goal;
  }

  public static async createGoal(accountID: string, goal: GoalDetails) {
    if (!goal.name || !goal.targetAmount || !accountID) {
      console.log("MISSING FIELDS:", {
        name: goal.name,
        targetAmount: goal.targetAmount,
        accountID,
      });
      throw new TypeError(
        "Missing required parameters. 'goal.name', 'goal.targetAmount', and 'goal.accountId' are required fields."
      );
    }
    
    const account = await AccountManager.getAccount({ id: accountID });
    if (!account) throw new Error(`Account with ID '${accountID}' not found.`);

    // Create base query
    const passedGoalQuery: {
      name: string;
      targetAmount: number;
      currentSaved: number;
      createdAt: Date;
      accountId: string;
      deadline?: Date;
    } = {
      name: goal.name.trim(),
      targetAmount: Number(goal.targetAmount),
      currentSaved: goal.currentSaved ? Number(goal.currentSaved) : 0,
      createdAt: new Date(),
      accountId: account.id,
    };
    
    // Only add the deadline if it exists
    if (goal.deadline) {
      passedGoalQuery.deadline = new Date(goal.deadline);
    }

    const data: any = { ...passedGoalQuery };
    if (passedGoalQuery.deadline) {
      data.deadline = passedGoalQuery.deadline.toISOString();
    }
    return PrismaDBClient.goal.create({ data });
  }

  public static async updateGoal(goalID: string, g: GoalDetails) {
    if (!g.name && !g.targetAmount && !g.currentSaved && !g.deadline)
      throw new RangeError("No applicable data set to be modified.");
    const goal = await this.getGoal(goalID);
    if (!goal) throw new Error(`Goal with ID '${goalID}' not found.`);

    // Create an empty update object
    const updateDetails: {
      name?: string;
      targetAmount?: number;
      currentSaved?: number;
      deadline?: Date;
    } = {};

    // Only add fields that are provided
    if (g.name && g.name.length > 0) updateDetails.name = g.name.trim();
    if (g.targetAmount) updateDetails.targetAmount = Number(g.targetAmount);
    if (g.currentSaved !== undefined) updateDetails.currentSaved = Number(g.currentSaved);
    if (g.deadline) updateDetails.deadline = new Date(g.deadline);

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