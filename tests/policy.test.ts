import { describe, expect, it } from "vitest";
import { evaluateProposal } from "../src/lib/security/policy";
import { demoPolicy } from "../src/lib/security/demo-data";
const base = { policy: demoPolicy, spentToday: 1_000_000, transactionsToday: 1 };
describe("AgentSpendGuard policy evaluator", () => {
  it("approves an allowed payment within limits", () => {
    expect(evaluateProposal({ ...base, proposal: { amount: 2_000_000, asset: "USDC", recipient: "merchant-demo.near" } }).approved).toBe(true);
  });
  it("rejects an amount above the per-transaction limit", () => {
    expect(evaluateProposal({ ...base, proposal: { amount: 3_500_000, asset: "USDC", recipient: "merchant-demo.near" } }).reason).toBe("Per-transaction limit exceeded");
  });
  it("rejects a non-allowlisted recipient", () => {
    expect(evaluateProposal({ ...base, proposal: { amount: 500_000, asset: "USDC", recipient: "attacker.near" } }).approved).toBe(false);
  });
  it("rejects daily budget overflow", () => {
    expect(evaluateProposal({ ...base, proposal: { amount: 4_500_000, asset: "USDC", recipient: "merchant-demo.near" } }).reason).toBe("Daily spending limit exceeded");
  });
});
