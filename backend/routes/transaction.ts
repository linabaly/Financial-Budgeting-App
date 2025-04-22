import TransactionManager, {
  TransactionCategory,
  TransactionDetails,
  TransactionType,
} from "../util/TransactionManager";
import Route from "../util/Route";
import { PrismaDBClient } from "../index";
import { Server } from "../util";
import { dispatchEmailNotifications } from "../util/EmailDispatcher";

/**
 * @author Matthew R
 */
export default class TransactionRoute extends Route {
  constructor(server: Server) {
    super(server);
    this.conf.path = "/transaction";
    this.server = server;
  }

  public bind() {
    this.router.get("/", async (req, res) => {
      try {
        const account = await this.authenticate(req, res);
        if (!account) return;
        const transactions = await TransactionManager.getAssociatedTransactionsForAccount(
          account.id
        );
        if (!transactions || transactions.length < 1) {
          res.sendStatus(204);
          return;
        }
        res.status(200).json(transactions);
      } catch (error) {
        this.handleServerError(error as Error, res);
      }
    });

    this.router.get("/:id", async (req, res) => {
      try {
        if (!req.params.id || typeof req.params.id !== "string") return this.sendClientError(res);
        const account = await this.authenticate(req, res);
        if (!account) return;
        const transaction = await TransactionManager.getTransactionById(req.params.id);
        if (!transaction) return this.sendClientError(res);
        if (transaction.accountID !== account.id) return this.sendForbidden(res);
        res.status(200).json(transaction);
        return;
      } catch (error) {
        return this.handleServerError(error as Error, res);
      }
    });

    this.router.post("/", async (req, res) => {
      try {
        if (
          !req.body.amount ||
          isNaN(Number(req.body.amount)) ||
          !req.body.descriptor ||
          !req.body.type ||
          !req.body.category
        ) {
          return this.sendClientError(res);
        }
        const account = await this.authenticate(req, res);
        if (!account) return;

        const passedTransactionDetails: TransactionDetails = {
          accountID: account.id,
          amount: Number(req.body.amount),
          category: req.body.category.trim().toUpperCase(),
          descriptor: req.body.descriptor.trim().toUpperCase(),
          postedAt: req.body.postedAt ? new Date(req.body.postedAt) : new Date(),
          type: req.body.type.trim().toUpperCase(),
        };

        const createQuery = await TransactionManager.createTransaction(passedTransactionDetails);

        const prefs = await PrismaDBClient.notificationPreference.findUnique({
          where: { accountId: account.id }
        });

        if (prefs?.emailTransactionUpdates && prefs.frequency === "real-time") {
          console.log(`📧 Real-time transaction email triggered for ${account.email}`);
          await dispatchEmailNotifications({ isScheduled: false, accountId: account.id, eventType: "transaction" });
        }

        res.status(201).json(createQuery);
        return;
      } catch (error) {
        return this.handleServerError(error as Error, res);
      }
    });

    this.router.patch("/:id", async (req, res) => {
      try {
        if (!req.params.id) return this.sendClientError(res);
        const account = await this.authenticate(req, res);
        if (!account) return;
        const transaction = await TransactionManager.getTransactionById(req.params.id);
        if (!transaction) return this.sendNotFound(res);
        if (transaction.accountID !== account.id) return this.sendForbidden(res);
        if (req.body.type && !Object.values(TransactionType).includes(req.body.type)) {
          return this.sendClientError(res);
        }
        if (req.body.category && !Object.values(TransactionCategory).includes(req.body.category)) {
          return this.sendClientError(res);
        }

        const updateDetails: {
          id: string;
          amount?: number;
          category?: TransactionCategory;
          descriptor?: string;
          type?: TransactionType;
        } = {
          id: transaction.id,
        };

        if (req.body.amount) updateDetails.amount = req.body.amount;
        if (req.body.category) updateDetails.category = req.body.category.trim().toUpperCase();
        if (req.body.descriptor) updateDetails.descriptor = req.body.descriptor.trim().toUpperCase();
        if (req.body.type) updateDetails.type = req.body.type.trim().toUpperCase();

        const updateQuery = await PrismaDBClient.transaction.update({
          where: { id: transaction.id },
          data: updateDetails,
        });

        res.status(200).json(updateQuery);
        return;
      } catch (error) {
        return this.handleServerError(error as Error, res);
      }
    });

    this.router.delete("/:id", async (req, res) => {
      try {
        if (!req.params.id) return this.sendClientError(res);
        const account = await this.authenticate(req, res);
        if (!account) return;
        const transaction = await TransactionManager.getTransactionById(req.params.id);
        if (!transaction) return this.sendNotFound(res);
        if (transaction.accountID !== account.id) return this.sendForbidden(res);

        try {
          await TransactionManager.deleteTransactionByID(req.params.id);
        } catch {
          return this.sendClientError(res);
        }
        res.sendStatus(204);
      } catch (error) {
        return this.handleServerError(error as Error, res);
      }
    });
  }
}