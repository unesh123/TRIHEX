import fs from "fs";
import path from "path";

const targetFile = path.resolve("scripts/apply-v2-catalogue.ts");
let code = fs.readFileSync(targetFile, "utf-8");

const EXPANDED_VARIANTS: Record<string, any[]> = {
  "cursor-pro-12m": [
    { sku: "CUR-1M", name: "1 Month Pro Access", priceNpr: 1999, compareAtNpr: 4499, costNpr: 1350, stockQty: 30, durationValue: 1, durationUnit: "months", purchasable: true },
    { sku: "CUR-3M-SHARED", name: "3 Months Shared Team Seat", priceNpr: 4999, compareAtNpr: 9999, costNpr: 3375, stockQty: 25, durationValue: 3, durationUnit: "months", purchasable: true },
    { sku: "CUR-6M-SHARED", name: "6 Months Shared Team Seat", priceNpr: 8999, compareAtNpr: 18999, costNpr: 6075, stockQty: 20, durationValue: 6, durationUnit: "months", purchasable: true },
    { sku: "CUR-12M-SHARED", name: "12 Months Team Seat Invite (Shared)", priceNpr: 7999, compareAtNpr: 19999, costNpr: 4800, stockQty: 15, durationValue: 12, durationUnit: "months", purchasable: true },
    { sku: "CUR-12M", name: "12 Months Dedicated Pro Access", priceNpr: 15999, compareAtNpr: 34999, costNpr: 8100, stockQty: 12, durationValue: 12, durationUnit: "months", purchasable: true },
  ],
  "gamma-pro-1-year": [
    { sku: "GAM-1M-SHARED", name: "1 Month Shared Workspace", priceNpr: 1299, compareAtNpr: 2999, costNpr: 400, stockQty: 40, durationValue: 1, durationUnit: "months", purchasable: true },
    { sku: "GAM-3M-SHARED", name: "3 Months Shared Workspace", priceNpr: 2499, compareAtNpr: 5999, costNpr: 900, stockQty: 30, durationValue: 3, durationUnit: "months", purchasable: true },
    { sku: "GAM-6M-SHARED", name: "6 Months Shared Workspace", priceNpr: 4199, compareAtNpr: 9999, costNpr: 1600, stockQty: 25, durationValue: 6, durationUnit: "months", purchasable: true },
    { sku: "GAM-1Y", name: "1 Year Dedicated Membership", priceNpr: 6999, compareAtNpr: 14999, costNpr: 2700, stockQty: 17, durationValue: 1, durationUnit: "years", purchasable: true },
  ],
  "lovable-pro-12m": [
    { sku: "LOV-1M-SHARED", name: "1 Month Shared Seat", priceNpr: 1499, compareAtNpr: 3499, costNpr: 500, stockQty: 40, durationValue: 1, durationUnit: "months", purchasable: true },
    { sku: "LOV-3M-SHARED", name: "3 Months Shared Seat", priceNpr: 2899, compareAtNpr: 6999, costNpr: 1100, stockQty: 30, durationValue: 3, durationUnit: "months", purchasable: true },
    { sku: "LOV-6M-SHARED", name: "6 Months Shared Seat", priceNpr: 4699, compareAtNpr: 10999, costNpr: 2000, stockQty: 25, durationValue: 6, durationUnit: "months", purchasable: true },
    { sku: "LOV-12M", name: "12 Months Dedicated Access", priceNpr: 6999, compareAtNpr: 15999, costNpr: 3780, stockQty: 39, durationValue: 12, durationUnit: "months", purchasable: true },
  ],
  "gumloop-pro-12m": [
    { sku: "GUM-1M-SHARED", name: "1 Month Shared Plan", priceNpr: 999, compareAtNpr: 2499, costNpr: 250, stockQty: 50, durationValue: 1, durationUnit: "months", purchasable: true },
    { sku: "GUM-3M-SHARED", name: "3 Months Shared Plan", priceNpr: 1899, compareAtNpr: 4499, costNpr: 500, stockQty: 40, durationValue: 3, durationUnit: "months", purchasable: true },
    { sku: "GUM-6M-SHARED", name: "6 Months Shared Plan", priceNpr: 2899, compareAtNpr: 6999, costNpr: 750, stockQty: 30, durationValue: 6, durationUnit: "months", purchasable: true },
    { sku: "GUM-12M", name: "12 Months Dedicated Access", priceNpr: 4499, compareAtNpr: 9999, costNpr: 880, stockQty: 26, durationValue: 12, durationUnit: "months", purchasable: true },
  ],
  "supabase-pro-1-year": [
    { sku: "SUPA-1M-SHARED", name: "1 Month Shared Org Member", priceNpr: 1499, compareAtNpr: 3499, costNpr: 600, stockQty: 50, durationValue: 1, durationUnit: "months", purchasable: true },
    { sku: "SUPA-3M-SHARED", name: "3 Months Shared Org Member", priceNpr: 2999, compareAtNpr: 6999, costNpr: 1200, stockQty: 40, durationValue: 3, durationUnit: "months", purchasable: true },
    { sku: "SUPA-6M-SHARED", name: "6 Months Shared Org Member", priceNpr: 4699, compareAtNpr: 10999, costNpr: 2000, stockQty: 30, durationValue: 6, durationUnit: "months", purchasable: true },
    { sku: "SUPA-1Y", name: "1 Year Dedicated Plan", priceNpr: 6999, compareAtNpr: 14999, costNpr: 3240, stockQty: 59, durationValue: 1, durationUnit: "years", purchasable: true },
  ],
  "notion-business-12m": [
    { sku: "NOT-1M-SHARED", name: "1 Month Shared Team Seat", priceNpr: 1099, compareAtNpr: 2499, costNpr: 350, stockQty: 50, durationValue: 1, durationUnit: "months", purchasable: true },
    { sku: "NOT-3M-SHARED", name: "3 Months Shared Team Seat", priceNpr: 2199, compareAtNpr: 4999, costNpr: 700, stockQty: 40, durationValue: 3, durationUnit: "months", purchasable: true },
    { sku: "NOT-6M-SHARED", name: "6 Months Shared Team Seat", priceNpr: 3499, compareAtNpr: 7999, costNpr: 1200, stockQty: 30, durationValue: 6, durationUnit: "months", purchasable: true },
    { sku: "NOT-12M", name: "12 Months Dedicated Workspace", priceNpr: 4999, compareAtNpr: 12999, costNpr: 2160, stockQty: 18, durationValue: 12, durationUnit: "months", purchasable: true },
  ],
  "runway-pro-12m": [
    { sku: "RUN-1M-SHARED", name: "1 Month Shared Workspace", priceNpr: 2499, compareAtNpr: 5999, costNpr: 900, stockQty: 50, durationValue: 1, durationUnit: "months", purchasable: true },
    { sku: "RUN-3M-SHARED", name: "3 Months Shared Workspace", priceNpr: 5499, compareAtNpr: 12999, costNpr: 1900, stockQty: 40, durationValue: 3, durationUnit: "months", purchasable: true },
    { sku: "RUN-6M-SHARED", name: "6 Months Shared Workspace", priceNpr: 8999, compareAtNpr: 19999, costNpr: 3200, stockQty: 30, durationValue: 6, durationUnit: "months", purchasable: true },
    { sku: "RUN-12M", name: "12 Months Dedicated Access", priceNpr: 14999, compareAtNpr: 29999, costNpr: 6750, stockQty: 51, durationValue: 12, durationUnit: "months", purchasable: true },
  ],
  "granola-business-12m": [
    { sku: "GRAN-1M-SHARED", name: "1 Month Shared Seat", priceNpr: 1299, compareAtNpr: 2999, costNpr: 300, stockQty: 50, durationValue: 1, durationUnit: "months", purchasable: true },
    { sku: "GRAN-3M-SHARED", name: "3 Months Shared Seat", priceNpr: 2499, compareAtNpr: 5999, costNpr: 600, stockQty: 40, durationValue: 3, durationUnit: "months", purchasable: true },
    { sku: "GRAN-6M-SHARED", name: "6 Months Shared Seat", priceNpr: 3999, compareAtNpr: 8999, costNpr: 1000, stockQty: 30, durationValue: 6, durationUnit: "months", purchasable: true },
    { sku: "GRAN-12M", name: "12 Months Dedicated License", priceNpr: 5999, compareAtNpr: 14999, costNpr: 2700, stockQty: 108, durationValue: 12, durationUnit: "months", purchasable: true },
  ],
  "mobbin-12m": [
    { sku: "MOB-1M-SHARED", name: "1 Month Shared Seat", priceNpr: 1499, compareAtNpr: 3499, costNpr: 350, stockQty: 50, durationValue: 1, durationUnit: "months", purchasable: true },
    { sku: "MOB-3M-SHARED", name: "3 Months Shared Seat", priceNpr: 2799, compareAtNpr: 6499, costNpr: 700, stockQty: 40, durationValue: 3, durationUnit: "months", purchasable: true },
    { sku: "MOB-6M-SHARED", name: "6 Months Shared Seat", priceNpr: 4499, compareAtNpr: 9999, costNpr: 1100, stockQty: 30, durationValue: 6, durationUnit: "months", purchasable: true },
    { sku: "MOB-12M-10X", name: "12 Months 10x Team License", priceNpr: 6999, compareAtNpr: 15999, costNpr: 1485, stockQty: 33, durationValue: 12, durationUnit: "months", purchasable: true },
  ],
  "railway-hobby-12m": [
    { sku: "RAIL-1M-SHARED", name: "1 Month Shared Workspace", priceNpr: 999, compareAtNpr: 2499, costNpr: 300, stockQty: 50, durationValue: 1, durationUnit: "months", purchasable: true },
    { sku: "RAIL-3M-SHARED", name: "3 Months Shared Workspace", priceNpr: 1899, compareAtNpr: 4499, costNpr: 600, stockQty: 40, durationValue: 3, durationUnit: "months", purchasable: true },
    { sku: "RAIL-6M-SHARED", name: "6 Months Shared Workspace", priceNpr: 2899, compareAtNpr: 6999, costNpr: 1000, stockQty: 30, durationValue: 6, durationUnit: "months", purchasable: true },
    { sku: "RAIL-12M", name: "12 Months Dedicated Plan", priceNpr: 3999, compareAtNpr: 9999, costNpr: 1620, stockQty: 65, durationValue: 12, durationUnit: "months", purchasable: true },
  ],
  "framer-pro-12m": [
    { sku: "FRA-1M-SHARED", name: "1 Month Shared Workspace", priceNpr: 1499, compareAtNpr: 3499, costNpr: 500, stockQty: 50, durationValue: 1, durationUnit: "months", purchasable: true },
    { sku: "FRA-3M-SHARED", name: "3 Months Shared Workspace", priceNpr: 2999, compareAtNpr: 6999, costNpr: 1100, stockQty: 40, durationValue: 3, durationUnit: "months", purchasable: true },
    { sku: "FRA-6M-SHARED", name: "6 Months Shared Workspace", priceNpr: 4899, compareAtNpr: 10999, costNpr: 1800, stockQty: 30, durationValue: 6, durationUnit: "months", purchasable: true },
    { sku: "FRA-12M", name: "12 Months Dedicated Access", priceNpr: 7499, compareAtNpr: 15999, costNpr: 2970, stockQty: 40, durationValue: 12, durationUnit: "months", purchasable: true },
  ],
  "factory-12m": [
    { sku: "FACT-1M-SHARED", name: "1 Month Shared Seat", priceNpr: 1699, compareAtNpr: 3999, costNpr: 550, stockQty: 50, durationValue: 1, durationUnit: "months", purchasable: true },
    { sku: "FACT-3M-SHARED", name: "3 Months Shared Seat", priceNpr: 3499, compareAtNpr: 7999, costNpr: 1200, stockQty: 40, durationValue: 3, durationUnit: "months", purchasable: true },
    { sku: "FACT-6M-SHARED", name: "6 Months Shared Seat", priceNpr: 5499, compareAtNpr: 12999, costNpr: 2000, stockQty: 30, durationValue: 6, durationUnit: "months", purchasable: true },
    { sku: "FACT-12M", name: "12 Months Enterprise Droid", priceNpr: 8999, compareAtNpr: 18999, costNpr: 3375, stockQty: 25, durationValue: 12, durationUnit: "months", purchasable: true },
  ],
  "higgsfield-pro-12m": [
    { sku: "HIGGS-1M-SHARED", name: "1 Month Shared Cinema Plan", priceNpr: 2999, compareAtNpr: 6999, costNpr: 1200, stockQty: 30, durationValue: 1, durationUnit: "months", purchasable: true },
    { sku: "HIGGS-3M-SHARED", name: "3 Months Shared Cinema Plan", priceNpr: 6999, compareAtNpr: 14999, costNpr: 2800, stockQty: 20, durationValue: 3, durationUnit: "months", purchasable: true },
    { sku: "HIGGS-6M-SHARED", name: "6 Months Shared Cinema Plan", priceNpr: 11999, compareAtNpr: 24999, costNpr: 5200, stockQty: 15, durationValue: 6, durationUnit: "months", purchasable: true },
    { sku: "HIGGS-12M", name: "12 Months Pro Cinema", priceNpr: 17999, compareAtNpr: 35000, costNpr: 7425, stockQty: 10, durationValue: 12, durationUnit: "months", purchasable: true },
  ],
  "manus-ai-pro-12m": [
    { sku: "MANUS-1M-SHARED", name: "1 Month Shared Agentic Seat", priceNpr: 1899, compareAtNpr: 4499, costNpr: 700, stockQty: 35, durationValue: 1, durationUnit: "months", purchasable: true },
    { sku: "MANUS-3M-SHARED", name: "3 Months Shared Agentic Seat", priceNpr: 3999, compareAtNpr: 8999, costNpr: 1600, stockQty: 25, durationValue: 3, durationUnit: "months", purchasable: true },
    { sku: "MANUS-6M-SHARED", name: "6 Months Shared Agentic Seat", priceNpr: 6499, compareAtNpr: 14999, costNpr: 2800, stockQty: 20, durationValue: 6, durationUnit: "months", purchasable: true },
    { sku: "MANUS-12M", name: "12 Months Dedicated Agentic Pro", priceNpr: 9679, compareAtNpr: 22000, costNpr: 4050, stockQty: 15, durationValue: 12, durationUnit: "months", purchasable: true },
  ],
  "warp-build-1-year": [
    { sku: "WARP-1M-SHARED", name: "1 Month Shared Runner", priceNpr: 999, compareAtNpr: 2499, costNpr: 300, stockQty: 50, durationValue: 1, durationUnit: "months", purchasable: true },
    { sku: "WARP-3M-SHARED", name: "3 Months Shared Runner", priceNpr: 1799, compareAtNpr: 4499, costNpr: 600, stockQty: 40, durationValue: 3, durationUnit: "months", purchasable: true },
    { sku: "WARP-6M-SHARED", name: "6 Months Shared Runner", priceNpr: 2699, compareAtNpr: 6499, costNpr: 950, stockQty: 30, durationValue: 6, durationUnit: "months", purchasable: true },
    { sku: "WARP-1Y", name: "1 Year Dedicated Plan", priceNpr: 3699, compareAtNpr: 8999, costNpr: 1620, stockQty: 25, durationValue: 1, durationUnit: "years", purchasable: true },
  ],
  "n8n-starter-1-year": [
    { sku: "N8N-1M-SHARED", name: "1 Month Shared Cloud Flow", priceNpr: 1199, compareAtNpr: 2999, costNpr: 400, stockQty: 50, durationValue: 1, durationUnit: "months", purchasable: true },
    { sku: "N8N-3M-SHARED", name: "3 Months Shared Cloud Flow", priceNpr: 2199, compareAtNpr: 5499, costNpr: 800, stockQty: 40, durationValue: 3, durationUnit: "months", purchasable: true },
    { sku: "N8N-6M-SHARED", name: "6 Months Shared Cloud Flow", priceNpr: 3299, compareAtNpr: 7999, costNpr: 1300, stockQty: 30, durationValue: 6, durationUnit: "months", purchasable: true },
    { sku: "N8N-1Y", name: "1 Year Dedicated Plan", priceNpr: 4699, compareAtNpr: 11999, costNpr: 2400, stockQty: 25, durationValue: 1, durationUnit: "years", purchasable: true },
  ],
  "coursera-premium-1-year": [
    { sku: "COUR-3M", name: "3 Months Plus Plan", priceNpr: 1299, compareAtNpr: 3499, costNpr: 350, stockQty: 50, durationValue: 3, durationUnit: "months", purchasable: true },
    { sku: "COUR-6M", name: "6 Months Plus Plan", priceNpr: 1899, compareAtNpr: 4999, costNpr: 550, stockQty: 40, durationValue: 6, durationUnit: "months", purchasable: true },
    { sku: "COUR-1Y", name: "1 Year Plus Unlimited", priceNpr: 2499, compareAtNpr: 6999, costNpr: 750, stockQty: 85, durationValue: 1, durationUnit: "years", purchasable: true },
  ],
  "supergrok-3-months": [
    { sku: "GROK-1M", name: "1 Month Grok 2 Vision", priceNpr: 1299, compareAtNpr: 2999, costNpr: 400, stockQty: 40, durationValue: 1, durationUnit: "months", purchasable: true },
    { sku: "GROK-3M", name: "3 Months Dedicated Access", priceNpr: 2499, compareAtNpr: 5999, costNpr: 800, stockQty: 10, durationValue: 3, durationUnit: "months", purchasable: true },
  ],
  "chatgpt-plus-1-month-fw": [
    { sku: "GPT-1M-FW", name: "1 Month Full Warranty", priceNpr: 1050, compareAtNpr: 3499, costNpr: 450, stockQty: 35, durationValue: 1, durationUnit: "months", purchasable: true },
    { sku: "GPT-1M-BIZ-SLOT", name: "ChatGPT Business Workspace Seat (1M)", priceNpr: 1899, compareAtNpr: 4999, costNpr: 800, stockQty: 50, durationValue: 1, durationUnit: "months", purchasable: true },
    { sku: "GPT-3M-FW", name: "3 Months Full Warranty", priceNpr: 2899, compareAtNpr: 7499, costNpr: 1250, stockQty: 25, durationValue: 3, durationUnit: "months", purchasable: true },
  ]
};

