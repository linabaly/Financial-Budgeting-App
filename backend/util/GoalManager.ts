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
  /**
   * This method fetches all matching goals for the specified account by querying its ID
   * @author Matthew R
   * @param accountID The ID of the account to query by
   */
  public static async getGoalsForAccount(accountID: string) {
    const goals = await prisma.goal.findMany({
      where: { account: { id: accountID } },
    });
    if (!goals || goals?.length === 0) {
      return null;
    }
    return goals;
  }

  /**
   * This method fetches a goal with the queried ID
   * @author Matthew R
   * @param goalID The ID of the goal to fetch
   */
  public static async getGoal(goalID: string) {
    const goal = await prisma.goal.findUnique({ where: { id: goalID } });
    if (!goal) return null;
    return goal;
  }

  /**
   * This method creates a new goal with the specified data.
   * @author Matthew R
   * @param accountID The ID of the account to associate this goal with
   * @param goal
   * @param goal.name The name of the goal
   * @param goal.targetAmount The target amount for the goal
   * @param goal.currentSaved How much has been saved for the goal
   * @param goal.deadline The deadline date for the goal to be obtained by
   */
  public static async createGoal(accountID: string, goal: GoalDetails) {
    if (!goal.name || !goal.targetAmount || !accountID)
      throw new TypeError(
        "Missing required parameters. 'goal.name', 'goal.targetAmount', and 'goal.accountId' are required fields."
      );
    const account = await AccountManager.getAccount({ id: accountID });
    if (!account) throw new Error(`Account with ID '${accountID}' not found.`);

    const passedGoalQuery = {
      name: goal.name.trim(),
      targetAmount: Number(goal.targetAmount),
      currentSaved: goal.currentSaved ? Number(goal.currentSaved) : 0,
      createdAt: new Date(),
      accountId: account.id,
      deadline: goal.deadline ? new Date(goal.deadline) : undefined,
    };

    return PrismaDBClient.goal.create({ data: passedGoalQuery });
  }

  /**
   * this method updates the specified goal with the provided parameters
   * @param goalID
   * @param g
   */
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

  /**
   * This method deletes the specified goal
   * @author Matthew R
   * @param goalID The ID of the goal to delete
   */
  public static async deleteGoal(goalID: string) {
    const goal = await this.getGoal(goalID);
    if (!goal) throw new Error(`Goal with ID '${goalID}' not found.`);

    return PrismaDBClient.goal.delete({ where: { id: goalID } });
  }
}
