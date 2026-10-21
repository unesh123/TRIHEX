import fs from "node:fs";

const base = process.argv[2];
if (!base?.startsWith("https://")) throw new Error("Provide the deployed HTTPS origin");
const keys = Object.keys(JSON.parse(fs.readFileSync("artwork-sources.json", "utf8")));
const errors = [];
let checked = 0;
for (let i = 0; i < keys.length; i += 4) {
  await Promise.all(keys.slice(i, i + 4).map(async key => {
    const response = await fetch(`${base}/media/artwork/${key}.webp`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!response.ok || !response.headers.get("content-type")?.includes("image/webp") || bytes.length > 180000 || bytes.length < 1000) errors.push({ key, status: response.status, bytes: bytes.length });
    checked++;
  }));
}
const pages = [];
for (const route of ["/", "/products", "/products/museai", "/products/elevenlabs-creator-shared", "/admin/login", "/api/health"]) {
  const response = await fetch(base + route);
  const text = await response.text();
  pages.push({ route, status: response.status, bytes: text.length });
  if (!response.ok) errors.push({ route, status: response.status });
  if (route === "/products/museai" && (!/1\s*Billion Tokens/i.test(text) || !text.includes("399"))) errors.push({ route, issue: "Token allowance or price missing" });
  if (route.includes("elevenlabs") && !text.includes("Only NPR 1,000")) errors.push({ route, issue: "Campaign banner missing" });
}
console.log(JSON.stringify({ base, checked, pages, errors }, null, 2));
if (errors.length) process.exitCode = 1;
