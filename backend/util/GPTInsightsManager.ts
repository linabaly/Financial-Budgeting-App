import OpenAI from "openai";
import { TransactionManager } from ".";

export default class GPTInsightsManager {
  public static async getBudgetRecommendationsForAccount(accountID: string) {
    const transactions = await TransactionManager.getAssociatedTransactionsForAccount(accountID);
    if (!transactions || transactions.length < 1) return null;
    const openai = new OpenAI({
      apiKey: process.env["CHATGPT_API_KEY"],
    });
    const response = await openai.responses.create({
      model: "gpt-4.1",
      instructions:
        "You are calculating budget insights for transactions from a database using the 50/30/20 rule. The transactions will be provided as as JSON array. Please provide your response as a straight HTML string with no markdown and no styling or CSS only HTML.",
      input: JSON.stringify(transactions),
    });
    return response.output_text;
  }
}
