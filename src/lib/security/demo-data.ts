import type { SpendingPolicy } from "./policy";

export const demoPolicy: SpendingPolicy = {
  dailyLimit: 5_000_000,
  perTransactionLimit: 3_000_000,
  allowedAssets: ["USDC"],
  allowedRecipients: ["merchant-demo.near"],
  maxTransactionsPerDay: 5,
};

export const demoActivity = [
  { id: "TX-001", description: "Demo merchant payment", amount: 1_000_000, status: "APPROVED", time: "Today · 09:42" },
  { id: "TX-002", description: "Unlisted recipient test", amount: 500_000, status: "REJECTED", time: "Today · 10:18" },
];
