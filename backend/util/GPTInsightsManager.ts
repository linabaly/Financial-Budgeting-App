import OpenAI from "openai";
import { TransactionManager } from ".";

export default class GPTInsightsManager {
  public static async getBudgetRecommendationsForAccount(accountID: string) {
    const transactions = await TransactionManager.getAssociatedTransactionsForAccount(accountID);
    if (!transactions || transactions.length < 1) return null;
    const openai = new OpenAI({
      apiKey: process.env["CHATGPT_API_KEY"],
    });
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",   
        messages: [
          {
            role: "system",
            content: `
You are a financial expert and skilled UX content strategist.

Generate a structured, compact, and highly personalized HTML financial report using the 50/30/20 rule based on the provided transaction data. Focus especially on producing meaningful, data-driven insights in the Personalized Recommendations section.

Your response must:
- Be valid HTML only (no Markdown, CSS, or scripts)
- Fill the entire width of a dashboard container
- Avoid large vertical spacing between sections (tight spacing, clear breaks)
- Use semantic HTML tags like <section>, <header>, <article>, <ul>, <li>, <strong>, <em>, etc.
- Include emoji in section headings (e.g., 💸 for Expenses, 📋 for Recommendations)
- Use <span class="highlight-[type]"> to flag visually styled values (e.g., highlight-wants, highlight-needs, highlight-savings, highlight-warning)
- Group categories logically and summarize spending
- Use brief paragraphs followed by clear <ul> bullet lists where appropriate

In <section id="recommendations">:
- Give 4–6 truly personalized recommendations based on the spending patterns
- Each should be 1–2 sentences long and go beyond general advice
- Reference specific amounts and categories from the data
- Offer actionable tips (e.g., trim a specific category, shift surplus to savings, balance overspending)
- Call out potential risks (e.g., low healthcare spend, high transportation) where applicable
- Acknowledge strengths and offer encouragement

End with a short <section id="final-thoughts"> 🧠 Final Thoughts, encouraging continued progress.

Use this transaction data as input:
${JSON.stringify(transactions)}
`

          },
          {
            role: "user",
            content: JSON.stringify(transactions),
          },
        ],
      });
      let output = response.choices[0]?.message?.content ?? "";

// Strip triple backticks and 'html' if included in the response
if (output.startsWith("```html")) {
  output = output.replace(/```html\s*/, "").replace(/```$/, "");
}

return output.trim();
    } catch (error: any) {
      console.error("OpenAI API error:", error.message || error);
      return `<p>We're currently unable to generate insights due to usage limits. Please try again later or contact support.</p>`;
    }
    try {
      return (await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `
You are a financial advisor and expert UI writer. Your task is to generate a compact, visually clear, and deeply personalized HTML financial report using the 50/30/20 budgeting rule.

Your response MUST:
- Be pure HTML (no Markdown, no CSS, no <script>)
- Fill the full container width without unnecessary spacing between sections
- Be organized into:
  <section id="overview"> 🧾 Overview </section>
  <section id="guidelines"> ✅ Budget Guidelines </section>
  <section id="breakdown"> 💸 Spending Breakdown </section>
  <section id="recommendations"> 📋 Personalized Recommendations </section>
  <section id="final-thoughts"> 🔍 Final Thoughts </section>

Use:
- Semantic tags (<section>, <div>, <ul>, <li>, <strong>, <em>)
- No extra blank lines or unnecessary padding
- Emojis in headings for friendliness
- <span class="highlight-X"> to hint at styling needs (e.g., highlight-savings, highlight-overspent)

📌 Personalization Rules:
- Give **as many recommendations as needed** based on the data
- Be specific: name the category and suggest alternatives or tactics (e.g., reduce personal expenses by cutting back on clothes shopping or meal delivery)
- Compare spending to budget thresholds (e.g., "You're spending 18% on wants, which is well below the 30% guideline")
- Highlight good habits and areas of improvement
- If savings are high, suggest long-term savings options (e.g., high-yield savings or investment)
- If needs are low, suggest improving quality of life with responsible wants

Here is the user’s transaction data as JSON:
${JSON.stringify(transactions)}
`

          },
          {
            role: "user",
            content: JSON.stringify(transactions),
          },
        ],
      })).choices[0]?.message?.content;
    } catch (error) {
      if ((error as any)?.code === "insufficient_quota") {
        console.warn("Falling back to gpt-3.5-turbo...");
        return (await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `
            You are an expert financial coach and designer. 
            Based on a user's transaction data, generate a beautifully structured and highly personalized financial report using the 50/30/20 rule.
          
            Your output must be:
            - An HTML string (no Markdown, no CSS, no scripts)
            - Designed to fill the full width of a dashboard container
            - Split into visually distinct sections: Overview, Budget Guidelines, Spending Breakdown, Personalized Recommendations, and Final Thoughts.
            - Use semantic HTML tags like <section>, <article>, <header>, <div>, <ul>, <li>, <strong>, <em>, etc.
            - Use colored <span> wrappers to hint at styling needs, e.g., <span class="highlight-wants"> or <span class="budget-amount">.
          
            Style guidelines (in structure only):
            - Emphasize clarity and encouragement
            - Use line breaks to separate sections
            - Add emoji in headings for approachability, e.g., 💸 for Expenses, ✅ for Guidelines
            - Provide at least 3 personalized recommendations using <ul> in <section id="recommendations">
          
            Here is the user’s transaction data as JSON:
            ${JSON.stringify(transactions)}
          `
            },
            {
              role: "user",
              content: JSON.stringify(transactions),
            },
          ],
        })).choices[0]?.message?.content;
      }
      throw error;
    }    
  }
}
