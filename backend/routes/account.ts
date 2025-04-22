import AccountManager from "../util/AccountManager";
import SecurityManager from "../util/SecurityManager";
import Route from "../util/Route";
import { PrismaDBClient } from "../index";
import { Server } from "../util";

/**
 * @author Matthew R
 */
export default class AccountRoute extends Route {
  constructor(server: Server) {
    super(server);
    this.conf.path = "/account";
    this.server = server;
  }

  public bind() {
    this.router.post("/login", async (req, res) => {
      if (!req.body.email || !req.body.password) return this.sendClientError(res);
      const passedCreds = {
        email: req.body.email,
        cleartextPassword: req.body.password,
      };

      const account = await AccountManager.getAccount({ email: passedCreds.email });
      if (!account) return;
      if (!(await SecurityManager.verifyPassword(account.password, passedCreds.cleartextPassword)))
        return this.sendUnauthorized(res);
      try {
        const token = SecurityManager.generateToken({ id: account.id, name: account.name });
        console.info(
          `Logged into account '${account.email}' with token '[REDACTED]' with IP address '${req.ip}'`
        );
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
      if (!req.body.email || !req.body.password || !req.body.name) return this.sendClientError(res);
      const accountDetails = {
        email: req.body.email,
        password: req.body.password.trim(),
        name: req.body.name,
      };
      if (await PrismaDBClient.account.findUnique({ where: { email: accountDetails.email } }))
        return this.sendForbidden(res);
      try {
        const account = await AccountManager.createAccount({
          email: accountDetails.email,
          name: accountDetails.name,
          password: accountDetails.password,
        });
        res.status(201).json(account);
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
        if (!req.body.email && !req.body.name) return this.sendClientError(res);
        const account = await this.authenticate(req, res);
        if (!account) return;
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
        return;
      } catch (error) {
        return this.handleServerError(error as Error, res);
      }
    });

    this.router.delete("/me", async (req, res) => {
      try {
        const account = await this.authenticate(req, res);
        if (!account) return;
        const deletionQuery = await AccountManager.deleteAccount(account.id);
        if (!deletionQuery) return this.sendClientError(res);
        res.sendStatus(204);
        return;
      } catch (error) {
        return this.handleServerError(error as Error, res);
      }
    });
  }
}
