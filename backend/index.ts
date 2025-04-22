import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { Server } from "./util";
import cron from "node-cron";
import { dispatchEmailNotifications } from "./util/EmailDispatcher";
import express from 'express';

export let MainServer: Server;
export let PrismaDBClient: PrismaClient;

/**
 * Initializes a new Prisma DB client.
 */
function setupPrismaClient(): PrismaClient {
  return new PrismaClient();
}

/**
 * Bootstraps and starts the web server + scheduled jobs.
 */
async function main() {
  // Initialize Prisma and server
  PrismaDBClient = setupPrismaClient();
  MainServer = new Server(
    Number(process.env.WEB_SERVER_PORT) || 5005,
    path.join(__dirname, "routes")
  );

  MainServer.listen();
  console.info(`🚀 Server listening on port ${process.env.WEB_SERVER_PORT || 5005}`);

  // 🗓 Weekly Email: Every Monday at 9 AM
  cron.schedule("0 9 * * 1", async () => {
    console.log("⏰ Running weekly email dispatch...");
    try {
      await dispatchEmailNotifications({ isScheduled: true, eventType: "weekly" });
      console.log("✅ Weekly email dispatch complete.");
    } catch (err) {
      console.error("❌ Weekly email dispatch failed:", err);
    }
  });

  // 📅 Daily Email: Every day at 8 AM
  cron.schedule("0 8 * * *", async () => {
    console.log("⏰ Running daily email dispatch...");
    try {
      await dispatchEmailNotifications({ isScheduled: true, eventType: "daily" });
      console.log("✅ Daily email dispatch complete.");
    } catch (err) {
      console.error("❌ Daily email dispatch failed:", err);
    }
  });
}

// Start application
main().catch((error) => {
  console.error("🚨 Fatal startup error:", error);
});
