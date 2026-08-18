import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SafetyBanner } from "@/components/safety-banner";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "JosHomes — Houses & shops to rent in Jos",
    template: "%s · JosHomes",
  },
  description:
    "Find verified houses, flats, self-contains and shops to rent in Jos, Plateau State. Browse photos and video, book an inspection, and deal only with verified agents.",
  applicationName: "JosHomes",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "JosHomes", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-neutral-900">
        <SafetyBanner />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-neutral-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-neutral-500">
            <p className="font-medium text-neutral-700">JosHomes</p>
            <p className="mt-1">
              Houses & shops to rent in Jos, Plateau State. We collect inspection fees only —
              never rent or deposits.
            </p>
            <p className="mt-2 text-xs">
              © {new Date().getFullYear()} JosHomes ·{" "}
              <a href="/privacy" className="underline hover:text-neutral-700">
                Privacy (NDPR)
              </a>{" "}
              ·{" "}
              <a href="/terms" className="underline hover:text-neutral-700">
                Terms
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
