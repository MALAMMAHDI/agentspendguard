import { neon } from "@neondatabase/serverless";
import { demoPolicy } from "./demo-data";
import type { Evaluation, TransactionProposal } from "./policy";

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

export type SqlTag = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<Record<string, unknown>[]>;

let cachedSql: SqlTag | undefined;

function getSql(): SqlTag {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  if (!cachedSql) {
    cachedSql = neon(process.env.DATABASE_URL) as unknown as SqlTag;
  }

  return cachedSql;
}

function asNumber(value: unknown): number {
  const number = Number(value);

  if (!Number.isSafeInteger(number)) {
    throw new Error("Invalid numeric value returned by Neon");
  }

  return number;
}

function asObject(value: unknown): Record<string, unknown> {
  const parsed =
    typeof value === "string" ? JSON.parse(value) as unknown : value;

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Invalid database response");
  }

  return parsed as Record<string, unknown>;
}

function asEntry(value: unknown): DemoLedgerEntry {
  const entry = asObject(value);

  if (entry.status !== "APPROVED" && entry.status !== "REJECTED") {
    throw new Error("Invalid transaction status returned by Neon");
  }

  return {
    id: String(entry.id),
    amount: asNumber(entry.amount),
    asset: String(entry.asset),
    recipient: String(entry.recipient),
    status: entry.status,
    reason: String(entry.reason),
    remainingDailyBudget: asNumber(entry.remainingDailyBudget),
    createdAt: String(entry.createdAt),
    day: String(entry.day),
  };
}

function parseEntries(value: unknown): DemoLedgerEntry[] {
  const parsed =
    typeof value === "string" ? JSON.parse(value) as unknown : value;

  if (!Array.isArray(parsed)) {
    throw new Error("Invalid transaction history returned by Neon");
  }

  return parsed.map(asEntry);
}

export function createDemoLedger(getDatabase: () => SqlTag) {
  return {
    async submitDemoProposal(
      proposal: TransactionProposal
    ): Promise<Evaluation & { entry: DemoLedgerEntry }> {
      const sql = getDatabase();

      const rows = await sql`
        SELECT ags_submit_demo_proposal(
          ${proposal.amount}::bigint,
          ${proposal.asset}::text,
          ${proposal.recipient}::text,
          ${demoPolicy.dailyLimit}::bigint,
          ${demoPolicy.perTransactionLimit}::bigint,
          ARRAY(
            SELECT jsonb_array_elements_text(
              ${JSON.stringify(demoPolicy.allowedAssets)}::jsonb
            )
          ),
          ARRAY(
            SELECT jsonb_array_elements_text(
              ${JSON.stringify(demoPolicy.allowedRecipients)}::jsonb
            )
          ),
          ${demoPolicy.maxTransactionsPerDay}::integer
        ) AS result
      `;

      if (!rows[0]?.result) {
        throw new Error("Neon did not return a proposal decision");
      }

      const result = asObject(rows[0].result);

      return {
        approved: result.approved === true,
        reason: String(result.reason),
        remainingDailyBudget: asNumber(result.remainingDailyBudget),
        entry: asEntry(result.entry),
      };
    },

    async getDemoLedgerSnapshot() {
      const sql = getDatabase();

      // Reset daily accounting when the UTC day changes.
      await sql`
        UPDATE ags_demo_state
        SET accounting_day = (now() AT TIME ZONE 'UTC')::date,
            spent_today = 0,
            transactions_today = 0,
            updated_at = now()
        WHERE id = 'demo'
          AND accounting_day <> (now() AT TIME ZONE 'UTC')::date
      `;

      const rows = await sql`
        SELECT
          s.accounting_day::text AS day,
          s.spent_today::text AS "spentToday",
          s.transactions_today AS "transactionsToday",
          GREATEST(
            0,
            ${demoPolicy.dailyLimit}::bigint - s.spent_today
          )::text AS "remainingDailyBudget",
          COALESCE(
            (
              SELECT jsonb_agg(
                jsonb_build_object(
                  'id', e.id,
                  'amount', e.amount::text,
                  'asset', e.asset,
                  'recipient', e.recipient,
                  'status', e.status,
                  'reason', e.reason,
                  'remainingDailyBudget', e.remaining_daily_budget::text,
                  'createdAt', e.created_at,
                  'day', e.accounting_day::text
                )
                ORDER BY e.created_at DESC
              )
              FROM (
                SELECT *
                FROM ags_demo_entries
                ORDER BY created_at DESC
                LIMIT 100
              ) e
            ),
            '[]'::jsonb
          ) AS entries
        FROM ags_demo_state s
        WHERE s.id = 'demo'
      `;

      if (!rows[0]) {
        throw new Error("Neon demo ledger state is missing");
      }

      const row = rows[0];

      return {
        day: String(row.day),
        spentToday: asNumber(row.spentToday),
        transactionsToday: asNumber(row.transactionsToday),
        remainingDailyBudget: asNumber(row.remainingDailyBudget),
        entries: parseEntries(row.entries),
      };
    },
  };
}

const ledger = createDemoLedger(getSql);

export const submitDemoProposal = ledger.submitDemoProposal;
export const getDemoLedgerSnapshot = ledger.getDemoLedgerSnapshot;
