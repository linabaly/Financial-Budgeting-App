import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { Server } from "./util";

export let MainServer: Server;
export let PrismaDBClient: PrismaClient;

/**
 * This function returns a new Prisma DB ORM client
 * @returns PrismaClient
 */
function setupPrismaClient() {
  return new PrismaClient();
}

/**
 * This function is the entry point for the application.
 */
async function main() {
  PrismaDBClient = setupPrismaClient();
  MainServer = new Server(
    Number(process.env.WEB_SERVER_PORT) || 5005,
    path.join(__dirname, "routes")
  );
  MainServer.listen(Number(process.env.WEB_SERVER_PORT) || 5005);
  console.info(`Server listening on port ${process.env.WEB_SERVER_PORT || 5005}`);
}

// This function starts the application.
main()
  .then((r) => r)
  .catch((error) => console.error(error));
