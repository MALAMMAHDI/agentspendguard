import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS ags_demo_state (
    id text PRIMARY KEY CHECK (id = 'demo'),
    accounting_day date NOT NULL,
    spent_today bigint NOT NULL DEFAULT 0,
    transactions_today integer NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now()
  )
`;

await sql`
  INSERT INTO ags_demo_state (id, accounting_day)
  VALUES ('demo', (now() AT TIME ZONE 'UTC')::date)
  ON CONFLICT (id) DO NOTHING
`;

await sql`
  CREATE TABLE IF NOT EXISTS ags_demo_entries (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    amount bigint NOT NULL,
    asset text NOT NULL,
    recipient text NOT NULL,
    status text NOT NULL CHECK (status IN ('APPROVED', 'REJECTED')),
    reason text NOT NULL,
    remaining_daily_budget bigint NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    accounting_day date NOT NULL
  )
`;

await sql`
  CREATE INDEX IF NOT EXISTS ags_demo_entries_created_idx
  ON ags_demo_entries (created_at DESC)
`;

await sql`
  CREATE OR REPLACE FUNCTION ags_submit_demo_proposal(
    p_amount bigint,
    p_asset text,
    p_recipient text,
    p_daily_limit bigint,
    p_per_tx_limit bigint,
    p_allowed_assets text[],
    p_allowed_recipients text[],
    p_max_transactions integer
  )
  RETURNS jsonb
  LANGUAGE plpgsql
  AS $function$
  DECLARE
    v_state ags_demo_state%ROWTYPE;
    v_entry ags_demo_entries%ROWTYPE;
    v_today date := (now() AT TIME ZONE 'UTC')::date;
    v_approved boolean := false;
    v_reason text;
    v_remaining bigint;
  BEGIN
    SELECT * INTO v_state
    FROM ags_demo_state
    WHERE id = 'demo'
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Demo ledger state is missing';
    END IF;

    IF v_state.accounting_day <> v_today THEN
      UPDATE ags_demo_state
      SET accounting_day = v_today,
          spent_today = 0,
          transactions_today = 0,
          updated_at = now()
      WHERE id = 'demo'
      RETURNING * INTO v_state;
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 THEN
      v_reason := 'Invalid proposal amount';
    ELSIF NOT (p_asset = ANY(p_allowed_assets)) THEN
      v_reason := 'Asset is not allowed';
    ELSIF cardinality(p_allowed_recipients) > 0
      AND NOT (p_recipient = ANY(p_allowed_recipients)) THEN
      v_reason := 'Recipient is not allowlisted';
    ELSIF p_amount > p_per_tx_limit THEN
      v_reason := 'Per-transaction limit exceeded';
    ELSIF v_state.transactions_today >= p_max_transactions THEN
      v_reason := 'Daily transaction count exceeded';
    ELSIF v_state.spent_today + p_amount > p_daily_limit THEN
      v_reason := 'Daily spending limit exceeded';
    ELSE
      v_approved := true;
      v_reason := 'All local policy checks passed. This is not yet an on-chain authorization.';
    END IF;

    IF v_approved THEN
      v_remaining := p_daily_limit - v_state.spent_today - p_amount;

      UPDATE ags_demo_state
      SET spent_today = spent_today + p_amount,
          transactions_today = transactions_today + 1,
          updated_at = now()
      WHERE id = 'demo';
    ELSE
      v_remaining := GREATEST(0, p_daily_limit - v_state.spent_today);
    END IF;

    INSERT INTO ags_demo_entries (
      amount, asset, recipient, status, reason,
      remaining_daily_budget, accounting_day
    )
    VALUES (
      p_amount, p_asset, p_recipient,
      CASE WHEN v_approved THEN 'APPROVED' ELSE 'REJECTED' END,
      v_reason, v_remaining, v_today
    )
    RETURNING * INTO v_entry;

    RETURN jsonb_build_object(
      'approved', v_approved,
      'reason', v_reason,
      'remainingDailyBudget', v_remaining,
      'entry', jsonb_build_object(
        'id', v_entry.id,
        'amount', v_entry.amount,
        'asset', v_entry.asset,
        'recipient', v_entry.recipient,
        'status', v_entry.status,
        'reason', v_entry.reason,
        'remainingDailyBudget', v_entry.remaining_daily_budget,
        'createdAt', v_entry.created_at,
        'day', v_entry.accounting_day
      )
    );
  END;
  $function$
`;

console.log("SUCCESS: Neon persistent ledger schema created.");
console.log("Created: ags_demo_state");
console.log("Created: ags_demo_entries");
console.log("Created: ags_submit_demo_proposal()");
