// View models shared by the demo fallback and the real Prisma-backed layer,
// so pages never care which source they came from.

export type ListingTypeVM =
  | "HOUSE"
  | "FLAT"
  | "SELF_CONTAIN"
  | "SHOP"
  | "OFFICE"
  | "LAND";

export interface AreaVM {
  id: string;
  name: string;
  slug: string;
  lga: string;
}

export interface AgentVM {
  id: string;
  businessName: string;
  avatarUrl?: string;
  verified: boolean;
  ratingAvg: number;
  ratingCount: number;
  // Only revealed after a paid booking — omitted in listing views.
  whatsappNumber?: string;
  phone?: string;
}

export interface MediaVM {
  kind: "IMAGE" | "VIDEO";
  url: string;
  thumbnailUrl?: string;
  isCover: boolean;
}

export interface ListingVM {
  id: string;
  slug: string;
  type: ListingTypeVM;
  title: string;
  description: string;
  area: AreaVM;
  addressText: string;
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  sizeSqm?: number;
  furnished: boolean;
  amenities: string[];
  annualRentKobo: number;
  agencyFeeKobo: number;
  cautionFeeKobo?: number;
  inspectionFeeKobo: number;
  media: MediaVM[];
  agent: AgentVM;
  createdAt: string;
}

export interface ListingFilters {
  q?: string;
  type?: ListingTypeVM;
  areaSlug?: string;
  minRentKobo?: number;
  maxRentKobo?: number;
  bedrooms?: number;
}
