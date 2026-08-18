import { cn } from "@/lib/utils";

type Variant = "default" | "verified" | "muted" | "outline";

const styles: Record<Variant, string> = {
  default: "bg-emerald-600 text-white",
  verified: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  muted: "bg-neutral-100 text-neutral-600",
  outline: "text-neutral-700 ring-1 ring-neutral-300",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
