async function inspect() {
  const homeRes = await fetch("https://trihexdigital.shop", { headers: { "Cache-Control": "no-cache" } });
  const homeText = await homeRes.text();
  console.log("=== HOMEPAGE ===");
  console.log("Status:", homeRes.status);
  console.log("Has Live Verified Deals:", homeText.includes("Live Verified Deals"));
  console.log("Has 30 products:", homeText.includes("30 products"));
  const imgMatches = homeText.match(/\/media\/covers\/[a-zA-Z0-9_\-\.\/]+/g) || [];
  console.log("Unique images on homepage:", Array.from(new Set(imgMatches)).slice(0, 10));

  const prodRes = await fetch("https://trihexdigital.shop/products", { headers: { "Cache-Control": "no-cache" } });
  const prodText = await prodRes.text();
  console.log("\n=== PRODUCTS PAGE ===");
  console.log("Status:", prodRes.status);
  const prodImgMatches = prodText.match(/\/media\/covers\/[a-zA-Z0-9_\-\.\/]+/g) || [];
  console.log("Unique images on /products:", Array.from(new Set(prodImgMatches)).slice(0, 15));
}
inspect().catch(console.error);
