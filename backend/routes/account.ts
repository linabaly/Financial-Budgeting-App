import AccountManager from "../util/AccountManager";
import SecurityManager from "../util/SecurityManager";
import Route from "../util/Route";
import { PrismaDBClient } from "../index";
import { Server } from "../util";

export default class AccountRoute extends Route {
  constructor(server: Server) {
    super(server);
    this.conf.path = "/account";
    this.server = server;
  }

  public bind() {
    this.router.post("/login", async (req, res) => {
      if (!req.body.email || !req.body.password) {
        return this.handleError(
          {
            text_code: this.constants.messages.CLIENT_ERROR[0],
            status: 403,
            message: this.constants.messages.CLIENT_ERROR[1],
          },
          res
        );
      }
      const passedCreds = {
        email: req.body.email,
        cleartextPassword: req.body.password,
      };

      const account = await PrismaDBClient.account.findUnique({
        where: { email: passedCreds.email },
      });
      if (!account) {
        return this.handleError(
          {
            text_code: this.constants.messages.UNAUTHORIZED[0],
            status: 403,
            message: this.constants.messages.UNAUTHORIZED[1],
          },
          res
        );
      }
      if (
        !(await SecurityManager.verifyPassword(account.password, passedCreds.cleartextPassword))
      ) {
        return this.handleError(
          {
            text_code: this.constants.messages.UNAUTHORIZED[0],
            status: 403,
            message: this.constants.messages.UNAUTHORIZED[1],
          },
          res
        );
      }
      try {
        const token = SecurityManager.generateToken({ id: account.id, name: account.name });
        console.info(`Logged into account ${account.email} with token ${token}`);
        res.cookie("token", token, {
          httpOnly: true,
          sameSite: "lax",
          maxAge: 3600000,
        });
        res.status(200).json({
          email: account.email,
          token,
        });
        return;
      } catch (error) {
        this.handleServerError(error as Error, res);
        return;
      }
    });

    this.router.post("/create", async (req, res) => {
      if (!req.body.email || !req.body.password || !req.body.name) {
        return this.handleError(
          {
            text_code: this.constants.messages.CLIENT_ERROR[0],
            status: 400,
            message: this.constants.messages.CLIENT_ERROR[1],
          },
          res
        );
      }
      const accountDetails = {
        email: req.body.email,
        password: req.body.password.trim(),
        name: req.body.name,
      };
      if (await PrismaDBClient.account.findUnique({ where: { email: accountDetails.email } })) {
        // TODO: remove testing commands
        // await PrismaDBClient.account.delete({ where: { email: accountDetails.email } });
        // return res.sendStatus(202);
        return this.handleError(
          {
            text_code: this.constants.messages.PERMISSION_DENIED[0],
            status: 403,
            message: this.constants.messages.PERMISSION_DENIED[1],
          },
          res
        );
      }
      try {
        const account = await AccountManager.createAccount({
          email: accountDetails.email,
          name: accountDetails.name,
          password: accountDetails.password,
        });
        console.info(account);
        res.status(200).json(account);
        return;
      } catch (error) {
        this.handleServerError(error as Error, res);
        return;
      }
    });

    this.router.get("/me", async (req, res) => {
      try {
        const account = await this.authenticate(req, res);
        if (!account) return;
        res.status(200).json(account);
        return;
      } catch (error) {
        this.handleServerError(error as Error, res);
        return;
      }
    });

    this.router.patch("/me", async (req, res) => {
      try {
        if (!req.body.email && !req.body.name) {
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
        const updateDetails: {
          id: string;
          name?: string | undefined;
          email?: string | undefined;
        } = {
          id: account.id,
        };
        if (req.body.email) updateDetails.email = req.body.email.trim();
        if (req.body.name) updateDetails.name = req.body.name.trim();
        const updateQuery = await AccountManager.updateAccount(updateDetails);
        updateQuery.password = "[REDACTED]";
        res.status(200).json(updateQuery);
      } catch (error) {
        return this.handleServerError(error as Error, res);
      }
    });

    this.router.delete("/me", async (req, res) => {
      try {
        const account = await this.authenticate(req, res);
        if (!account) return this.sendUnauthorized(res);
        const deletionQuery = await AccountManager.deleteAccount(account.id);
        if (!deletionQuery) {
          return this.handleError(
            {
              text_code: this.constants.messages.CLIENT_ERROR[0],
              status: 400,
              message: this.constants.messages.CLIENT_ERROR[1],
            },
            res
          );
        }
        res.sendStatus(204);
        return;
      } catch (error) {
        return this.handleServerError(error as Error, res);
      }
    });
  }
}
