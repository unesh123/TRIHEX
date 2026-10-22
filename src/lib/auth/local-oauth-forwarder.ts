import http from "node:http";

let forwarderServer: http.Server | null = null;

/**
 * Lightweight local OAuth callback forwarder.
 * When Google Cloud Console has `http://127.0.0.1:8000/api/v1/auth/google/callback`
 * registered as the Authorized Redirect URI, this forwarder intercepts the redirect
 * on port 8000 and seamlessly forwards the OAuth code & state to Next.js on port 3000.
 */
export function startLocalOAuthForwarder(): void {
  // Only run in Node server runtime, not in Vercel or production serverless
  if (process.env.VERCEL || process.env.NEXT_RUNTIME === "edge" || forwarderServer) {
    return;
  }

  try {
    const server = http.createServer((req, res) => {
      const reqUrl = req.url || "";
      if (
        reqUrl.startsWith("/api/v1/auth/google/callback") ||
        reqUrl.startsWith("/api/auth/google/callback")
      ) {
        const queryIndex = reqUrl.indexOf("?");
        const queryParams = queryIndex !== -1 ? reqUrl.slice(queryIndex) : "";
        const target = `http://localhost:3000/api/auth/google/callback${queryParams}`;

        res.writeHead(302, {
          Location: target,
          "Content-Type": "text/html",
        });
        res.end(`<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${target}"></head><body>Redirecting to TRIHEX...</body></html>`);
        return;
      }

      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("TRIHEX Local OAuth Bridge Active");
    });

    server.on("error", (err: any) => {
      // If port 8000 is occupied by another local service, fail quietly
      if (err.code !== "EADDRINUSE") {
        console.warn("[LocalOAuthForwarder] Server note:", err.message);
      }
    });

    server.listen(8000, "127.0.0.1", () => {
      console.log("[LocalOAuthForwarder] Listening on 127.0.0.1:8000 for Google OAuth callbacks");
    });

    forwarderServer = server;
  } catch {
    // non-fatal
  }
}
