
import { randomUUID } from "node:crypto";
import { demoPolicy } from "./demo-data";
import {
  evaluateProposal,
  type Evaluation,
  type TransactionProposal,
} from "./policy";

export type DemoLedgerEntry = {
  id: string;
  amount: number;
  asset: string;
  recipient: string;
  status: "APPROVED" | "REJECTED";
  reason: string;
  remainingDailyBudget: number;
  createdAt: string;
  day: string;
};

type LedgerState = {
  day: string;
  spentToday: number;
  transactionsToday: number;
  entries: DemoLedgerEntry[];
  queue: Promise<void>;
};

const globalLedger = globalThis as typeof globalThis & {
  __agentSpendGuardLedger?: LedgerState;
};

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function getLedger(): LedgerState {
  if (!globalLedger.__agentSpendGuardLedger) {
    globalLedger.__agentSpendGuardLedger = {
      day: todayUtc(),
      spentToday: 0,
      transactionsToday: 0,
      entries: [],
      queue: Promise.resolve(),
    };
  }

  return globalLedger.__agentSpendGuardLedger;
}

async function withLedgerLock<T>(operation: () => T): Promise<T> {
  const ledger = getLedger();

  let release!: () => void;
  const previous = ledger.queue;

  ledger.queue = new Promise<void>((resolve) => {
    release = resolve;
  });

  await previous;

  try {
    return operation();
  } finally {
    release();
  }
}

function refreshDailyAccounting(ledger: LedgerState): void {
  const currentDay = todayUtc();

  if (ledger.day !== currentDay) {
    ledger.day = currentDay;
    ledger.spentToday = 0;
    ledger.transactionsToday = 0;
  }
}

export async function submitDemoProposal(
  proposal: TransactionProposal
): Promise<Evaluation & { entry: DemoLedgerEntry }> {
  return withLedgerLock(() => {
    const ledger = getLedger();
    refreshDailyAccounting(ledger);

    const result = evaluateProposal({
      proposal,
      policy: demoPolicy,
      spentToday: ledger.spentToday,
      transactionsToday: ledger.transactionsToday,
    });

    if (result.approved) {
      ledger.spentToday += proposal.amount;
      ledger.transactionsToday += 1;
    }

    const entry: DemoLedgerEntry = {
      id: randomUUID(),
      amount: proposal.amount,
      asset: proposal.asset,
      recipient: proposal.recipient,
      status: result.approved ? "APPROVED" : "REJECTED",
      reason: result.reason,
      remainingDailyBudget: result.remainingDailyBudget,
      createdAt: new Date().toISOString(),
      day: ledger.day,
    };

    ledger.entries.unshift(entry);
    ledger.entries = ledger.entries.slice(0, 100);

    return { ...result, entry };
  });
}

export async function getDemoLedgerSnapshot() {
  return withLedgerLock(() => {
    const ledger = getLedger();
    refreshDailyAccounting(ledger);

    return {
      day: ledger.day,
      spentToday: ledger.spentToday,
      transactionsToday: ledger.transactionsToday,
      remainingDailyBudget: Math.max(
        0,
        demoPolicy.dailyLimit - ledger.spentToday
      ),
      entries: [...ledger.entries],
    };
  });
}
