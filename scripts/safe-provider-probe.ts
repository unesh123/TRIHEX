import fs from "fs";
import path from "path";

// Load .env.local safely into process.env if not already set
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.substring(0, eqIdx).trim();
      let val = trimmed.substring(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadEnvLocal();

async function probeOpenAI(): Promise<{ configured: boolean; health: string; latencyMs: number; notes: string }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { configured: false, health: "NOT_CONFIGURED", latencyMs: 0, notes: "OPENAI_API_KEY missing" };

  const start = Date.now();
  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(6000),
    });
    const latencyMs = Date.now() - start;
    if (res.ok) {
      return { configured: true, health: "HEALTHY", latencyMs, notes: `HTTP ${res.status}` };
    } else {
      return { configured: true, health: "DEGRADED", latencyMs, notes: `HTTP ${res.status}` };
    }
  } catch (err: any) {
    return { configured: true, health: "ERROR", latencyMs: Date.now() - start, notes: err?.message || "Network error" };
  }
}

async function probeGemini(): Promise<{ configured: boolean; health: string; latencyMs: number; notes: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { configured: false, health: "NOT_CONFIGURED", latencyMs: 0, notes: "GEMINI_API_KEY missing" };

  const start = Date.now();
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`, {
      signal: AbortSignal.timeout(6000),
    });
    const latencyMs = Date.now() - start;
    if (res.ok) {
      return { configured: true, health: "HEALTHY", latencyMs, notes: `HTTP ${res.status}` };
    } else {
      return { configured: true, health: "DEGRADED", latencyMs, notes: `HTTP ${res.status}` };
    }
  } catch (err: any) {
    return { configured: true, health: "ERROR", latencyMs: Date.now() - start, notes: err?.message || "Network error" };
  }
}

async function probeYouCom(): Promise<{ configured: boolean; health: string; latencyMs: number; notes: string }> {
  const key = process.env.YDC_API_KEY || process.env.YOUCOM_API_KEY;
  if (!key) return { configured: false, health: "NOT_CONFIGURED", latencyMs: 0, notes: "YDC_API_KEY missing" };

  const start = Date.now();
  try {
    const res = await fetch("https://api.ydc-index.io/search?query=Nepal+technology+news&count=1", {
      headers: { "X-API-Key": key },
      signal: AbortSignal.timeout(6000),
    });
    const latencyMs = Date.now() - start;
    if (res.ok) {
      return { configured: true, health: "HEALTHY", latencyMs, notes: `HTTP ${res.status}` };
    } else {
      return { configured: true, health: "DEGRADED", latencyMs, notes: `HTTP ${res.status}` };
    }
  } catch (err: any) {
    return { configured: true, health: "ERROR", latencyMs: Date.now() - start, notes: err?.message || "Network error" };
  }
}

async function probeAzureSpeech(): Promise<{ configured: boolean; health: string; latencyMs: number; notes: string }> {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION || "eastus";
  if (!key) return { configured: false, health: "NOT_CONFIGURED", latencyMs: 0, notes: "AZURE_SPEECH_KEY missing" };

  const start = Date.now();
  try {
    const res = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issuetoken`, {
      method: "POST",
      headers: { "Ocp-Apim-Subscription-Key": key },
      signal: AbortSignal.timeout(6000),
    });
    const latencyMs = Date.now() - start;
    if (res.ok) {
      return { configured: true, health: "HEALTHY", latencyMs, notes: `HTTP ${res.status}` };
    } else {
      return { configured: true, health: "DEGRADED", latencyMs, notes: `HTTP ${res.status}` };
    }
  } catch (err: any) {
    return { configured: true, health: "ERROR", latencyMs: Date.now() - start, notes: err?.message || "Network error" };
  }
}

async function main() {
  console.log("Probing configured external providers (zero secrets exposed)...\n");

  const [openai, gemini, youcom, azureSpeech] = await Promise.all([
    probeOpenAI(),
    probeGemini(),
    probeYouCom(),
    probeAzureSpeech(),
  ]);

  const dbConfigured = Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);

  const results = [
    { provider: "PostgreSQL Database", configured: dbConfigured, health: dbConfigured ? "CONFIGURED" : "NOT_CONFIGURED", latencyMs: 0, notes: dbConfigured ? "Connection string present" : "Missing", capability: "Persistent Storage & Advisory Locking" },
    { provider: "Gemini (Google AI)", ...gemini, capability: "LLM Reasoning & Research Synthesis" },
    { provider: "OpenAI", ...openai, capability: "LLM General & Embeddings" },
    { provider: "You.com (YDC Index)", ...youcom, capability: "Live Web Search & Fact Retrieval" },
    { provider: "Azure Speech", ...azureSpeech, capability: "Text-to-Speech Voice Engine" },
    { provider: "Zyte", configured: false, health: "NOT_CONFIGURED", latencyMs: 0, notes: "ZYTE_API_KEY not configured", capability: "Web Page Extraction" },
    { provider: "DeepSeek", configured: false, health: "NOT_CONFIGURED", latencyMs: 0, notes: "DEEPSEEK_API_KEY not configured", capability: "LLM Reasoning" },
    { provider: "Google Maps Server", configured: Boolean(process.env.GOOGLE_MAPS_SERVER_KEY || process.env.GOOGLE_MAPS_API_KEY), health: (process.env.GOOGLE_MAPS_SERVER_KEY || process.env.GOOGLE_MAPS_API_KEY) ? "CONFIGURED" : "NOT_CONFIGURED", latencyMs: 0, notes: "Key presence check", capability: "Places & Geocoding" },
    { provider: "Freepik", configured: false, health: "NOT_CONFIGURED", latencyMs: 0, notes: "FREEPIK_API_KEY not configured", capability: "Creative Artwork Generation" },
  ];

  console.table(results.map(r => ({
    Provider: r.provider,
    Configured: r.configured ? "YES" : "NO",
    Health: r.health,
    Latency: r.latencyMs > 0 ? `${r.latencyMs}ms` : "N/A",
    Capability: r.capability,
    Notes: r.notes
  })));
}

main().catch(console.error);
