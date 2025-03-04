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
  public static async getAccount(req: any, res: any) {
    try {
      const { id } = req.body;
      const account = await prisma.account.findUnique({ where: { id } });
      if (!account) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(200).json({ account });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  public static updateAccount();
  public static deleteAccount();
}
