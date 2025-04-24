import { Server, Route, GoalManager } from "../util";
import { GoalDetails } from "../util/GoalManager";

type PassedGoalDetails = GoalDetails;
/**
 * @author Matthew R
 */
export default class GoalRoute extends Route {
  constructor(server: Server) {
    super(server);
    this.conf.path = "/goal";
    this.server = server;
  }

  public bind() {
    this.router.get("/", async (req, res) => {
      try {
        const account = await this.authenticate(req, res);
        if (!account) return;

        const goals = await GoalManager.getGoalsForAccount(account.id);
        if (!goals || goals.length < 1) {
          res.sendStatus(204);
          return;
        }
        res.status(200).json(goals);
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
        const goal = await GoalManager.getGoal(req.params.id);
        if (!goal) return this.sendClientError(res);
        // if the requested goal owner isn't the authenticated user, sent forbidden
        if (goal.accountId !== account.id) return this.sendForbidden(res);
        res.status(200).json(goal);
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
        const passedGoalDetails: PassedGoalDetails = {
          name: req.body.name,
          targetAmount: req.body.targetAmount,
          currentSaved: req.body.currentSaved,
          deadline: req.body.deadline,
        };

        const createQuery = await GoalManager.createGoal(account.id, passedGoalDetails);
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
        // locate the goal
        const goal = await GoalManager.getGoal(req.params.id);
        if (!goal) return this.sendNotFound(res);
        // form the database query
        const passedGoalDetails: PassedGoalDetails = {
          name: req.body.name,
          targetAmount: req.body.targetAmount,
          currentSaved: req.body.currentSaved,
          deadline: req.body.deadline,
        };
        try {
          const updateQuery = await GoalManager.updateGoal(goal.id, passedGoalDetails);
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
        // check if the goal requested can be located
        const goal = await GoalManager.getGoal(req.params.id);
        if (!goal) return this.sendNotFound(res);
        // if the requested goal owner isnt the authenticated user, sent forbidden
        if (goal.accountId !== account.id) return this.sendForbidden(res);

        try {
          await GoalManager.deleteGoal(req.params.id);
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
