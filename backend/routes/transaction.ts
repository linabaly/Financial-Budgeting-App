import AccountManager from "../util/AccountManager";
import TransactionManager from "../util/TransactionManager";
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
      if (!req.query.id || typeof req.query.id !== "string") {
        return this.handleError(
          {
            text_code: this.constants.messages.CLIENT_ERROR[0],
            status: 400,
            message: this.constants.messages.CLIENT_ERROR[1],
          },
          res
        );
      }
      const transaction = await TransactionManager.getTransactionById(req.query.id);
      if (!transaction) return; // TODO: The rest of this still needs finished!!!
    });
  }
}
