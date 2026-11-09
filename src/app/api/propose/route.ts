import { NextResponse } from "next/server";
import { z } from "zod";
import { createExplanation } from "@/lib/ai/propose";
const Body = z.object({ goal: z.string().min(5).max(500) });
export async function POST(request: Request) {
  try {
    const { goal } = Body.parse(await request.json());
    const explanation = await createExplanation(goal);
    return NextResponse.json({ explanation, mode: process.env.NEAR_AI_API_KEY ? "near-ai" : "demo" });
  } catch {
    return NextResponse.json({ error: "Invalid request or AI service unavailable." }, { status: 400 });
  }
}
