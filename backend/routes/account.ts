import AccountManager from "../util/AccountManager";
import SecurityManager from "../util/SecurityManager";
import Route from "../util/Route";
import { PrismaDBClient } from "../index";
import { Server } from "../util";
import { Request, Response, RequestHandler } from "express";
import { dispatchEmailNotifications } from "../util/EmailDispatcher";
import multer from 'multer';
import path from 'path';

import fs from 'fs';

// Ensure uploads/avatars folder exists
const avatarDir = path.join(__dirname, "../../uploads/avatars");
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

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
      console.log("🟡 Login route hit");
      console.log("Body:", req.body);
    
      if (!req.body.email || !req.body.password) {
        console.log("❌ Missing email or password");
        return this.sendClientError(res);
      }
    
      const passedCreds = {
        email: req.body.email,
        cleartextPassword: req.body.password,
      };
    
      const account = await PrismaDBClient.account.findUnique({
        where: { email: passedCreds.email },
      });
    
      if (!account) {
        console.log("❌ No account found for this email");
        return this.sendUnauthorized(res);
      }
    
      const passwordMatch = await SecurityManager.verifyPassword(account.password, passedCreds.cleartextPassword);
      if (!passwordMatch) {
        console.log("❌ Password mismatch");
        return this.sendUnauthorized(res);
      }
    
      try {
        const token = SecurityManager.generateToken({ id: account.id, name: account.name });
        console.info(
          `✅ Logged into account '${account.email}' with IP '${req.ip}'`
        );
    
        res.cookie("token", token, {
          httpOnly: true,
          sameSite: "lax",
          maxAge: 3600000,
        });
    
        res.status(200).json({
          id: account.id,
          email: account.email,
          token,
        });
      } catch (error) {
        this.handleServerError(error as Error, res);
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
        await PrismaDBClient.notificationPreference.create({
          data: {
            accountId: account.id,
            emailWeeklyReport: true,
            emailBudgetAlerts: true,
            emailTransactionUpdates: false,
            pushLowBalance: true,
            pushUnusualActivity: true,
            pushGoalProgress: false,
            smsCriticalAlerts: false,
            smsPaymentReminders: false,
            frequency: "real-time",
          },
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
        if (!account) return res.status(401).json({ message: "Unauthorized" });
        res.status(200).json({
          id: account.id,
          name: account.name,
          email: account.email,
          avatarUrl: account.avatarUrl,
        });
      } catch (error) {
        this.handleServerError(error as Error, res);
      }
    });    

    this.router.patch("/me", async (req, res) => {
      try {
        const account = await this.authenticate(req, res);
        if (!account) return res.status(401).json({ message: "Unauthorized" });

        const { email, name, password, currentPassword } = req.body;
        if (!email && !name && !password) return this.sendClientError(res);

        const updateDetails: {
          id: string;
          name?: string;
          email?: string;
          password?: string;
        } = { id: account.id };

        if (password) {
          if (!currentPassword) {
            res.status(400).json({ message: "Current password required to change password" });
            return;
          }

          const valid = await SecurityManager.verifyPassword(account.password, currentPassword);
          if (!valid) {
            this.sendUnauthorized(res);
            return;
          }

          const hashed = await SecurityManager.hashPassword(password);
          updateDetails.password = hashed;
        }

        if (email) updateDetails.email = email.trim();
        if (name) updateDetails.name = name.trim();

        const updated = await AccountManager.updateAccount(updateDetails);
        updated.password = "[REDACTED]";
        res.status(200).json(updated);
      } catch (error) {
        return this.handleServerError(error as Error, res);
      }
    });

    this.router.delete("/me", async (req, res) => {
      try {
        const account = await this.authenticate(req, res);
        if (!account) return res.status(401).json({ message: "Unauthorized" });
        const deletionQuery = await AccountManager.deleteAccount(account.id);
        if (!deletionQuery) return this.sendClientError(res);
        res.sendStatus(204);
      } catch (error) {
        return this.handleServerError(error as Error, res);
      }
    });

    this.router.get("/notifications", async (req, res) => {
      try {
        const account = await this.authenticate(req, res);
        if (!account) return res.status(401).json({ message: "Unauthorized" });

        const preferences = await PrismaDBClient.notificationPreference.findUnique({
          where: { accountId: account.id },
        });

        res.json(preferences);
      } catch (error) {
        res.status(500).json({ message: "Failed to load notification preferences" });
      }
    });

    this.router.patch("/notifications", async (req: Request, res: Response) => {
      try {
        const account = await this.authenticate(req, res);
        if (!account) return res.status(401).json({ message: "Unauthorized" });

        const requiredFields = [
          "emailWeeklyReport",
          "emailBudgetAlerts",
          "emailTransactionUpdates",
          "pushLowBalance",
          "pushUnusualActivity",
          "pushGoalProgress",
          "smsCriticalAlerts",
          "smsPaymentReminders",
          "frequency",
        ];

        const missingFields = requiredFields.filter((field) => !(field in req.body));
        if (missingFields.length > 0) {
          return res.status(400).json({ message: `Missing fields: ${missingFields.join(", ")}` });
        }

        const updated = await PrismaDBClient.notificationPreference.upsert({
          where: { accountId: account.id },
          update: req.body,
          create: { ...req.body, accountId: account.id },
        });

        res.json(updated);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to save preferences" });
        
      }
    });

    this.router.post("/dispatch-emails", async (_req, res) => {
      try {
        await dispatchEmailNotifications();
        res.status(200).json({ message: "Emails sent" });
      } catch (err) {
        console.error("Email dispatch failed", err);
        res.status(500).json({ message: "Failed to send emails" });
      }
    });

    this.router.post("/reset-password", async (req, res) => {
      const { email, password } = req.body;
    
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
    
      const account = await PrismaDBClient.account.findUnique({ where: { email } });
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
    
      const hashed = await SecurityManager.hashPassword(password);
      const updated = await PrismaDBClient.account.update({
        where: { email },
        data: { password: hashed },
      });
    
      res.status(200).json({ message: "Password reset successful" });
    });    

    const storage = multer.diskStorage({
      destination: "uploads/avatars",
      filename: (req, file, cb) => {
        // Normalize filename: lowercase, replace spaces, remove special chars
        const normalized = file.originalname
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_\-.]/g, "");
        cb(null, `${Date.now()}-${normalized}`);
      },
    });    
    
    const upload = multer({ storage });
    
    this.router.post("/avatar", upload.single("avatar"), async (req, res) => {
      try {
        const account = await this.authenticate(req, res);
        if (!account) {
          console.log("❌ Unauthorized request");
          return res.status(401).json({ message: "Unauthorized" });
        }
    
        if (!req.file) {
          console.log("❌ No file uploaded");
          return res.status(400).json({ message: "No file uploaded" });
        }
    
        // ✅ Fetch current avatar URL from the DB
        const existingAccount = await PrismaDBClient.account.findUnique({
          where: { id: account.id },
        });
    
        console.log("📁 Existing avatar URL:", existingAccount?.avatarUrl);
    
        // ✅ Attempt to delete old file if it exists
        if (account.avatarUrl) {
          const oldAvatarPath = path.join(__dirname, "../uploads/avatars", path.basename(account.avatarUrl));
          console.log("🗑️ Deleting old avatar at:", oldAvatarPath);
          try {
            if (fs.existsSync(oldAvatarPath)) {
              fs.unlinkSync(oldAvatarPath);
              console.log("✅ Old avatar deleted.");
            } else {
              console.warn("❓ Old avatar not found:", oldAvatarPath);
            }
          } catch (err) {
            console.error("❌ Failed to delete old avatar:", err);
          }
        }             
    
        // Save new avatar path
        const avatarFilename = req.file.filename;
        const avatarUrl = `/uploads/avatars/${avatarFilename}`;
        await PrismaDBClient.account.update({
          where: { id: account.id },
          data: { avatarUrl },
        });
    
        console.log("✅ New avatar saved:", avatarUrl);
    
        res.status(200).json({ avatarUrl });
      } catch (error) {
        console.error("❌ Avatar upload failed:", error);
        res.status(500).json({ message: "Failed to upload avatar" });
      }
    });
    
  }
}