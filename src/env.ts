import { z } from "zod";

/**
 * Central, validated environment access.
 *
 * Every integration key is OPTIONAL so the app boots and browses with demo
 * data before any external service is provisioned. Each lib checks `isConfigured`
 * for its slice and degrades gracefully (mock / disabled) when keys are missing.
 */
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),

  DATABASE_URL: z.string().optional(),

  // Auth (Clerk)
  CLERK_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),

  // Payments (Paystack)
  PAYSTACK_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: z.string().optional(),

  // OTP / SMS / WhatsApp (Termii)
  TERMII_API_KEY: z.string().optional(),
  TERMII_SENDER_ID: z.string().optional(),

  // Media (Cloudflare R2 + Stream)
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_PUBLIC_BASE_URL: z.string().optional(),
  CLOUDFLARE_STREAM_TOKEN: z.string().optional(),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
});

export const env = schema.parse(process.env);

export const isConfigured = {
  database: !!env.DATABASE_URL,
  clerk: !!env.CLERK_SECRET_KEY && !!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  paystack: !!env.PAYSTACK_SECRET_KEY && !!env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  termii: !!env.TERMII_API_KEY,
  r2: !!env.R2_ACCOUNT_ID && !!env.R2_ACCESS_KEY_ID && !!env.R2_SECRET_ACCESS_KEY,
  resend: !!env.RESEND_API_KEY,
} as const;
