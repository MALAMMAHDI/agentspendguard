import OpenAI from "openai";

export async function createExplanation(prompt: string): Promise<string> {
  const apiKey = process.env.NEAR_AI_API_KEY;
  if (!apiKey) return "Demo agent: I can prepare a transaction proposal, but NEAR AI is not configured. No funds have moved.";

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.NEAR_AI_BASE_URL || "https://cloud-api.near.ai/v1",
  });
  const completion = await client.chat.completions.create({
    model: process.env.NEAR_AI_MODEL || "Qwen/Qwen3.8-27B",
    messages: [
      { role: "system", content: "You are a cautious payment-planning assistant. You may explain a proposed transaction but cannot approve it, sign transactions, change policy, or claim that funds moved. Keep the answer under 80 words." },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
  });
  return completion.choices[0]?.message?.content || "No explanation returned.";
}
