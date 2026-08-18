import Image from "next/image";
import { Video } from "lucide-react";
import type { MediaVM } from "@/lib/data/types";

/**
 * CSS scroll-snap gallery — smooth swiping on mobile with zero client JS.
 * Video items show a poster with a play badge; the player loads on the detail
 * page only when tapped (never autoplay on mobile data).
 */
export function ListingGallery({ media, title }: { media: MediaVM[]; title: string }) {
  if (media.length === 0) {
    return <div className="aspect-[16/10] w-full rounded-xl bg-neutral-200" />;
  }

  return (
    <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto rounded-xl">
      {media.map((m, i) => (
        <div
          key={i}
          className="relative aspect-[16/10] w-full shrink-0 snap-center overflow-hidden rounded-xl bg-neutral-100 sm:w-[85%]"
        >
          <Image
            src={m.thumbnailUrl ?? m.url}
            alt={`${title} — photo ${i + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, 700px"
            className="object-cover"
            priority={i === 0}
          />
          {m.kind === "VIDEO" && (
            <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
              <Video className="size-3" /> Video
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
