import { createHmac } from "crypto";
import { getEnv } from "@/lib/env";

/**
 * eSewa ePay v2 signed request + server-side verification stubs.
 *
 * NEVER trust the browser success URL alone — always verify with eSewa
 * status/lookup API using merchant credentials before marking an order PAID.
 *
 * TODO:
 * - Set ESEWA_PRODUCT_CODE, ESEWA_SECRET_KEY, ESEWA_ENVIRONMENT
 * - Confirm signed field order against current eSewa merchant docs
 * - Persist gateway transaction id + raw response for audit
 */

export interface EsewaPaymentRequest {
  amount: string;
  taxAmount: string;
  totalAmount: string;
  transactionUuid: string;
  productCode: string;
  productServiceCharge: string;
  productDeliveryCharge: string;
  successUrl: string;
  failureUrl: string;
  signedFieldNames: string;
  signature: string;
}

export interface EsewaVerifyResult {
  ok: boolean;
  status: "COMPLETE" | "PENDING" | "FULL_REFUND" | "PARTIAL_REFUND" | "CANCELED" | "NOT_FOUND" | "ERROR";
  transactionUuid: string;
  totalAmount: string | null;
  refId: string | null;
  raw: unknown;
  message: string;
}

function requireMerchantConfig(): { productCode: string; secretKey: string; environment: "test" | "production" } {
  const env = getEnv();
  // TODO: Fail hard in production when credentials are missing.
  const productCode = env.ESEWA_PRODUCT_CODE ?? "EPAYTEST";
  const secretKey = env.ESEWA_SECRET_KEY ?? "8gBm/:&EnhH.U/1?t{5294";
  const environment = env.ESEWA_ENVIRONMENT ?? "test";
  return { productCode, secretKey, environment };
}

/** HMAC-SHA256 base64 signature for eSewa form fields. */
export function signEsewaPayload(
  message: string,
  secretKey: string,
): string {
  return createHmac("sha256", secretKey).update(message).digest("base64");
}

/**
 * Build a signed eSewa payment initiation payload for form POST.
 * Amounts are major units as strings per eSewa form convention.
 */
export function createEsewaSignedRequest(input: {
  amountNprMajor: number;
  transactionUuid: string;
  successUrl: string;
  failureUrl: string;
  taxAmount?: number;
  serviceCharge?: number;
  deliveryCharge?: number;
}): EsewaPaymentRequest {
  const { productCode, secretKey } = requireMerchantConfig();
  const amount = input.amountNprMajor.toFixed(2);
  const taxAmount = (input.taxAmount ?? 0).toFixed(2);
  const productServiceCharge = (input.serviceCharge ?? 0).toFixed(2);
  const productDeliveryCharge = (input.deliveryCharge ?? 0).toFixed(2);
  const totalAmount = (
    input.amountNprMajor +
    (input.taxAmount ?? 0) +
    (input.serviceCharge ?? 0) +
    (input.deliveryCharge ?? 0)
  ).toFixed(2);

  const signedFieldNames =
    "total_amount,transaction_uuid,product_code";
  const message = `total_amount=${totalAmount},transaction_uuid=${input.transactionUuid},product_code=${productCode}`;
  const signature = signEsewaPayload(message, secretKey);

  return {
    amount,
    taxAmount,
    totalAmount,
    transactionUuid: input.transactionUuid,
    productCode,
    productServiceCharge,
    productDeliveryCharge,
    successUrl: input.successUrl,
    failureUrl: input.failureUrl,
    signedFieldNames,
    signature,
  };
}

export function getEsewaPaymentUrl(): string {
  const { environment } = requireMerchantConfig();
  return environment === "production"
    ? "https://epay.esewa.com.np/api/epay/main/v2/form"
    : "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
}

export function getEsewaStatusUrl(): string {
  const { environment } = requireMerchantConfig();
  return environment === "production"
    ? "https://epay.esewa.com.np/api/epay/transaction/status/"
    : "https://rc.esewa.com.np/api/epay/transaction/status/";
}

/**
 * Server-side transaction verification stub.
 * Call this from the callback route — do not mark PAID from query params alone.
 */
export async function verifyEsewaTransaction(input: {
  transactionUuid: string;
  totalAmount: string;
}): Promise<EsewaVerifyResult> {
  const { productCode } = requireMerchantConfig();
  const statusUrl = getEsewaStatusUrl();
  const url = new URL(statusUrl);
  url.searchParams.set("product_code", productCode);
  url.searchParams.set("total_amount", input.totalAmount);
  url.searchParams.set("transaction_uuid", input.transactionUuid);

  try {
    // TODO: Replace with live fetch once merchant credentials are confirmed.
    // const res = await fetch(url.toString(), { method: "GET", cache: "no-store" });
    // const data = await res.json();
    void url;

    return {
      ok: false,
      status: "ERROR",
      transactionUuid: input.transactionUuid,
      totalAmount: input.totalAmount,
      refId: null,
      raw: null,
      message:
        "eSewa verification stub: configure ESEWA_* credentials and enable live status lookup. Browser success URL must not be trusted alone.",
    };
  } catch (err) {
    return {
      ok: false,
      status: "ERROR",
      transactionUuid: input.transactionUuid,
      totalAmount: input.totalAmount,
      refId: null,
      raw: { error: String(err) },
      message: "eSewa status lookup failed.",
    };
  }
}
