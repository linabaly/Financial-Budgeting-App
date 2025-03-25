import { Router, Response } from "express";
import { Server } from ".";

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

  public handleServerError(error: Error, res: Response) {
    res.status(500).json({
      code: this.constants.codes.SERVER_ERROR,
      message: this.constants.messages.SERVER_ERROR,
    });
    console.error(error);
  }

  public handleError(error: HTTPResponseError, res: Response) {
    res.status(error.status).json({
      // code: error.code,
      text_code: error.text_code,
      message: error.message,
    });
    console.error(error);
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
