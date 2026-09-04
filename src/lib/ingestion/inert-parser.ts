/**
 * Inert Content Parser & Sanitizer
 *
 * Treats all ingested text from external feeds/crawlers/APIs as completely untrusted raw data.
 * Neutralizes:
 * - HTML injection (scripts, iframes, onerror attributes, data/javascript URIs)
 * - LLM prompt-injection tokens & jailbreak patterns (DAN, System override, marker tokens)
 * - Zero-width or control characters
 */

const DANGEROUS_HTML_TAGS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
  /<meta\b[^>]*>/gi,
  /<link\b[^>]*>/gi,
  /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
  /<input\b[^>]*>/gi,
  /<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi,
];

const DANGEROUS_ATTRIBUTES = [
  /\bon\w+\s*=\s*(['"]).*?\1/gi, // onclick=..., onerror=..., onload=...
  /href\s*=\s*['"]javascript:[^'"]*['"]/gi,
  /src\s*=\s*['"]javascript:[^'"]*['"]/gi,
  /href\s*=\s*['"]data:[^'"]*['"]/gi,
  /src\s*=\s*['"]data:[^'"]*['"]/gi,
];

const PROMPT_INJECTION_PATTERNS: Array<{ regex: RegExp; replacement: string }> = [
  { regex: /ignore\s+(?:all\s+)?(?:previous|prior)\s+instructions/gi, replacement: "[neutralized: instruction bypass attempt]" },
  { regex: /disregard\s+(?:all\s+)?(?:previous|prior)\s+instructions/gi, replacement: "[neutralized: instruction bypass attempt]" },
  { regex: /system\s*prompt\s*override/gi, replacement: "[neutralized: system prompt override]" },
  { regex: /<\|(?:im_start|im_end|system|user|assistant)\|>/gi, replacement: "[neutralized: special token]" },
  { regex: /\[system\s*:\s*override\]/gi, replacement: "[neutralized: system override]" },
  { regex: /you\s+are\s+now\s+(?:in\s+)?(?:dan|developer\s+mode|unrestricted|jailbreak)/gi, replacement: "[neutralized: persona jailbreak]" },
  { regex: /do\s+anything\s+now/gi, replacement: "[neutralized: jailbreak phrase]" },
  { regex: /\bAIM\s*:\s*Always\s+Intelligent\s+and\s+Machiavellian\b/gi, replacement: "[neutralized: aim jailbreak]" },
];

/**
 * Strips control characters (except common whitespace \n, \r, \t)
 */
export function stripControlCharacters(input: string): string {
  if (!input) return "";
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g, "");
}

/**
 * Sanitizes untrusted plain text:
 * - Strips control chars
 * - Neutralizes prompt injection patterns
 * - Truncates to maxLength if provided
 */
export function sanitizeInertText(input: string, maxLength = 50000): string {
  if (!input || typeof input !== "string") return "";

  let cleaned = stripControlCharacters(input);

  for (const { regex, replacement } of PROMPT_INJECTION_PATTERNS) {
    cleaned = cleaned.replace(regex, replacement);
  }

  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength);
  }

  return cleaned.trim();
}

/**
 * Strips dangerous HTML tags and attributes while preserving harmless markup for inert presentation
 */
export function sanitizeInertHtml(rawHtml: string, maxLength = 100000): string {
  if (!rawHtml || typeof rawHtml !== "string") return "";

  let sanitized = stripControlCharacters(rawHtml);

  // Remove dangerous tags
  for (const tagRegex of DANGEROUS_HTML_TAGS) {
    sanitized = sanitized.replace(tagRegex, "");
  }

  // Remove dangerous attributes
  for (const attrRegex of DANGEROUS_ATTRIBUTES) {
    sanitized = sanitized.replace(attrRegex, "");
  }

  // Neutralize prompt injection inside text nodes
  for (const { regex, replacement } of PROMPT_INJECTION_PATTERNS) {
    sanitized = sanitized.replace(regex, replacement);
  }

  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized.trim();
}

/**
 * Creates a clean plain-text excerpt with no HTML markup or prompt exploits
 */
export function extractSafeExcerpt(text: string, maxLength = 200): string {
  if (!text) return "";
  const plain = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const safe = sanitizeInertText(plain, maxLength + 50);
  if (safe.length <= maxLength) return safe;
  return `${safe.slice(0, maxLength).trim()}…`;
}
