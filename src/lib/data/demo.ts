import type { AreaVM, ListingVM } from "./types";
import { nairaToKobo } from "@/lib/money";

// Real Jos (Plateau State) localities used across the app and the DB seed.
export const JOS_AREAS: (AreaVM & { lat: number; lng: number })[] = [
  { id: "a-rayfield", name: "Rayfield", slug: "rayfield", lga: "Jos South", lat: 9.8035, lng: 8.8905 },
  { id: "a-bukuru", name: "Bukuru", slug: "bukuru", lga: "Jos South", lat: 9.7967, lng: 8.8631 },
  { id: "a-terminus", name: "Terminus", slug: "terminus", lga: "Jos North", lat: 9.9285, lng: 8.8921 },
  { id: "a-jenta", name: "Jenta", slug: "jenta", lga: "Jos North", lat: 9.9174, lng: 8.8698 },
  { id: "a-angwan-rukuba", name: "Angwan Rukuba", slug: "angwan-rukuba", lga: "Jos North", lat: 9.9502, lng: 8.8785 },
  { id: "a-tudun-wada", name: "Tudun Wada", slug: "tudun-wada", lga: "Jos North", lat: 9.9231, lng: 8.8802 },
  { id: "a-farin-gada", name: "Farin Gada", slug: "farin-gada", lga: "Jos North", lat: 9.9403, lng: 8.8912 },
  { id: "a-vom", name: "Vom", slug: "vom", lga: "Jos South", lat: 9.7295, lng: 8.7826 },
];

const area = (slug: string) => JOS_AREAS.find((a) => a.slug === slug)!;

function img(seed: string, cover = false) {
  // Deterministic placeholder photos for the keyless demo. Swap for R2/Cloudflare
  // Images once media uploads are wired.
  return {
    kind: "IMAGE" as const,
    url: `https://picsum.photos/seed/${seed}/1200/800`,
    thumbnailUrl: `https://picsum.photos/seed/${seed}/600/400`,
    isCover: cover,
  };
}

const demoAgents = {
  josHomes: {
    id: "ag-joshomes",
    businessName: "JosHomes Properties",
    verified: true,
    ratingAvg: 4.6,
    ratingCount: 38,
  },
  plateauLettings: {
    id: "ag-plateau",
    businessName: "Plateau Lettings",
    verified: true,
    ratingAvg: 4.3,
    ratingCount: 21,
  },
  cityShops: {
    id: "ag-cityshops",
    businessName: "City Shops & Spaces",
    verified: false,
    ratingAvg: 4.0,
    ratingCount: 7,
  },
} as const;

interface DemoSeed {
  slug: string;
  type: ListingVM["type"];
  title: string;
  areaSlug: string;
  addressText: string;
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  furnished?: boolean;
  amenities: string[];
  annualRent: number; // naira
  agencyFee: number;
  cautionFee?: number;
  inspectionFee: number;
  agent: (typeof demoAgents)[keyof typeof demoAgents];
  photos: string[];
  description: string;
}

