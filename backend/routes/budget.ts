import { Server, Route, BudgetManager } from "../util";
import { BudgetDetails } from "../util/BudgetManager";

/**
 * @author Matthew R
 */
export default class BudgetRoute extends Route {
  constructor(server: Server) {
    super(server);
    this.conf.path = "/budget";
    this.server = server;
  }

  public bind() {
    this.router.get("/", async (req, res) => {
      try {
        const account = await this.authenticate(req, res);
        if (!account) return;

        const budgets = await BudgetManager.getBudgetsForAccountByID(account.id);
        if (!budgets || budgets.length < 1) {
          res.sendStatus(204);
          return;
        }
        res.status(200).json(budgets);
        return;
      } catch (error) {
        return this.handleServerError(error as Error, res);
      }
    });

    this.router.get("/:id", async (req, res) => {
      try {
        if (!req.params.id || typeof req.params.id !== "string") return this.sendClientError(res);
        const account = await this.authenticate(req, res);
        if (!account) return;
        const budget = await BudgetManager.getBudgetByID(req.params.id);
        if (!budget) return this.sendClientError(res);
        // if the requested budget owner isn't the authenticated user, sent forbidden
        if (budget.accountId !== account.id) return this.sendForbidden(res);
        res.status(200).json(budget);
        return;
      } catch (error) {
        return this.handleServerError(error as Error, res);
      }
    });

    this.router.post("/", async (req, res) => {
      try {
        // authenticate the account
        const account = await this.authenticate(req, res);
        if (!account) return;
        // form the database query
        const passedBudgetDetails: BudgetDetails = {
          limit: req.body.limit,
          category: req.body.category.toUpperCase(),
          startDate: new Date(req.body.startDate),
          endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
          createdAt: new Date(),
        };

        const createQuery = await BudgetManager.createBudget(account.id, passedBudgetDetails);
        // 201 CREATED
        res.status(201).json(createQuery);
      } catch (error) {
        if (error instanceof TypeError) {
          return this.handleError(
            {
              code: this.constants.codes.CLIENT_ERROR,
              text_code: "CLIENT_ERROR",
              status: 400,
              message: (error as Error).toString(),
            },
            res
          );
        }
        return this.handleServerError(error as Error, res);
      }
    });

    this.router.patch("/:id", async (req, res) => {
      try {
        if (!req.params.id || typeof req.params.id !== "string") return this.sendClientError(res);
        // authenticate the account
        const account = await this.authenticate(req, res);
        if (!account) return;
        // locate the budget
        const budget = await BudgetManager.getBudgetByID(req.params.id);
        if (!budget) return this.sendNotFound(res);
        // form the database query
        const passedBudgetDetails: BudgetDetails = {
          category: req.body.category.toUpperCase() || undefined,
          limit: Number(req.body.limit) || undefined,
          endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        };
        try {
          const updateQuery = await BudgetManager.updateBudget(budget.id, passedBudgetDetails);
          // 201 CREATED
          res.status(200).json(updateQuery);
        } catch (error) {
          return this.handleError(
            {
              code: this.constants.codes.CLIENT_ERROR,
              text_code: "CLIENT_ERROR",
              status: 400,
              message: (error as Error).toString(),
            },
            res
          );
        }
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
        // check if the budget requested can be located
        const budget = await BudgetManager.getBudgetByID(req.params.id);
        if (!budget) return this.sendNotFound(res);
        // if the requested budget owner isnt the authenticated user, sent forbidden
        if (budget.accountId !== account.id) return this.sendForbidden(res);

        try {
          await BudgetManager.deleteBudget(req.params.id);
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
