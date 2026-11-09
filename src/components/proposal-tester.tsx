"use client";
import { useState } from "react";
import { demoPolicy } from "@/lib/security/demo-data";
import { formatUsdc } from "@/lib/security/policy";

type Result = { approved: boolean; reason: string; remainingDailyBudget: number };
export default function ProposalTester() {
  const [amount, setAmount] = useState("2");
  const [recipient, setRecipient] = useState("merchant-demo.near");
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  async function evaluate() {
    setBusy(true); setResult(null);
    try {
      const response = await fetch("/api/evaluate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amountUsdc: amount, recipient, asset: "USDC", spentTodayUsdc: "1", transactionsToday: 1 }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not evaluate proposal");
      setResult(data);
    } catch (error) { setResult({ approved: false, reason: error instanceof Error ? error.message : "Unknown error", remainingDailyBudget: 0 }); }
    finally { setBusy(false); }
  }
  return <div className="mt-6 space-y-4"><label className="block text-sm">Amount (USDC)<input value={amount} onChange={e=>setAmount(e.target.value)} inputMode="decimal" className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"/></label><label className="block text-sm">Recipient<input value={recipient} onChange={e=>setRecipient(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400"/></label><button onClick={evaluate} disabled={busy} className="w-full rounded-xl bg-emerald-400 px-4 py-3 font-bold text-slate-950 disabled:opacity-50">{busy ? "Checking…" : "Evaluate proposal"}</button>{result && <div className={`rounded-xl border p-4 ${result.approved ? "border-emerald-500/40 bg-emerald-500/10" : "border-rose-500/40 bg-rose-500/10"}`}><p className="font-bold">{result.approved ? "Policy checks passed" : "Proposal rejected"}</p><p className="mt-1 text-sm">{result.reason}</p><p className="mt-2 text-xs text-slate-400">Remaining budget after proposal: {formatUsdc(result.remainingDailyBudget)} USDC</p></div>}<p className="text-xs text-slate-500">Demo assumes 1 USDC already spent today. Values are evaluated locally by the server.</p></div>;
}
