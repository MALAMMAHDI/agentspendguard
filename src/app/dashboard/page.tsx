import { demoActivity, demoPolicy } from "@/lib/security/demo-data";
import { formatUsdc } from "@/lib/security/policy";
import { ShieldCheck, Activity, Wallet, AlertTriangle } from "lucide-react";
import ProposalTester from "@/components/proposal-tester";

export default function Dashboard() {
  return <main className="mx-auto min-h-screen max-w-6xl px-5 py-8 md:px-10">
    <header className="flex flex-wrap items-center justify-between gap-4"><a href="/" className="font-bold">← AgentSpendGuard</a><span className="pill bg-amber-400/10 text-amber-300">SIMULATION ONLY</span></header>
    <div className="mt-10"><p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">Overview</p><h1 className="mt-2 text-4xl font-bold">Agent dashboard</h1><p className="mt-2 text-slate-400">Review the policy and test how proposed payments are evaluated.</p></div>
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      <Metric icon={<Wallet/>} label="Daily spending cap" value={`${formatUsdc(demoPolicy.dailyLimit)} USDC`} />
      <Metric icon={<ShieldCheck/>} label="Per transaction" value={`${formatUsdc(demoPolicy.perTransactionLimit)} USDC`} />
      <Metric icon={<Activity/>} label="Allowed transactions/day" value={`${demoPolicy.maxTransactionsPerDay}`} />
    </div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
      <section className="panel p-6"><h2 className="text-xl font-bold">Test a payment proposal</h2><p className="mt-1 text-sm text-slate-400">Try changing the amount or recipient to see the policy result.</p><ProposalTester/></section>
      <section className="panel p-6"><h2 className="text-xl font-bold">Current policy</h2><ul className="mt-5 space-y-4 text-sm"><li className="flex justify-between"><span className="muted">Allowed asset</span><b>USDC</b></li><li className="flex justify-between"><span className="muted">Allowed recipient</span><b>merchant-demo.near</b></li><li className="flex justify-between"><span className="muted">Daily limit</span><b>5.00 USDC</b></li><li className="flex justify-between"><span className="muted">Per transaction</span><b>3.00 USDC</b></li></ul><div className="mt-6 rounded-xl bg-amber-400/10 p-4 text-sm text-amber-200"><AlertTriangle className="mb-2" size={18}/>This is a local demo policy. It is not signed, stored on-chain or enforced by NEAR.</div></section>
    </div>
    <section className="panel mt-8 p-6"><h2 className="text-xl font-bold">Sample activity</h2><div className="mt-4 divide-y divide-slate-800">{demoActivity.map((item)=><div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"><div><p className="font-semibold">{item.description}</p><p className="text-xs text-slate-500">{item.id} · {item.time}</p></div><div className="flex items-center gap-4"><b>{formatUsdc(item.amount)} USDC</b><span className={`pill ${item.status === "APPROVED" ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}>{item.status}</span></div></div>)}</div></section>
    <p className="mt-8 text-center text-xs text-slate-500">Prototype only. Never use this demo to authorize real payments.</p>
  </main>;
}
function Metric({icon,label,value}:{icon:React.ReactNode;label:string;value:string}) { return <div className="panel p-5"><div className="flex items-center gap-2 text-emerald-400">{icon}<span className="text-sm text-slate-400">{label}</span></div><p className="mt-3 text-2xl font-bold">{value}</p></div>; }