// Replaces variants for each matched product in code
for (const [slug, newVariants] of Object.entries(EXPANDED_VARIANTS)) {
  const needle = `slug: "${slug}"`;
  const idxSlug = code.indexOf(needle);
  if (idxSlug === -1) {
    console.warn(`Could not find slug: ${slug}`);
    continue;
  }

  const variantsNeedle = `variants: [`;
  const idxVariants = code.indexOf(variantsNeedle, idxSlug);
  if (idxVariants === -1) {
    console.warn(`Could not find variants: [ for slug: ${slug}`);
    continue;
  }

  const startBracket = idxVariants + variantsNeedle.length - 1; // index of '['
  let depth = 0;
  let endBracket = -1;
  for (let i = startBracket; i < code.length; i++) {
    if (code[i] === '[') depth++;
    else if (code[i] === ']') {
      depth--;
      if (depth === 0) {
        endBracket = i;
        break;
      }
    }
  }

  if (endBracket === -1) {
    console.warn(`Could not find matching closing bracket for slug: ${slug}`);
    continue;
  }

  const variantsFormatted = newVariants.map((v) => {
    return `      {\n` +
      `        sku: ${JSON.stringify(v.sku)},\n` +
      `        name: ${JSON.stringify(v.name)},\n` +
      `        priceNpr: ${v.priceNpr},\n` +
      `        compareAtNpr: ${v.compareAtNpr},\n` +
      `        costNpr: ${v.costNpr},\n` +
      `        stockQty: ${v.stockQty},\n` +
      `        durationValue: ${v.durationValue},\n` +
      `        durationUnit: ${JSON.stringify(v.durationUnit)},\n` +
      `        purchasable: ${v.purchasable},\n` +
      `      }`;
  }).join(",\n");

  const replacement = `variants: [\n${variantsFormatted},\n    ]`;
  code = code.slice(0, idxVariants) + replacement + code.slice(endBracket + 1);
  console.log(`Updated variants for: ${slug} (${newVariants.length} tiers)`);
}

fs.writeFileSync(targetFile, code, "utf-8");
console.log("Successfully updated apply-v2-catalogue.ts!");

