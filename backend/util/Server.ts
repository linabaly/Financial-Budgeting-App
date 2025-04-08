import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import { Server as HTTPServer } from "http";
import { Collection, Route } from ".";
import cookieParser from "cookie-parser";

/**
 * @author Matthew R
 */
export default class Server {
  public app: express.Application;

  public routes: Collection<Route>;

  public port: number;

  private readonly root: string;

  protected parse: boolean;

  constructor(port: number, routeRoot: string, parse = true) {
    this.app = express();
    this.routes = new Collection<Route>();
    this.port = port;
    this.root = routeRoot;

    this.parse = parse;

    this.init();
    this.loadRoutes().catch((error) => console.error(error));
  }

  public async loadRoutes() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const routes = Object.values<typeof Route>(require(this.root));
    for (const RouteFile of routes) {
      const route = new RouteFile(this);
      if (route.conf.deprecated) {
        route.deprecated();
      } else if (route.conf.maintenance) {
        route.maintenance();
      } else {
        route.init();
        route.bind();
      }
      console.info(`Successfully loaded route 'http://localhost:${this.port}/${route.conf.path}'.`);
      this.routes.add(route.conf.path, route);
      this.app.use(route.conf.path, route.router);
    }
  }

  public init() {
    if (this.parse) {
      this.app.use(bodyParser.json());
      this.app.use(bodyParser.urlencoded({ extended: true }));
      this.app.use(cookieParser());
    }
    this.app.set("trust proxy", "loopback");
    this.app.use(
      cors({
        origin: "*",
      })
    );
    this.app.use(
      helmet({
        crossOriginResourcePolicy: {
          policy: "cross-origin",
        },
        hsts: false,
        hidePoweredBy: false,
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
          },
        },
      })
    );
  }

  /**
   * @author Matthew R
   * @param port The optional port to listen on. If `this.port` is defined, then that takes priority. If `this.port` is undefined then it uses the parameter passed to method. If no parameter is passed and `this.port` is undefined, it defaults to port 3000.
   */
  public listen(port = 3000): HTTPServer {
    return this.app.listen(this.port ?? port);
  }
}
