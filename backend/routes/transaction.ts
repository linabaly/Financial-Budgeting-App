import AccountManager from "../util/AccountManager";
import TransactionManager, { TransactionDetails } from "../util/TransactionManager";
import Route from "../util/Route";
import { PrismaDBClient } from "../index"; // TODO: PrismaDBClient likely won't be required here
import { Server } from "../util";

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
        if (!account) return this.sendUnauthorized(res);
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
        if (!req.params.id || typeof req.params.id !== "string") {
          return this.handleError(
            {
              text_code: this.constants.messages.CLIENT_ERROR[0],
              status: 400,
              message: this.constants.messages.CLIENT_ERROR[1],
            },
            res
          );
        }
        const account = await this.authenticate(req, res);
        if (!account) return this.sendUnauthorized(res);
        const transaction = await TransactionManager.getTransactionById(req.params.id);
        if (!transaction) {
          return this.handleError(
            {
              text_code: this.constants.messages.CLIENT_ERROR[0],
              status: 400,
              message: this.constants.messages.CLIENT_ERROR[1],
            },
            res
          );
        }
        res.status(200).json(transaction);
        return;
      } catch (error) {
        return this.handleServerError(error as Error, res);
      }
    });

    this.router.post("/", async (req, res) => {
      try {
        if ((!req.body.amount || typeof Number(req.body.amount) !== "number") || (!req.body.descriptor || typeof req.body.descriptor !== "string") || (!req.body.type || typeof Number(req.body.type) !== "number") || (!req.body.amount || typeof Number(req.body.amount) !== "number") || (!req.body.category || typeof Number(req.body.category) !== "number")) {
          return this.handleError(
            {
              text_code: this.constants.messages.CLIENT_ERROR[0],
              status: 400,
              message: this.constants.messages.CLIENT_ERROR[1],
            },
            res
          );
        }
        const account = await this.authenticate(req, res);
        if (!account) return this.sendUnauthorized(res);
        const passedTransactionDetails: TransactionDetails = {
          accountID: account.id,
          amount: Number(req.body.amount),
          category: Number(req.body.category),
          descriptor: req.body.descriptor.trim(),
          postedAt: req.body.postedAt ? new Date(req.body.postedAt) : new Date(),
          type: Number(req.body.type),
        };
        const createQuery = await TransactionManager.createTransaction(passedTransactionDetails);
        res.status(200).json(createQuery);
        return;
      } catch (error) {
        return this.handleServerError(error as Error, res);
      }
    });
  }
}
