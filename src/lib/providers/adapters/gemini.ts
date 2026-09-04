import { ReasoningRequest, ReasoningResponse } from "../types";
import { getProviderSecret } from "@/lib/env/server";

export async function invokeGeminiReasoning(request: ReasoningRequest): Promise<ReasoningResponse> {
  const secret = getProviderSecret("gemini");
  if (!secret) {
    throw new Error("Gemini API key is not configured.");
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const start = Date.now();

  const contents: any[] = [];
  if (request.systemPrompt) {
    contents.push({
      role: "user",
      parts: [{ text: `SYSTEM INSTRUCTIONS: ${request.systemPrompt}` }],
    });
    contents.push({
      role: "model",
      parts: [{ text: "Understood. I will strictly follow these system instructions." }],
    });
  }

  contents.push({
    role: "user",
    parts: [{ text: request.prompt }],
  });

  const body: any = {
    contents,
    generationConfig: {
      temperature: request.temperature ?? 0.2,
      maxOutputTokens: request.maxTokens ?? 2048,
    },
  };

  if (request.responseFormat === "json") {
    body.generationConfig.responseMimeType = "application/json";
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(secret)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  const durationMs = Date.now() - start;

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Gemini API error (HTTP ${res.status}): ${errorText.slice(0, 150)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const totalTokens = data?.usageMetadata?.totalTokenCount ?? Math.ceil(text.length / 4);

  return {
    content: text,
    providerId: "gemini",
    model,
    tokensUsed: totalTokens,
    estimatedCostCents: Math.max(1, Math.round((totalTokens / 1000) * 0.1)), // ~0.1c per 1k tokens
    durationMs,
  };
}
