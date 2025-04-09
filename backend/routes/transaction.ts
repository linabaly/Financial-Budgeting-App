import AccountManager from "../util/AccountManager"; // TODO: AccountManager likely won't be required here
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
        if (!transaction) return this.sendClientError(res);
        // if the requested transaction owner isnt the authenticated user, sent forbidden
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
          typeof Number(req.body.amount) !== "number" ||
          !req.body.descriptor ||
          typeof req.body.descriptor !== "string"
        ) {
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
          category: req.body.category,
          descriptor: req.body.descriptor.trim(),
          postedAt: req.body.postedAt ? new Date(req.body.postedAt) : new Date(),
          type: req.body.type,
        };
        const createQuery = await TransactionManager.createTransaction(passedTransactionDetails);
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
        if (!account) return this.sendUnauthorized(res);
        // check if the transaction requested can be located
        const transaction = await TransactionManager.getTransactionById(req.params.id);
        if (!transaction) return this.sendNotFound(res);
        // if the requested transaction owner isnt the authenticated user, sent forbidden
        if (transaction.accountID !== account.id) return this.sendForbidden(res);
        // if type is submitted to update, ensure that the submitted type is typeof TransactionType
        if (req.body.type && !Object.values(TransactionType).includes(req.body.type)) {
          return this.sendClientError(res);
        }
        // if category is submitted to update, ensure that the submitted category is typeof TransactionCategory
        if (req.body.category && !Object.values(TransactionCategory).includes(req.body.category)) {
          return this.sendClientError(res);
        }

        const updateDetails: {
          id: string;
          amount?: number | undefined;
          category?: TransactionCategory | undefined;
          descriptor?: string | undefined;
          type?: TransactionType | undefined;
        } = {
          id: transaction.id,
        };

        if (req.body.amount) updateDetails.amount = req.body.amount;
        if (req.body.category) updateDetails.category = req.body.category;
        if (req.body.descriptor) updateDetails.descriptor = req.body.descriptor;
        if (req.body.type) updateDetails.type = req.body.type;

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
  }
}
