import { Server, Route, GPTInsightsManager } from "../util";

/**
 * @author Matthew R
 */
export default class InsightsRoute extends Route {
  constructor(server: Server) {
    super(server);
    this.conf.path = "/insights";
    this.server = server;
  }

  public bind() {
    this.router.get("/transactions-gpt", async (req, res) => {
      const account = await this.authenticate(req, res);
      if (!account) return;

      const response = await GPTInsightsManager.getBudgetRecommendationsForAccount(account.id);
      if (!response) return this.sendClientError(res);
      res.status(200).send(response);
      return;
    });
  }
}
