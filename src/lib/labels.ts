import type { ListingTypeVM } from "@/lib/data/types";

export const LISTING_TYPE_LABEL: Record<ListingTypeVM, string> = {
  HOUSE: "House",
  FLAT: "Flat",
  SELF_CONTAIN: "Self-contain",
  SHOP: "Shop",
  OFFICE: "Office",
  LAND: "Land",
};

export const LISTING_TYPES: ListingTypeVM[] = [
  "HOUSE",
  "FLAT",
  "SELF_CONTAIN",
  "SHOP",
  "OFFICE",
  "LAND",
];

export const AMENITY_LABEL: Record<string, string> = {
  borehole: "Borehole",
  prepaid_meter: "Prepaid meter",
  pop_ceiling: "POP ceiling",
  security: "Security",
  parking: "Parking",
  water: "Water",
  generator: "Standby generator",
  bq: "Boys' quarter",
  high_traffic: "High foot traffic",
};

export function amenityLabel(key: string): string {
  return AMENITY_LABEL[key] ?? key.replace(/_/g, " ");
}
