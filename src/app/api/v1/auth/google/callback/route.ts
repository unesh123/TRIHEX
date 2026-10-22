import { GET as googleCallbackGet } from "@/app/api/auth/google/callback/route";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return googleCallbackGet(request);
}
