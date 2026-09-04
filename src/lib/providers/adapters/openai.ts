import { ReasoningRequest, ReasoningResponse } from "../types";
import { getProviderSecret } from "@/lib/env/server";

export async function invokeOpenAIReasoning(request: ReasoningRequest): Promise<ReasoningResponse> {
  const secret = getProviderSecret("openai");
  if (!secret) {
    throw new Error("OpenAI API key is not configured.");
  }

  const model = "gpt-4o-mini";
  const start = Date.now();

  const messages: any[] = [];
  if (request.systemPrompt) {
    messages.push({ role: "system", content: request.systemPrompt });
  }
  messages.push({ role: "user", content: request.prompt });

  const body: any = {
    model,
    messages,
    temperature: request.temperature ?? 0.2,
    max_tokens: request.maxTokens ?? 2048,
  };

  if (request.responseFormat === "json") {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  const durationMs = Date.now() - start;

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`OpenAI API error (HTTP ${res.status}): ${errorText.slice(0, 150)}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  const totalTokens = data?.usage?.total_tokens ?? Math.ceil(text.length / 4);

  return {
    content: text,
    providerId: "openai",
    model,
    tokensUsed: totalTokens,
    estimatedCostCents: Math.max(1, Math.round((totalTokens / 1000) * 0.3)),
    durationMs,
  };
}
