import { Lock, ShieldCheck, Star, CalendarCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatKobo } from "@/lib/money";
import type { ListingVM } from "@/lib/data/types";
import { isConfigured } from "@/env";

/**
 * Agent + pay-to-unlock card. Agent phone/WhatsApp stay hidden until the renter
 * pays the inspection fee (Paystack) and the booking becomes PAID. This component
 * renders the locked state; the payment action is wired in Phase 1.
 */
export function UnlockCard({ listing }: { listing: ListingVM }) {
  return (
    <aside className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-full bg-emerald-600 text-lg font-semibold text-white">
          {listing.agent.businessName.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-neutral-900">{listing.agent.businessName}</p>
          <p className="flex items-center gap-2 text-sm text-neutral-500">
            {listing.agent.verified ? (
              <Badge variant="verified">
                <ShieldCheck className="size-3" /> Verified agent
              </Badge>
            ) : (
              <Badge variant="muted">Unverified</Badge>
            )}
            {listing.agent.ratingCount > 0 && (
              <span className="flex items-center gap-0.5">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                {listing.agent.ratingAvg.toFixed(1)} ({listing.agent.ratingCount})
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="my-4 rounded-lg bg-neutral-50 p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-neutral-600">Inspection fee</span>
          <span className="font-semibold text-neutral-900">
            {formatKobo(listing.inspectionFeeKobo)}
          </span>
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-neutral-500">
          <Lock className="size-3.5" /> Unlocks the agent&apos;s phone &amp; WhatsApp and lets you
          book a viewing.
        </p>
      </div>

      <button
        type="submit"
        disabled
        title={
          isConfigured.paystack
            ? "Sign in to continue"
            : "Payments not configured yet (set PAYSTACK keys)"
        }
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <CalendarCheck className="size-4" />
        Pay {formatKobo(listing.inspectionFeeKobo)} &amp; book inspection
      </button>

      <p className="mt-3 text-center text-xs text-neutral-400">
        Secured by Paystack · card, transfer, USSD &amp; mobile money
      </p>
    </aside>
  );
}
