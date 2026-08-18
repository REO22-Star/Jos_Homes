import { ShieldCheck } from "lucide-react";

/**
 * Persistent anti-fraud reminder. Advance-fee ("pay before you see it") scams are
 * common in the local rental market — this reinforces the fee-only model and
 * manages user expectations on every page.
 */
export function SafetyBanner() {
  return (
    <div className="bg-amber-50 text-amber-900 border-b border-amber-200">
      <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-2 text-xs sm:text-sm">
        <ShieldCheck className="size-4 shrink-0" />
        <p>
          <span className="font-semibold">Stay safe:</span> we only collect a small
          inspection fee. <span className="font-semibold">Never pay rent or a deposit</span>{" "}
          through this platform or to an agent before you have inspected the property.
        </p>
      </div>
    </div>
  );
}