const seeds: DemoSeed[] = [
  {
    slug: "3-bedroom-bungalow-rayfield",
    type: "HOUSE",
    title: "3 Bedroom Bungalow with Borehole",
    areaSlug: "rayfield",
    addressText: "Off Rayfield Resort Road, Jos South",
    bedrooms: 3,
    bathrooms: 3,
    toilets: 4,
    furnished: false,
    amenities: ["borehole", "prepaid_meter", "pop_ceiling", "security", "parking"],
    annualRent: 1_200_000,
    agencyFee: 120_000,
    cautionFee: 100_000,
    inspectionFee: 5_000,
    agent: demoAgents.josHomes,
    photos: ["ray1", "ray2", "ray3"],
    description:
      "Spacious 3-bedroom bungalow in a quiet, secure estate in Rayfield. Ensuite rooms, fitted kitchen, ample parking and a functional borehole. Prepaid meter installed.",
  },
  {
    slug: "self-contain-bukuru",
    type: "SELF_CONTAIN",
    title: "Neat Self-Contain near Bukuru Market",
    areaSlug: "bukuru",
    addressText: "Bukuru Express, Jos South",
    bedrooms: 1,
    bathrooms: 1,
    toilets: 1,
    furnished: false,
    amenities: ["prepaid_meter", "water", "security"],
    annualRent: 250_000,
    agencyFee: 25_000,
    inspectionFee: 3_000,
    agent: demoAgents.plateauLettings,
    photos: ["buk1", "buk2"],
    description:
      "Tidy self-contained apartment, tiled floors, water available, walking distance to Bukuru market and transport. Ideal for a young professional or student.",
  },
  {
    slug: "shop-space-terminus",
    type: "SHOP",
    title: "Lock-up Shop at Terminus Market",
    areaSlug: "terminus",
    addressText: "Terminus Main Market, Jos North",
    furnished: false,
    amenities: ["prepaid_meter", "security", "high_traffic"],
    annualRent: 600_000,
    agencyFee: 60_000,
    inspectionFee: 4_000,
    agent: demoAgents.cityShops,
    photos: ["shop1", "shop2"],
    description:
      "Prime lock-up shop in the heart of Terminus with heavy foot traffic. Suitable for retail, boutique or provisions. Secure with night guards.",
  },
  {
    slug: "2-bedroom-flat-farin-gada",
    type: "FLAT",
    title: "2 Bedroom Flat, Farin Gada",
    areaSlug: "farin-gada",
    addressText: "Farin Gada Road, Jos North",
    bedrooms: 2,
    bathrooms: 2,
    toilets: 2,
    furnished: false,
    amenities: ["borehole", "prepaid_meter", "parking", "pop_ceiling"],
    annualRent: 700_000,
    agencyFee: 70_000,
    cautionFee: 50_000,
    inspectionFee: 4_000,
    agent: demoAgents.josHomes,
    photos: ["far1", "far2", "far3"],
    description:
      "Well-finished 2-bedroom flat in a serviced compound. All rooms ensuite, POP ceilings, steady water from borehole, gated parking.",
  },
  {
    slug: "office-space-tudun-wada",
    type: "OFFICE",
    title: "Open-plan Office Space, Tudun Wada",
    areaSlug: "tudun-wada",
    addressText: "Tudun Wada, Jos North",
    furnished: true,
    amenities: ["prepaid_meter", "security", "parking", "generator"],
    annualRent: 900_000,
    agencyFee: 90_000,
    inspectionFee: 5_000,
    agent: demoAgents.plateauLettings,
    photos: ["off1", "off2"],
    description:
      "Ground-floor open-plan office, partitioned reception, standby generator and parking. Great for an NGO, startup or professional practice.",
  },
  {
    slug: "4-bedroom-duplex-rayfield",
    type: "HOUSE",
    title: "4 Bedroom Duplex with BQ",
    areaSlug: "rayfield",
    addressText: "Rayfield GRA, Jos South",
    bedrooms: 4,
    bathrooms: 4,
    toilets: 5,
    furnished: false,
    amenities: ["borehole", "prepaid_meter", "security", "parking", "bq", "pop_ceiling"],
    annualRent: 2_500_000,
    agencyFee: 250_000,
    cautionFee: 200_000,
    inspectionFee: 7_500,
    agent: demoAgents.josHomes,
    photos: ["dup1", "dup2", "dup3", "dup4"],
    description:
      "Luxury 4-bedroom duplex with a boys' quarter in Rayfield GRA. All ensuite, spacious living areas, large compound with parking for 4 cars, 24/7 security.",
  },
];

export const DEMO_LISTINGS: ListingVM[] = seeds.map((s, i) => {
  const a = area(s.areaSlug);
  return {
    id: `demo-${i}`,
    slug: s.slug,
    type: s.type,
    title: s.title,
    description: s.description,
    area: { id: a.id, name: a.name, slug: a.slug, lga: a.lga },
    addressText: s.addressText,
    bedrooms: s.bedrooms,
    bathrooms: s.bathrooms,
    toilets: s.toilets,
    furnished: s.furnished ?? false,
    amenities: s.amenities,
    annualRentKobo: nairaToKobo(s.annualRent),
    agencyFeeKobo: nairaToKobo(s.agencyFee),
    cautionFeeKobo: s.cautionFee ? nairaToKobo(s.cautionFee) : undefined,
    inspectionFeeKobo: nairaToKobo(s.inspectionFee),
    media: s.photos.map((p, idx) => img(p, idx === 0)),
    agent: {
      id: s.agent.id,
      businessName: s.agent.businessName,
      verified: s.agent.verified,
      ratingAvg: s.agent.ratingAvg,
      ratingCount: s.agent.ratingCount,
    },
    createdAt: new Date(2026, 6, 1 + i).toISOString(),
  };
});
