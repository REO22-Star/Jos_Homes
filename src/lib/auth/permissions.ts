import type { Role, VerificationStatus } from "@prisma/client";

/**
 * Server-side authorization policy. NEVER trust the client — every mutation
 * calls `can()` before acting. Keep this the single source of truth for access.
 */

export interface Actor {
  id: string;
  role: Role;
  // agent-specific context (present only for AGENT actors)
  agentProfileId?: string;
  agentVerification?: VerificationStatus;
}

export type Action =
  // renter
  | "listing:browse"
  | "listing:favorite"
  | "search:save"
  | "booking:create"
  | "message:send"
  | "review:create"
  // agent
  | "listing:create"
  | "listing:update"
  | "agent:viewAnalytics"
  // admin
  | "agent:approve"
  | "document:review"
  | "listing:moderate"
  | "user:suspend"
  | "review:hide"
  | "audit:view";

interface ResourceContext {
  // for ownership checks
  ownerAgentProfileId?: string;
  // for review gating
  bookingPaid?: boolean;
}

export function can(actor: Actor | null, action: Action, ctx: ResourceContext = {}): boolean {
  if (!actor) {
    // anonymous can only browse
    return action === "listing:browse";
  }

  if (actor.role === "ADMIN") return true; // admin can do everything

  switch (action) {
    // Anyone signed in
    case "listing:browse":
    case "listing:favorite":
    case "search:save":
    case "booking:create":
    case "message:send":
      return true;

    // Only the paid inspector may review
    case "review:create":
      return ctx.bookingPaid === true;

    // Agent actions — must be an APPROVED agent
    case "listing:create":
      return actor.role === "AGENT" && actor.agentVerification === "APPROVED";

    case "listing:update":
    case "agent:viewAnalytics":
      return (
        actor.role === "AGENT" &&
        actor.agentVerification === "APPROVED" &&
        (!ctx.ownerAgentProfileId || ctx.ownerAgentProfileId === actor.agentProfileId)
      );

    // Admin-only actions fall through (admins already returned true above)
    default:
      return false;
  }
}

/** Throwing variant for use in server actions / route handlers. */
export function assertCan(actor: Actor | null, action: Action, ctx?: ResourceContext): void {
  if (!can(actor, action, ctx)) {
    throw new Error(`Forbidden: ${actor?.role ?? "anonymous"} cannot ${action}`);
  }
}
