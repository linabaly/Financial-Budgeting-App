import { Router, Request, Response } from "express";
import { Server } from ".";
import SecurityManager from "./SecurityManager";
import AccountManager from "./AccountManager";

/**
 * @author Matthew R
 */
export interface HTTPResponseError {
  status: number;
  code?: number;
  text_code: keyof typeof Route.prototype.constants.messages | string;
  message?: Error | string;
}

/**
 * @author Matthew R
 */
export default class Route {
  public conf: { path: string; deprecated?: boolean; maintenance?: boolean };

  public server: Server;

  public router: Router;

  constructor(server: Server, path?: string) {
    this.conf = { path: path ?? "" };
    this.server = server;
    this.router = Router();
  }

  public bind() {}

  public init() {
    this.router.all("", (req, res, next) => {
      console.info(`'${req.method}' request from '${req.ip}' to '${req.hostname}${req.path}'.`);
      if (this.conf.maintenance === true)
        res.status(503).json({
          code: this.constants.codes.MAINTENANCE_OR_UNAVAILABLE,
          message: this.constants.messages.MAINTENANCE_OR_UNAVAILABLE,
        });
      else if (this.conf.deprecated === true)
        res.status(501).json({
          code: this.constants.codes.DEPRECATED,
          message: this.constants.messages.DEPRECATED,
        });
      else next();
    });
  }

  public deprecated(): void {
    this.router.all("*", (_req, res) => {
      res.status(501).json({
        code: this.constants.codes.DEPRECATED,
        message: this.constants.messages.DEPRECATED,
      });
    });
  }

  public maintenance(): void {
    this.router.all("*", (_req, res) => {
      res.status(503).json({
        code: this.constants.codes.MAINTENANCE_OR_UNAVAILABLE,
        message: this.constants.messages.MAINTENANCE_OR_UNAVAILABLE,
      });
    });
  }

  protected handleServerError(error: Error, res: Response) {
    res.status(500).json({
      code: this.constants.codes.SERVER_ERROR,
      message: this.constants.messages.SERVER_ERROR,
    });
    console.error(error);
  }

  protected handleError(error: HTTPResponseError, res: Response) {
    console.error(error);
    Object.freeze(res);
    res.status(error.status).json({
      // code: error.code,
      text_code: error.text_code,
      message: error.message,
    });
    return;
  }

  /**
   * This helper method takes an authentication token and authenticates the request. If it can authenticate, it'll return the account. If not, it will return null.
   * Do not attempt to continue responding to the request if this method returns null, as it will write to the response and close it afterwards.
   * After "null" is returned from this function, you should always return from the route function.
   * @author Matthew R
   * @param req The Request object from the router application
   * @param res The Response object from the router application
   * @protected
   */
  protected async authenticate(req: Request, res: Response) {
    try {
      // try to fetch the token from the cookies, if not default to authorization headers
      let token = req.cookies.token || req.headers.authorization;
      // if the token isn't located, throw a client error
      if (!token) {
        this.sendClientError(res);
        return null;
      }
      // JWT tokens for the project contain the Account's name and ID
      let decodedToken: { id: string; name: string } | null;
      try {
        decodedToken = SecurityManager.verifyToken(token);
      } catch {
        return null;
      }
      // if the token can not be verified, return a specific 401 Unauthorized stating the token is invalid
      if (!decodedToken) {
        this.handleError(
          {
            text_code: this.constants.messages.BEARER_TOKEN_INVALID[0],
            status: 401,
            message: this.constants.messages.BEARER_TOKEN_INVALID[1],
          },
          res
        );
        return null;
      }
      const account = await AccountManager.getAccount({ id: decodedToken.id });
      // if the account can not be located from the bearer token, just return a generic 401 Unauthorized error
      if (!account) {
        this.sendUnauthorized(res);
        return null;
      }
      return account;
    } catch (error) {
      console.error(error);
      this.sendUnauthorized(res);
      return null;
    }
  }

  /**
   * This is a helper method that writes the generic UNAUTHORIZED response back to the client.
   * @author Matthew R
   * @param res The Response object from Express to write to.
   * @protected
   */
  protected sendUnauthorized(res: Response) {
    return this.handleError(
      {
        text_code: this.constants.messages.UNAUTHORIZED[0],
        status: 401,
        message: this.constants.messages.UNAUTHORIZED[1],
      },
      res
    );
  }

  /**
   * This is a helper method that writes the generic CLIENT ERROR response back to the client.
   * @author Matthew R
   * @param res The Response object from Express to write to.
   * @protected
   */
  protected sendClientError(res: Response) {
    return this.handleError(
      {
        text_code: this.constants.messages.CLIENT_ERROR[0],
        status: 400,
        message: this.constants.messages.CLIENT_ERROR[1],
      },
      res
    );
  }

  /**
   * This is a helper method that writes the generic NOT FOUND response back to the client.
   * @author Matthew R
   * @param res The Response object from Express to write to.
   * @protected
   */
  protected sendNotFound(res: Response) {
    return this.handleError(
      {
        text_code: this.constants.messages.NOT_FOUND[0],
        status: 404,
        message: this.constants.messages.NOT_FOUND[1],
      },
      res
    );
  }

  /**
   * This is a helper method that writes the generic FORBIDDEN/PERMISSION DENIED response back to the client.
   * @author Matthew R
   * @param res The Response object from Express to write to.
   * @protected
   */
  protected sendForbidden(res: Response) {
    return this.handleError(
      {
        text_code: this.constants.messages.PERMISSION_DENIED[0],
        status: 403,
        message: this.constants.messages.PERMISSION_DENIED[1],
      },
      res
    );
  }

  get constants() {
    return {
      codes: {
        SUCCESS: 100,
        UNAUTHORIZED: 101,
        PERMISSION_DENIED: 104,
        ENDPOINT_NOT_FOUND: 104,
        NOT_FOUND: 1041,
        ACCOUNT_NOT_FOUND: 1041,
        CLIENT_ERROR: 1044,
        SERVER_ERROR: 105,
        DEPRECATED: 1051,
        MAINTENANCE_OR_UNAVAILABLE: 1053,
      },
      messages: {
        UNAUTHORIZED: ["CREDENTIALS_INVALID", "The credentials you supplied are invalid."],
        BEARER_TOKEN_INVALID: ["BEARER_TOKEN_INVALID", "The Bearer token you supplied is invalid."],
        PERMISSION_DENIED: [
          "PERMISSION_DENIED",
          "You do not have valid credentials to access this resource.",
        ],
        NOT_FOUND: ["NOT_FOUND", "The resource you requested cannot be located."],
        ENDPOINT_NOT_FOUND: [
          "ENDPOINT_NOT_FOUND",
          "The endpoint you requested does not exist or cannot be located.",
        ],
        CLIENT_ERROR: [
          "CLIENT_ERROR",
          "The information provided to this endpoint via headers, body, query, or parameters are invalid.",
        ],
        SERVER_ERROR: [
          "INTERNAL_ERROR",
          "An internal error has occurred, Engineers have been notified.",
        ],
        DEPRECATED: [
          "ENDPOINT_OR_RESOURCE_DEPRECATED",
          "The endpoint or resource you're trying to access has been deprecated.",
        ],
        MAINTENANCE_OR_UNAVAILABLE: [
          "SERVICE_UNAVAILABLE",
          "The endpoint or resource you're trying to access is either in maintenance or is not available.",
        ],
      },
    };
  }
}
