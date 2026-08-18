/**
 * Contact-info redaction for PRE-PAYMENT chat messages.
 *
 * Renters unlock an agent's phone/WhatsApp by paying the inspection fee. To stop
 * both sides bypassing that fee, we strip phone numbers, emails, and messaging
 * handles from messages sent before a booking is PAID. After payment, messages
 * pass through untouched.
 */

const PATTERNS: Array<[RegExp, string]> = [
  // Nigerian & international phone numbers (with separators, +234, 0-prefixed, etc.)
  [/(\+?234[-\s.]?)?0?\d{3}[-\s.]?\d{3,4}[-\s.]?\d{3,4}/g, "[hidden — pay to unlock]"],
  // emails
  [/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, "[hidden — pay to unlock]"],
  // wa.me / whatsapp links & @handles
  [/(https?:\/\/)?(wa\.me|api\.whatsapp\.com)\/\S+/gi, "[hidden — pay to unlock]"],
  [/@[a-z0-9._]{3,}/gi, "[hidden — pay to unlock]"],
];

export function redactContactInfo(text: string): { body: string; redacted: boolean } {
  let body = text;
  let redacted = false;
  for (const [pattern, replacement] of PATTERNS) {
    if (pattern.test(body)) {
      redacted = true;
      body = body.replace(pattern, replacement);
    }
  }
  return { body, redacted };
}
