import { sendEmail } from "./EmailService";
import { PrismaDBClient } from "../index";

interface NotificationOptions {
  isScheduled?: boolean;
  accountId?: string;
  eventType?: "transaction" | "goal" | "budget" | "weekly" | "daily";
}

/**
 * Sends notification emails to a specific user or all users,
 * depending on the options passed.
 */
export async function dispatchEmailNotifications(options?: NotificationOptions) {
  const { isScheduled = false, accountId = null, eventType } = options ?? {};

  const preferences = await PrismaDBClient.notificationPreference.findMany({
    where: accountId ? { accountId } : undefined,
    include: { account: true },
  });

  for (const pref of preferences) {
    const {
      account,
      emailWeeklyReport,
      emailBudgetAlerts,
      emailTransactionUpdates,
      frequency,
    } = pref;

    const sections: string[] = [];
    const isRealTime = frequency === "real-time";
    const isDaily = frequency === "daily";

    // 🗓 Weekly Report (scheduled only)
    if (isScheduled && eventType === "weekly" && emailWeeklyReport) {
      sections.push(renderSection("📊 Weekly Report", "Your weekly spending summary is now available."));
    }

    // 📅 Daily Summary (scheduled only)
    if (isScheduled && eventType === "daily" && isDaily) {
      sections.push(renderSection("📅 Daily Summary", "Here’s your daily financial summary."));
    }

    // 💸 Transaction Alert
    if (!isScheduled && eventType === "transaction" && emailTransactionUpdates && isRealTime) {
      sections.push(renderSection("💸 Transaction Alert", "A new transaction was recorded in your account."));
    }

    // ⚠️ Budget Alert
    if (!isScheduled && eventType === "budget" && emailBudgetAlerts && isRealTime) {
      sections.push(renderSection("⚠️ Budget Alert", "You’ve exceeded one or more of your budget thresholds."));
    }

    // 🎯 Goal Update
    if (!isScheduled && eventType === "goal" && emailBudgetAlerts && isRealTime) {
      sections.push(renderSection("🎯 Goal Update", "You’ve added or changed a savings goal in your account."));
    }

    if (sections.length === 0) continue;

    const subject = buildSubject(sections);
    const html = buildHtml(account.name, sections);

    console.log(`📧 Sending notification to ${account.email} [${subject}]`);
    await sendEmail(account.email, subject, html);
    console.log(`📨 Email sent to ${account.email}`);
  }
}

/** Generates a formatted email section */
function renderSection(title: string, body: string): string {
  return `
    <section>
      <h3 style="color: #2c3e50;">${title}</h3>
      <p>${body}</p>
    </section>
  `;
}

/** Assembles the email subject line from the content sections */
function buildSubject(sections: string[]): string {
  const subjectParts: string[] = [];

  if (sections.some(s => s.includes("Weekly Report"))) subjectParts.push("📊 Weekly Report");
  if (sections.some(s => s.includes("Daily Summary"))) subjectParts.push("📅 Daily Summary");
  if (sections.some(s => s.includes("Transaction Alert"))) subjectParts.push("💸 Transaction Alert");
  if (sections.some(s => s.includes("Budget Alert"))) subjectParts.push("⚠️ Budget Alert");
  if (sections.some(s => s.includes("Goal Update"))) subjectParts.push("🎯 Goal Update");

  return `${subjectParts.join(" & ")} from Finovators`;
}

/** Wraps all sections into a styled email body */
function buildHtml(name: string, sections: string[]): string {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <h2 style="color: #34495e;">Hey ${name},</h2>
      ${sections.join(`<hr style="margin: 20px 0; border: none; border-top: 1px solid #ccc;" />`)}
      <p style="margin-top: 30px;">– Your Finovators Team</p>
    </div>
  `;
}
