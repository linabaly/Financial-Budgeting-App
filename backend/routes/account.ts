import AccountManager from "../util/AccountManager";
import SecurityManager from "../util/SecurityManager";
import Route from "../util/Route";
import { PrismaDBClient } from "../index";
import { Server } from "../util";
/**
 * Route handler for all account-related operations.
 * Provides endpoints for login, account creation, password reset, profile retrieval, profile update, and account deletion.
 * @author Matthew R
 * @extends Route
 */
export default class AccountRoute extends Route {
  /**
   * Constructs the AccountRoute.
   * @param {Server} server - The server instance to attach routes to.
   */
  constructor(server: Server) {
    super(server);
    this.conf.path = "/account";
    this.server = server;
  }

  /**
   * Binds all account-related routes to the router.
   */
  public bind() {
    /**
     * POST /account/login
     * Authenticates a user and sets an HTTP-only token cookie.
     * @param {Request} req - Express request, expects { email, password } in body.
     * @param {Response} res - Express response.
     */
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

    /**
     * POST /account/create
     * Creates a new user account.
     * @param {Request} req - Express request, expects { email, password, name } in body.
     * @param {Response} res - Express response.
     */
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

    /**
     * PUT /account/reset-password
     * Resets the authenticated user's password.
     * @param {Request} req - Express request, expects { currentPassword, newPassword } in body.
     * @param {Response} res - Express response.
     */
    this.router.put("/reset-password", async (req, res) => {
      try {
        if (!req.body.currentPassword || !req.body.newPassword || req.body.newPassword?.length < 1)
          return this.sendClientError(res);
        const account = await this.authenticate(req, res);
        if (!account) return;

        const currentPasswordSecurity = await SecurityManager.verifyPassword(
          account.password,
          req.body.currentPassword
        );
        if (!currentPasswordSecurity) return this.sendForbidden(res);

        await AccountManager.updateAccount({
          id: account.id,
          password: req.body.newPassword.trim(),
        });
        res.sendStatus(204);
        return;
      } catch (error) {
        this.handleServerError(error as Error, res);
        return;
      }
    });

    /**
     * GET /account/me
     * Retrieves the authenticated user's account information.
     * @param {Request} req - Express request with authentication token.
     * @param {Response} res - Express response.
     */
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

    /**
     * PATCH /account/me
     * Updates the authenticated user's account details.
     * @param {Request} req - Express request, accepts optional { email, name } in body.
     * @param {Response} res - Express response.
     */
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

    /**
     * DELETE /account/me
     * Deletes the authenticated user's account.
     * @param {Request} req - Express request with authentication token.
     * @param {Response} res - Express response.
     */
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
