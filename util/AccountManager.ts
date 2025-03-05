import { PrismaDBClient as prisma } from "../index";
import SecurityManager from "./SecurityManager";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AccountDetails {
  id?: string;
  username: string;
  password: string;
  email: string;
  name: string;
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
    // Check if email already exists
    const existingAccount = await prisma.account.findUnique({ where: { id: account.id } });
    if (existingAccount) {
      throw new Error(
        `Account with ID ${account.id} already exists, cannot create a new account for this user.`
      );
    }

    // Hash password
    account.password = await SecurityManager.hashPassword(account.password);

    // Create account
    return prisma.account.create({
      data: account,
    });
  }

  // Get Account
  public static async getAccount(account: AccountDetails) {
    const { id, email } = account;
    if (!id && !email) {
      throw new Error(
        `Provide account ID or email.`
      );
    }

    const accountDetails = await prisma.account.findUnique({ where: { id, email } });
    if (!accountDetails) {
      throw new Error(`Account not found.`);
    } 

    return accountDetails;

  }

  public static updateAccount();
  public static deleteAccount();
}
