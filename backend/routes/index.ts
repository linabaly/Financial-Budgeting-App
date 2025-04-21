import dotenv from "dotenv";
dotenv.config();


export { default as AccountRoute } from "./account";
export { default as GoalRoute } from "./goal";
export { default as InsightsRoute } from "./insights";
export { default as RecurringAccountRoute } from "./recurringTransaction";
export { default as TransactionRoute } from "./transaction";
