
import { describe, expect, it } from "vitest";
import {
  getDemoLedgerSnapshot,
  submitDemoProposal,
} from "../src/lib/security/demo-ledger";

describe("Demo spending ledger", () => {
  it("records decisions and only counts approved spending", async () => {
    const first = await submitDemoProposal({
      amount: 3_000_000,
      asset: "USDC",
      recipient: "merchant-demo.near",
    });

    expect(first.approved).toBe(true);

    const second = await submitDemoProposal({
      amount: 3_000_000,
      asset: "USDC",
      recipient: "merchant-demo.near",
    });

    expect(second.approved).toBe(false);

    const third = await submitDemoProposal({
      amount: 500_000,
      asset: "USDC",
      recipient: "unknown-merchant.near",
    });

    expect(third.approved).toBe(false);

    const snapshot = await getDemoLedgerSnapshot();

    expect(snapshot.spentToday).toBe(3_000_000);
    expect(snapshot.transactionsToday).toBe(1);
    expect(snapshot.remainingDailyBudget).toBe(2_000_000);
    expect(snapshot.entries).toHaveLength(3);
  });
});
