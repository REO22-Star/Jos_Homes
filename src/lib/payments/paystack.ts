import crypto from "node:crypto";
import { customAlphabet } from "nanoid";
import { env, isConfigured } from "@/env";

/**
 * Paystack integration for one-off inspection-fee payments.
 * Flow: initialize -> inline popup -> webhook (verify signature + re-verify) -> unlock.
 * See src/app/api/webhooks/paystack/route.ts for the webhook handler.
 */

const PAYSTACK_BASE = "https://api.paystack.co";
const nano = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12);

/** Server-generated, unique, human-traceable reference — our idempotency key. */
export function newPaymentReference(bookingId: string): string {
  return `insp_${bookingId}_${nano()}`;
}

interface InitializeArgs {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}

export interface InitializeResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export async function initializeTransaction(args: InitializeArgs): Promise<InitializeResult> {
  if (!isConfigured.paystack) {
    throw new Error("Paystack is not configured (set PAYSTACK_SECRET_KEY).");
  }
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: args.email,
      amount: args.amountKobo, // Paystack expects the smallest unit (kobo)
      reference: args.reference,
      currency: "NGN",
      callback_url: args.callbackUrl,
      metadata: args.metadata,
      channels: ["card", "bank", "ussd", "bank_transfer", "mobile_money"],
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(`Paystack initialize failed: ${json.message ?? res.statusText}`);
  }
  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
    reference: json.data.reference,
  };
}

export interface VerifyResult {
  status: "success" | "failed" | "abandoned" | string;
  amountKobo: number;
  currency: string;
  channel?: string;
  reference: string;
  raw: unknown;
}

/** Authoritative check — always re-verify server-side; never trust the webhook body alone. */
export async function verifyTransaction(reference: string): Promise<VerifyResult> {
  if (!isConfigured.paystack) {
    throw new Error("Paystack is not configured (set PAYSTACK_SECRET_KEY).");
  }
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` },
  });
  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(`Paystack verify failed: ${json.message ?? res.statusText}`);
  }
  return {
    status: json.data.status,
    amountKobo: json.data.amount,
    currency: json.data.currency,
    channel: json.data.channel,
    reference: json.data.reference,
    raw: json.data,
  };
}

/**
 * Verify the `x-paystack-signature` header: HMAC-SHA512 of the RAW request body
 * using the secret key. Must be computed over the exact bytes Paystack sent.
 */
export function isValidWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !env.PAYSTACK_SECRET_KEY) return false;
  const hash = crypto
    .createHmac("sha512", env.PAYSTACK_SECRET_KEY)
    .update(rawBody, "utf8")
    .digest("hex");
  // constant-time compare
  const a = Buffer.from(hash);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
