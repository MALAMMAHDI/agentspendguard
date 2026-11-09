import { NextResponse } from "next/server";
import { z } from "zod";
import { demoPolicy } from "@/lib/security/demo-data";
import { evaluateProposal } from "@/lib/security/policy";

const RequestSchema = z.object({
  amountUsdc: z.string().regex(/^\d+(\.\d{1,6})?$/),
  recipient: z.string().min(1).max(128),
  asset: z.literal("USDC"),
  spentTodayUsdc: z.string().regex(/^\d+(\.\d{1,6})?$/),
  transactionsToday: z.number().int().nonnegative(),
});
function toMicros(value: string): number {
  const [whole, fraction = ""] = value.split(".");
  const micros = BigInt(whole) * 1_000_000n + BigInt((fraction + "000000").slice(0, 6));
  if (micros > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error("Amount is too large");
  return Number(micros);
}
export async function POST(request: Request) {
  try {
    const body = RequestSchema.parse(await request.json());
    const result = evaluateProposal({
      proposal: { amount: toMicros(body.amountUsdc), asset: body.asset, recipient: body.recipient },
      policy: demoPolicy,
      spentToday: toMicros(body.spentTodayUsdc),
      transactionsToday: body.transactionsToday,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof z.ZodError ? "Invalid request. Check amount, recipient and fields." : error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
