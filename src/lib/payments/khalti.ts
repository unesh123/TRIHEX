import { getEnv } from "@/lib/env";

/**
 * Khalti payment initiate + lookup verification stubs.
 *
 * NEVER trust the browser return URL alone — always lookup/verify with
 * Khalti server APIs using the secret key before marking an order PAID.
 *
 * TODO:
 * - Set KHALTI_SECRET_KEY and KHALTI_ENVIRONMENT
 * - Confirm initiate payload fields against current Khalti docs
 * - Persist pidx / transaction_id + raw responses for audit
 */

export interface KhaltiInitiateInput {
  amountPaisa: number;
  orderId: string;
  orderName: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  returnUrl: string;
  websiteUrl: string;
}

export interface KhaltiInitiateResult {
  ok: boolean;
  pidx: string | null;
  paymentUrl: string | null;
  expiresAt: string | null;
  raw: unknown;
  message: string;
}

export interface KhaltiLookupResult {
  ok: boolean;
  status: "Completed" | "Pending" | "Initiated" | "Refunded" | "Expired" | "User canceled" | "ERROR";
  pidx: string;
  totalAmount: number | null;
  transactionId: string | null;
  raw: unknown;
  message: string;
}

function requireKhaltiConfig(): {
  secretKey: string;
  environment: "test" | "production";
  baseUrl: string;
} {
  const env = getEnv();
  const environment = env.KHALTI_ENVIRONMENT ?? "test";
  const secretKey = env.KHALTI_SECRET_KEY ?? "";
  const baseUrl =
    environment === "production"
      ? "https://khalti.com/api/v2"
      : "https://dev.khalti.com/api/v2";
  return { secretKey, environment, baseUrl };
}

/**
 * Initiate a Khalti payment session (stub).
 */
export async function initiateKhaltiPayment(
  input: KhaltiInitiateInput,
): Promise<KhaltiInitiateResult> {
  const { secretKey, baseUrl } = requireKhaltiConfig();

  if (!Number.isInteger(input.amountPaisa) || input.amountPaisa <= 0) {
    return {
      ok: false,
      pidx: null,
      paymentUrl: null,
      expiresAt: null,
      raw: null,
      message: "Khalti amount must be a positive integer in paisa.",
    };
  }

  if (!secretKey) {
    return {
      ok: false,
      pidx: null,
      paymentUrl: null,
      expiresAt: null,
      raw: null,
      message:
        "Khalti initiate stub: set KHALTI_SECRET_KEY before enabling live payments.",
    };
  }

  // TODO: POST `${baseUrl}/epayment/initiate/` with Authorization: Key {secretKey}
  void baseUrl;
  void input;

  return {
    ok: false,
    pidx: null,
    paymentUrl: null,
    expiresAt: null,
    raw: null,
    message:
      "Khalti initiate stub: credentials present but live API call not enabled yet.",
  };
}

/**
 * Lookup / verify a Khalti payment by pidx (stub).
 * Call from the callback route — do not mark PAID from query params alone.
 */
export async function lookupKhaltiPayment(pidx: string): Promise<KhaltiLookupResult> {
  const { secretKey, baseUrl } = requireKhaltiConfig();

  if (!pidx) {
    return {
      ok: false,
      status: "ERROR",
      pidx: "",
      totalAmount: null,
      transactionId: null,
      raw: null,
      message: "Missing pidx.",
    };
  }

  if (!secretKey) {
    return {
      ok: false,
      status: "ERROR",
      pidx,
      totalAmount: null,
      transactionId: null,
      raw: null,
      message:
        "Khalti lookup stub: set KHALTI_SECRET_KEY. Browser return URL must not be trusted alone.",
    };
  }

  // TODO: POST `${baseUrl}/epayment/lookup/` with { pidx }
  void baseUrl;

  return {
    ok: false,
    status: "ERROR",
    pidx,
    totalAmount: null,
    transactionId: null,
    raw: null,
    message:
      "Khalti lookup stub: credentials present but live verification not enabled yet.",
  };
}
