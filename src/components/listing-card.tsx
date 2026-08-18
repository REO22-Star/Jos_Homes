import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, MapPin, ShieldCheck, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatKobo } from "@/lib/money";
import { LISTING_TYPE_LABEL } from "@/lib/labels";
import type { ListingVM } from "@/lib/data/types";

export function ListingCard({ listing }: { listing: ListingVM }) {
  const cover = listing.media.find((m) => m.isCover) ?? listing.media[0];
  const hasVideo = listing.media.some((m) => m.kind === "VIDEO");

  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:shadow-lg hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-neutral-100 overflow-hidden">
        {cover && (
          <Image
            src={cover.thumbnailUrl ?? cover.url}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition group-hover:scale-105"
          />
        )}
        {/* Badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge variant="default">{LISTING_TYPE_LABEL[listing.type]}</Badge>
          {hasVideo && (
            <Badge variant="muted" className="bg-white/95 text-neutral-900 shadow-sm">
              <Video className="size-3" /> Video
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Price */}
        <div>
          <span className="text-2xl font-bold text-emerald-600">
            {formatKobo(listing.annualRentKobo)}
          </span>
          <span className="text-sm text-neutral-500 ml-1">/year</span>
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 font-semibold text-neutral-900 text-base leading-snug">
          {listing.title}
        </h3>

        {/* Location */}
        <p className="flex items-center gap-2 text-sm text-neutral-600">
          <MapPin className="size-4 shrink-0 text-emerald-600" />
          <span>{listing.area.name}</span>
        </p>

        {/* Specs */}
        <div className="mt-auto space-y-2 border-t border-neutral-100 pt-3">
          <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
            {listing.bedrooms != null && (
              <span className="flex items-center gap-2">
                <BedDouble className="size-4 text-emerald-600" />
                <span>{listing.bedrooms} bed{listing.bedrooms !== 1 ? "s" : ""}</span>
              </span>
            )}
            {listing.bathrooms != null && (
              <span className="flex items-center gap-2">
                <Bath className="size-4 text-emerald-600" />
                <span>{listing.bathrooms}</span>
              </span>
            )}
          </div>

          {/* Verified Badge */}
          {listing.agent.verified && (
            <div className="flex items-center gap-2 text-emerald-700 font-medium text-sm">
              <ShieldCheck className="size-4" /> Verified Agent
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
