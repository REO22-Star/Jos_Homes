import "server-only";
import { hasDatabase, prisma } from "@/lib/prisma";
import { DEMO_LISTINGS, JOS_AREAS } from "./demo";
import type { AreaVM, ListingFilters, ListingVM } from "./types";

/**
 * Data access for listings. When DATABASE_URL is set we query Prisma; otherwise
 * we serve the in-memory demo set so the app browses immediately on first run.
 * Pages import only from here and never touch Prisma or demo data directly.
 */

export async function getAreas(): Promise<AreaVM[]> {
  if (!hasDatabase) {
    return JOS_AREAS.map(({ id, name, slug, lga }) => ({ id, name, slug, lga }));
  }
  const areas = await prisma.area.findMany({ orderBy: { name: "asc" } });
  return areas.map((a) => ({ id: a.id, name: a.name, slug: a.slug, lga: a.lga }));
}

function applyFilters(listings: ListingVM[], f: ListingFilters): ListingVM[] {
  return listings.filter((l) => {
    if (f.type && l.type !== f.type) return false;
    if (f.areaSlug && l.area.slug !== f.areaSlug) return false;
    if (f.bedrooms && (l.bedrooms ?? 0) < f.bedrooms) return false;
    if (f.minRentKobo && l.annualRentKobo < f.minRentKobo) return false;
    if (f.maxRentKobo && l.annualRentKobo > f.maxRentKobo) return false;
    if (f.q) {
      const q = f.q.toLowerCase();
      const hay = `${l.title} ${l.description} ${l.area.name} ${l.addressText}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export async function getListings(filters: ListingFilters = {}): Promise<ListingVM[]> {
  if (!hasDatabase) {
    return applyFilters(DEMO_LISTINGS, filters);
  }

  const rows = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.areaSlug ? { area: { slug: filters.areaSlug } } : {}),
      ...(filters.bedrooms ? { bedrooms: { gte: filters.bedrooms } } : {}),
      ...(filters.minRentKobo || filters.maxRentKobo
        ? {
            annualRent: {
              ...(filters.minRentKobo ? { gte: filters.minRentKobo } : {}),
              ...(filters.maxRentKobo ? { lte: filters.maxRentKobo } : {}),
            },
          }
        : {}),
      ...(filters.q
        ? {
            OR: [
              { title: { contains: filters.q, mode: "insensitive" } },
              { description: { contains: filters.q, mode: "insensitive" } },
              { addressText: { contains: filters.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { area: true, media: { orderBy: { order: "asc" } }, agentProfile: true },
    orderBy: { publishedAt: "desc" },
    take: 60,
  });

  return rows.map(toListingVM);
}

export async function getListingBySlug(slug: string): Promise<ListingVM | null> {
  if (!hasDatabase) {
    return DEMO_LISTINGS.find((l) => l.slug === slug) ?? null;
  }
  const row = await prisma.listing.findUnique({
    where: { slug },
    include: { area: true, media: { orderBy: { order: "asc" } }, agentProfile: true },
  });
  return row ? toListingVM(row) : null;
}

// Prisma row -> view model. Contact fields deliberately excluded (unlocked only after payment).
type Row = Awaited<ReturnType<typeof prisma.listing.findMany>>[number] & {
  area: { id: string; name: string; slug: string; lga: string };
  media: Array<{ kind: string; storageKey: string; thumbnailUrl: string | null; isCover: boolean }>;
  agentProfile: {
    id: string;
    businessName: string;
    avatarUrl: string | null;
    verificationStatus: string;
    ratingAvg: number;
    ratingCount: number;
  };
};

function toListingVM(row: Row): ListingVM {
  return {
    id: row.id,
    slug: row.slug,
    type: row.type as ListingVM["type"],
    title: row.title,
    description: row.description,
    area: { id: row.area.id, name: row.area.name, slug: row.area.slug, lga: row.area.lga },
    addressText: row.addressText,
    bedrooms: row.bedrooms ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
    toilets: row.toilets ?? undefined,
    sizeSqm: row.sizeSqm ?? undefined,
    furnished: row.furnished,
    amenities: row.amenities,
    annualRentKobo: row.annualRent,
    agencyFeeKobo: row.agencyFee,
    cautionFeeKobo: row.cautionFee ?? undefined,
    inspectionFeeKobo: row.inspectionFee,
    media: row.media.map((m) => ({
      kind: m.kind as "IMAGE" | "VIDEO",
      url: m.storageKey,
      thumbnailUrl: m.thumbnailUrl ?? undefined,
      isCover: m.isCover,
    })),
    agent: {
      id: row.agentProfile.id,
      businessName: row.agentProfile.businessName,
      avatarUrl: row.agentProfile.avatarUrl ?? undefined,
      verified: row.agentProfile.verificationStatus === "APPROVED",
      ratingAvg: row.agentProfile.ratingAvg,
      ratingCount: row.agentProfile.ratingCount,
    },
    createdAt: row.createdAt.toISOString(),
  };
}
