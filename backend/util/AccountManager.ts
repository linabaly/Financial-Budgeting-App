import { v4 as uuid } from "uuid";
import { PrismaDBClient as prisma } from "../index";
import { SecurityManager } from ".";

/**
 * @author Matthew R
 */
export interface AccountDetails {
  id?: string;
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
   * @author Matthew R
   * @param account An object representing the "AccountDetails" interface.
   */
  public static async createAccount(account: AccountDetails) {
    if (!account.email || !account.name || !account.password || !account.email) {
      throw new Error(
        "account.email, account.name, account.password, and account.email are all required fields."
      );
    }
    // Check if email already exists
    const existingAccount = await prisma.account.findUnique({
      where: { id: account.id, email: account.email },
    });
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

  /**
   * This function retrieves the database entry for an account matching the corresponding query.
   * @author Yana Y
   * @param account An object containing the ID and/or email to query by
   */
  public static async getAccount(account: { id?: string; email?: string }) {
    const { id, email } = account;
    if (!id && !email) {
      throw new Error(`Provide account ID or email.`);
    }

    const accountDetails = await prisma.account.findUnique({ where: { id, email } });
    if (!accountDetails) return null;

    return accountDetails;
  }

  /**
   * This method updates an account
   * @author Yana Y, Matthew R
   * @param account.id The ID of the account to update
   * @param account.email The updated email, if applicable, to write on update
   * @param account.name The updated name, if applicable, to write on update
   * @param account.password The updated password (in plaintext/cleartext), if applicable, to write on update
   */
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

  /**
   * This method deletes an account.
   * @author Lina B
   * @param id The ID of the account in which is to be deleted.
   */
  public static async deleteAccount(id: string) {
    if (!id) {
      throw new Error("Provide account ID.");
    }

    // Check if account exists
    const existingAccount = await prisma.account.findUnique({ where: { id: id } });
    if (!existingAccount) {
      throw new Error("Account not found.");
    }

    // Delete related data
    await prisma.budget.deleteMany({ where: { accountId: id } });
    await prisma.goal.deleteMany({ where: { accountId: id } });
    await prisma.recurringTransaction.deleteMany({ where: { accountId: id } });
    await prisma.transaction.deleteMany({ where: { accountID: id } });

    // Delete the account
    return prisma.account.delete({ where: { id: id } });
  }
}
