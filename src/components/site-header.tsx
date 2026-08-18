import Link from "next/link";
import { Home, Search, Building2 } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-neutral-200 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 font-bold text-neutral-900 hover:opacity-80 transition-opacity">
          <span className="grid place-items-center size-9 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-md">
            <Home className="size-5" />
          </span>
          <span className="text-xl font-bold hidden sm:inline">
            Jos<span className="text-emerald-600">Homes</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-neutral-700 hover:bg-neutral-100 transition-colors font-medium"
          >
            <Search className="size-4" />
            <span className="hidden sm:inline">Browse</span>
          </Link>
          <Link
            href="/agents"
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Building2 className="size-4" />
            <span className="hidden sm:inline">List a property</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
