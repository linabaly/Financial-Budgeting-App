import TransactionManager, {
  RecurringTransactionDetails,
  RecurringTransactionFrequency,
  TransactionCategory,
  TransactionType,
} from "../util/TransactionManager";
import { Route, Server } from "../util";
import { PrismaDBClient } from "../index";

/**
 * @author Matthew R
 */
export default class RecurringTransactionRoute extends Route {
  constructor(server: Server) {
    super(server);
    this.conf.path = "/recurring-transaction";
    this.server = server;
  }

  public bind() {
    this.router.get("/", async (req, res) => {
      try {
        const account = await this.authenticate(req, res);
        if (!account) return;
        const recurringTransactions =
          await TransactionManager.getAssociatedRecurringTransactionsForAccount(account.id);
        if (!recurringTransactions || recurringTransactions.length < 1) {
          res.sendStatus(204);
          return;
        }
        res.status(200).json(recurringTransactions);
      } catch (error) {
        this.handleServerError(error as Error, res);
      }
    });

    this.router.get("/:id", async (req, res) => {
      try {
        if (!req.params.id || typeof req.params.id !== "string") return this.sendClientError(res);
        const account = await this.authenticate(req, res);
        if (!account) return;
        const recurringTransaction = await TransactionManager.getRecurringTransactionByID(
          req.params.id
        );
        if (!recurringTransaction) return this.sendClientError(res);
        // if the requested transaction owner isnt the authenticated user, sent forbidden
        if (recurringTransaction.accountId !== account.id) return this.sendForbidden(res);
        res.status(200).json(recurringTransaction);
        return;
      } catch (error) {
        return this.handleServerError(error as Error, res);
      }
    });

    this.router.post("/", async (req, res) => {
      try {
        // validator checks for required fields and their types
        if (
          !req.body.amount ||
          isNaN(Number(req.body.amount)) ||
          !req.body.descriptor ||
          !req.body.frequency ||
          !req.body.endDate
        ) {
          return this.sendClientError(res);
        }
        // authenticate the account
        const account = await this.authenticate(req, res);
        if (!account) return;
        // form the database query
        const passedRecurringTransactionDetails: RecurringTransactionDetails = {
          endDate: new Date(req.body.endDate),
          frequency: req.body.frequency,
          accountId: account.id,
          amount: Number(req.body.amount),
          category: req.body.category,
          descriptor: req.body.descriptor.trim(),
          startDate: req.body.startDate ? new Date(req.body.startDate) : new Date(),
          type: req.body.type,
        };
        const createQuery = await TransactionManager.createRecurringTransaction(
          passedRecurringTransactionDetails
        );
        // 201 CREATED
        res.status(201).json(createQuery);
        return;
      } catch (error) {
        return this.handleServerError(error as Error, res);
      }
    });

    this.router.patch("/:id", async (req, res) => {
      try {
        // check if the required parameters are present
        if (!req.params.id) return this.sendClientError(res);
        // check if the account can be found and authenticated
        const account = await this.authenticate(req, res);
        if (!account) return;
        // check if the recurring transaction requested can be located
        const transaction = await TransactionManager.getRecurringTransactionByID(req.params.id);
        if (!transaction) return this.sendNotFound(res);
        // if the requested transaction owner isnt the authenticated user, sent forbidden
        if (transaction.accountId !== account.id) return this.sendForbidden(res);
        // if type is submitted to update, ensure that the submitted type is typeof TransactionType
        if (req.body.type && !Object.values(TransactionType).includes(req.body.type.toUpperCase())) {
          return this.sendClientError(res);
        }
        // if category is submitted to update, ensure that the submitted category is typeof TransactionCategory
        if (req.body.category && !Object.values(TransactionCategory).includes(req.body.category.toUpperCase())) {
          return this.sendClientError(res);
        }
        // if frequency is submitted to update, ensure that the submitted frequency is typeof RecurringTransactionFrequency
        if (
          req.body.frequency &&
          !Object.values(RecurringTransactionFrequency).includes(req.body.frequency.toUpperCase())
        ) {
          return this.sendClientError(res);
        }

        const updateDetails: {
          amount?: number | undefined;
          category?: TransactionCategory | undefined;
          descriptor?: string | undefined;
          type?: TransactionType | undefined;
          frequency?: RecurringTransactionFrequency | undefined;
          endDate?: Date | undefined;
        } = {
          amount: !isNaN(Number(req.body.amount)) ? Number(req.body.amount) : undefined,
          category: req.body.category.toUpperCase() ?? undefined,
          descriptor:
            req.body.descriptor?.length > 1 ? req.body.descriptor.trim().toUpperCase() : undefined,
          frequency: req.body.frequency ? req.body.frequency.toUpperCase() : undefined,
          endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        };

        const updateQuery = await PrismaDBClient.recurringTransaction.update({
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
        // check if the required parameters are present
        if (!req.params.id) return this.sendClientError(res);
        // check if the account can be found and authenticated
        const account = await this.authenticate(req, res);
        if (!account) return;
        // check if the transaction requested can be located
        const transaction = await TransactionManager.getRecurringTransactionByID(req.params.id);
        if (!transaction) return this.sendNotFound(res);
        // if the requested transaction owner isnt the authenticated user, sent forbidden
        if (transaction.accountId !== account.id) return this.sendForbidden(res);

        try {
          await TransactionManager.deleteRecurringTransactionByID(req.params.id);
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
