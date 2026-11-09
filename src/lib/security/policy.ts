import { z } from "zod";

// Amounts are represented as integer micro-units (USDC has 6 decimals).
// Never use floating-point numbers for money or security decisions.
export const PolicySchema = z.object({
  dailyLimit: z.number().int().positive(),
  perTransactionLimit: z.number().int().positive(),
  allowedAssets: z.array(z.string().min(1)).min(1),
  allowedRecipients: z.array(z.string().min(1)),
  maxTransactionsPerDay: z.number().int().positive(),
});

export const ProposalSchema = z.object({
  amount: z.number().int().positive(),
  asset: z.string().min(1),
  recipient: z.string().min(1),
});

export type SpendingPolicy = z.infer<typeof PolicySchema>;
export type TransactionProposal = z.infer<typeof ProposalSchema>;

export type Evaluation = {
  approved: boolean;
  reason: string;
  remainingDailyBudget: number;
};

export function evaluateProposal(input: {
  proposal: TransactionProposal;
  policy: SpendingPolicy;
  spentToday: number;
  transactionsToday: number;
}): Evaluation {
  const { proposal, policy, spentToday, transactionsToday } = input;
  const reject = (reason: string): Evaluation => ({
    approved: false,
    reason,
    remainingDailyBudget: Math.max(0, policy.dailyLimit - spentToday),
  });

  if (![spentToday, transactionsToday].every(Number.isSafeInteger) || spentToday < 0 || transactionsToday < 0) {
    return reject("Invalid accounting state");
  }
  if (!policy.allowedAssets.includes(proposal.asset)) return reject("Asset is not allowed");
  if (policy.allowedRecipients.length > 0 && !policy.allowedRecipients.includes(proposal.recipient)) {
    return reject("Recipient is not allowlisted");
  }
  if (proposal.amount > policy.perTransactionLimit) return reject("Per-transaction limit exceeded");
  if (transactionsToday >= policy.maxTransactionsPerDay) return reject("Daily transaction count exceeded");
  if (spentToday + proposal.amount > policy.dailyLimit) return reject("Daily spending limit exceeded");

  return {
    approved: true,
    reason: "All local policy checks passed. This is not yet an on-chain authorization.",
    remainingDailyBudget: policy.dailyLimit - spentToday - proposal.amount,
  };
}

export function formatUsdc(microUnits: number): string {
  return (microUnits / 1_000_000).toFixed(2);
}
