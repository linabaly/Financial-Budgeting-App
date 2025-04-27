import OpenAI from "openai";
import { TransactionManager } from ".";

export default class GPTInsightsManager {
  /**
   * This method produces a specifically formatted AI response to get budget insights and recommendations for a specific account's transactions
   * @author Matthew R
   * @param accountID The ID of the account to generate insights for
   */
  public static async getBudgetRecommendationsForAccount(accountID: string) {
    const transactions = await TransactionManager.getAssociatedTransactionsForAccount(accountID);
    if (!transactions || transactions.length < 1) return null;
    const openai = new OpenAI({
      apiKey: process.env["CHATGPT_API_KEY"],
    });
    const prompt = `You are a financial expert and skilled UX content strategist.\nGenerate a structured, compact, and highly personalized HTML financial report using the 50/30/20 rule based on the provided transaction data. Focus especially on producing meaningful, data-driven insights in the Personalized Recommendations section.\nYour response must:\n- Be valid HTML only (no Markdown, CSS, or scripts)\n- Fill the entire width of a dashboard container\n- Avoid large vertical spacing between sections (tight spacing, clear breaks)\n- Use semantic HTML tags like <section>, <header>, <article>, <ul>, <li>, <strong>, <em>, etc.\n- Include emoji in section headings (e.g., 💸 for Expenses, 📋 for Recommendations)\n- Use <span class="highlight-[type]"> to flag visually styled values (e.g., highlight-wants, highlight-needs, highlight-savings, highlight-warning)\n- Group categories logically and summarize spending\n- Use brief paragraphs followed by clear <ul> bullet lists where appropriate\n\n<section id="recommendations">:\n- Give 4–6 truly personalized recommendations based on the spending patterns\n- Each should be 1–2 sentences long and go beyond general advice\n- Reference specific amounts and categories from the data\n- Offer actionable tips (e.g., trim a specific category, shift surplus to savings, balance overspending)\n- Call out potential risks (e.g., low healthcare spend, high transportation) where applicable\n- Acknowledge strengths and offer encouragement\n\nEnd with a short <section id="final-thoughts"> 🧠 Final Thoughts, encouraging continued progress.\n\nUse this transaction data as input:\n${JSON.stringify(transactions)}`;
    const response = await openai.responses.create({
      model: "gpt-4.1",
      instructions: prompt,
      //"You are calculating budget insights for transactions from a database using the 50/30/20 rule. The transactions will be provided as as JSON array. Please provide your response as a straight HTML string with no markdown and no styling or CSS only HTML.",
      input: JSON.stringify(transactions),
    });
    return response.output_text;
  }
}
