import { describe, expect, it } from "vitest";
import {
  createDemoLedger,
  type SqlTag,
  type DemoLedgerEntry,
} from "../src/lib/security/demo-ledger";
import { demoPolicy } from "../src/lib/security/demo-data";
import { evaluateProposal } from "../src/lib/security/policy";

function createFakeDatabase(): SqlTag {
  let spentToday = 0;
  let transactionsToday = 0;
  const entries: DemoLedgerEntry[] = [];

  return (async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const query = strings.join(" ");

    if (query.includes("ags_submit_demo_proposal")) {
      const proposal = {
        amount: Number(values[0]),
        asset: String(values[1]),
        recipient: String(values[2]),
      };

      const result = evaluateProposal({
        proposal,
        policy: demoPolicy,
        spentToday,
        transactionsToday,
      });

      if (result.approved) {
        spentToday += proposal.amount;
        transactionsToday += 1;
      }

      const entry: DemoLedgerEntry = {
        id: `test-${entries.length + 1}`,
        ...proposal,
        status: result.approved ? "APPROVED" : "REJECTED",
        reason: result.reason,
        remainingDailyBudget: result.remainingDailyBudget,
        createdAt: new Date().toISOString(),
        day: new Date().toISOString().slice(0, 10),
      };

      entries.unshift(entry);

      return [{ result: { ...result, entry } }];
    }

    if (query.includes("UPDATE ags_demo_state")) {
      return [];
    }

    if (query.includes("FROM ags_demo_state s")) {
      return [{
        day: new Date().toISOString().slice(0, 10),
        spentToday: String(spentToday),
        transactionsToday,
        remainingDailyBudget: String(
          Math.max(0, demoPolicy.dailyLimit - spentToday)
        ),
        entries: entries.slice(0, 100),
      }];
    }

    throw new Error(`Unexpected test query: ${query}`);
  }) as SqlTag;
}

describe("Persistent demo ledger adapter", () => {
  it("records decisions and only counts approved spending", async () => {
    const fakeDatabase = createFakeDatabase();
    const ledger = createDemoLedger(() => fakeDatabase);

    const first = await ledger.submitDemoProposal({
      amount: 3_000_000,
      asset: "USDC",
      recipient: "merchant-demo.near",
    });

    expect(first.approved).toBe(true);

    const second = await ledger.submitDemoProposal({
      amount: 3_000_000,
      asset: "USDC",
      recipient: "merchant-demo.near",
    });

    expect(second.approved).toBe(false);

    const third = await ledger.submitDemoProposal({
      amount: 500_000,
      asset: "USDC",
      recipient: "unknown-merchant.near",
    });

    expect(third.approved).toBe(false);

    const snapshot = await ledger.getDemoLedgerSnapshot();

    expect(snapshot.spentToday).toBe(3_000_000);
    expect(snapshot.transactionsToday).toBe(1);
    expect(snapshot.remainingDailyBudget).toBe(2_000_000);
    expect(snapshot.entries).toHaveLength(3);
  });
});
