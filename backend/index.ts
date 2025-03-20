import { PrismaClient } from "@prisma/client";
import { Server } from "./util";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import * as path from "node:path";

// export let ExpressApplication: express.Application;
export let MainServer: Server;
export let PrismaDBClient: PrismaClient;

function setupExpressApplication(): express.Application {
  const expressApplication = express();
  expressApplication.use(cors()); // enables CORS
  expressApplication.use(bodyParser.json()); // parses JSON request bodies
  expressApplication.use(bodyParser.urlencoded({ extended: true })); // parses url-encoded request bodies
  expressApplication.use(cookieParser()); // parses cookies
  return expressApplication;
}

function setupPrismaClient() {
  return new PrismaClient();
}

async function main() {
  // ExpressApplication = setupExpressApplication();
  PrismaDBClient = setupPrismaClient();
  MainServer = new Server(
    Number(process.env.WEB_SERVER_PORT) || 3000,
    path.join(__dirname, "routes")
  );
  MainServer.listen(Number(process.env.WEB_SERVER_PORT) || 3000);
  console.info(`Server listening on port ${process.env.WEB_SERVER_PORT || 3000}`);

  // ExpressApplication.listen(process.env.WEB_SERVER_PORT || 3000, () => {
  //   console.info(
  //     `Server is now running on ${process.env.WEB_SERVER_BASE_URL || "https://localhost"}:${process.env.WEB_SERVER_PORT || 3000}`
  //   );
  // });
}

main();
