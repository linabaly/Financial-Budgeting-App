import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

export let app: express.Application;

function setupExpressApplication(): express.Application {
  const expressApplication = express();
  expressApplication.use(cors()); // enables CORS
  expressApplication.use(bodyParser.json()); // parses JSON request bodies
  expressApplication.use(bodyParser.urlencoded({ extended: true })); // parses url-encoded request bodies
  expressApplication.use(cookieParser()); // parses cookies
  return expressApplication;
}

async function main() {
  const prisma = new PrismaClient();
  app = setupExpressApplication();

  app.listen(process.env.WEB_SERVER_PORT || 3000, () => {
    console.info(
      `Server is now running on ${process.env.WEB_SERVER_BASE_URL || "https://localhost"}:${process.env.WEB_SERVER_PORT || 3000}`
    );
  });
}

main();
