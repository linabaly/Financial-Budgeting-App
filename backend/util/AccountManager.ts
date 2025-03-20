import { PrismaDBClient as prisma } from "../index";
import SecurityManager from "./SecurityManager";
import { v4 as uuid } from "uuid";

// const JWT_SECRET = process.env.JWT_SECRET;

export interface AccountDetails {
  id?: string;
  // username: string;
  password?: string;
  email?: string;
  name?: string;
  createdAt?: Date;
  budgets?: [];
  goals?: [];
  recurringTransactions?: [];
  transactions?: [];
}

export default class AccountManager {
  /**
   * This method creates a new account, provides password hashing internally, and stores the information in the database provided by the Prisma ORM.
   * @param account An object representing the "AccountDetails" interface.
   */
  public static async createAccount(account: AccountDetails) {
    if (!account.email || !account.name || !account.password || !account.email) {
      throw new Error(
        "account.email, account.name, account.password, and account.email are all required fields."
      );
    }
    // Check if email already exists
    const existingAccount = await prisma.account.findUnique({ where: { id: account.id, email: account.email } });
    if (existingAccount) {
      throw new Error(
        `Account with ID ${account.id} already exists, cannot create a new account for this user.`
      );
    }

    const query = {
      email: account.email,
      name: account.name,
      password: await SecurityManager.hashPassword(account.password),
      id: account.id ?? uuid(),
      createdAt: new Date(),
    };

    // Create account
    return prisma.account.create({
      data: query,
    });
  }

  // Get Account
  public static async getAccount(account: AccountDetails) {
    const { id, email } = account;
    if (!id && !email) {
      throw new Error(`Provide account ID or email.`);
    }

    const accountDetails = await prisma.account.findUnique({ where: { id, email } });
    if (!accountDetails) {
      throw new Error(`Account not found.`);
    }

    return accountDetails;
  }

  // Update Account
  public static async updateAccount(account: AccountDetails) {
    const { id, email, name, password } = account;

    // Make sure account id is provided
    if (!id) {
      throw new Error(`Provide account ID.`);
    }

    // Check if account exists
    const existingAccount = await prisma.account.findUnique({ where: { id } });
    if (!existingAccount) {
      throw new Error(`Account not found.`);
    }

    // Prepare the data to update
    const updateData = { name, email, password };

    // Hash password if changing password
    if (password) {
      updateData.password = await SecurityManager.hashPassword(password);
    }

    // Update account
    return prisma.account.update({
      where: { id },
      data: updateData,
    });
  }

  // delete account
  public static async deleteAccount(accountId: string) {
    if (!accountId) {
      throw new Error("Provide account ID.");
    }

    // Check if account exists
    const existingAccount = await prisma.account.findUnique({ where: { id: accountId } });
    if (!existingAccount) {
      throw new Error("Account not found.");
    }

    // Delete related data
    await prisma.budget.deleteMany({ where: { accountId } });
    await prisma.goal.deleteMany({ where: { accountId } });
    await prisma.recurringTransaction.deleteMany({ where: { accountId } });
    await prisma.transaction.deleteMany({ where: { accountId } });

    // Delete the account
    return prisma.account.delete({ where: { id: accountId } });
  }
}
