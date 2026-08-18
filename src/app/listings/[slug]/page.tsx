import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BedDouble, Bath, Toilet, Ruler, MapPin, Check } from "lucide-react";
import { getListingBySlug } from "@/lib/data/listings";
import { ListingGallery } from "@/components/listing-gallery";
import { UnlockCard } from "@/components/unlock-card";
import { Badge } from "@/components/ui/badge";
import { formatKobo } from "@/lib/money";
import { LISTING_TYPE_LABEL, amenityLabel } from "@/lib/labels";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: "Listing not found" };
  return {
    title: listing.title,
    description: `${LISTING_TYPE_LABEL[listing.type]} to rent in ${listing.area.name}, Jos — ${formatKobo(
      listing.annualRentKobo,
    )}/yr.`,
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const facts: { icon: React.ReactNode; label: string }[] = [];
  if (listing.bedrooms != null)
    facts.push({ icon: <BedDouble className="size-4" />, label: `${listing.bedrooms} bed` });
  if (listing.bathrooms != null)
    facts.push({ icon: <Bath className="size-4" />, label: `${listing.bathrooms} bath` });
  if (listing.toilets != null)
    facts.push({ icon: <Toilet className="size-4" />, label: `${listing.toilets} toilet` });
  if (listing.sizeSqm != null)
    facts.push({ icon: <Ruler className="size-4" />, label: `${listing.sizeSqm} sqm` });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <ListingGallery media={listing.media} title={listing.title} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main column */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{LISTING_TYPE_LABEL[listing.type]}</Badge>
            {listing.furnished && <Badge variant="outline">Furnished</Badge>}
          </div>

          <h1 className="mt-2 text-2xl font-bold text-neutral-900">{listing.title}</h1>
          <p className="mt-1 flex items-center gap-1 text-neutral-600">
            <MapPin className="size-4" />
            {listing.addressText} · {listing.area.name}, {listing.area.lga}
          </p>

          <p className="mt-4 text-2xl font-bold text-emerald-700">
            {formatKobo(listing.annualRentKobo)}
            <span className="text-sm font-normal text-neutral-500">/year</span>
          </p>

          {facts.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4 rounded-xl border border-neutral-200 bg-white p-4">
              {facts.map((f, i) => (
                <span key={i} className="flex items-center gap-1.5 text-sm text-neutral-700">
                  {f.icon}
                  {f.label}
                </span>
              ))}
            </div>
          )}

          <section className="mt-6">
            <h2 className="text-lg font-semibold text-neutral-900">Description</h2>
            <p className="mt-2 whitespace-pre-line text-neutral-700">{listing.description}</p>
          </section>

          {listing.amenities.length > 0 && (
            <section className="mt-6">
              <h2 className="text-lg font-semibold text-neutral-900">Amenities</h2>
              <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {listing.amenities.map((a) => (
                  <li key={a} className="flex items-center gap-1.5 text-sm text-neutral-700">
                    <Check className="size-4 text-emerald-600" />
                    {amenityLabel(a)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-neutral-900">Fees</h2>
            <dl className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-600">Annual rent</dt>
                <dd className="font-medium">{formatKobo(listing.annualRentKobo)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-600">Agency fee</dt>
                <dd className="font-medium">{formatKobo(listing.agencyFeeKobo)}</dd>
              </div>
              {listing.cautionFeeKobo != null && (
                <div className="flex justify-between">
                  <dt className="text-neutral-600">Caution / deposit</dt>
                  <dd className="font-medium">{formatKobo(listing.cautionFeeKobo)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-neutral-100 pt-1">
                <dt className="text-neutral-600">Inspection fee (paid online)</dt>
                <dd className="font-semibold text-emerald-700">
                  {formatKobo(listing.inspectionFeeKobo)}
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-neutral-400">
              Rent, agency and caution fees are settled with the agent after inspection — never
              through this platform.
            </p>
          </section>
        </div>

        {/* Sticky agent / unlock column */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <UnlockCard listing={listing} />
        </div>
      </div>
    </div>
  );
}
