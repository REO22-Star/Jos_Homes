import type { Area } from '@/lib/domain/types';

/**
 * Controlled list of public Jos-area names used for search consistency.
 * These are neighbourhood names only — never private street addresses.
 * Fictional/illustrative selection for the Milestone 0 prototype.
 */
export const AREAS: Area[] = [
  { name: 'Rayfield', slug: 'rayfield' },
  { name: 'Bukuru', slug: 'bukuru' },
  { name: 'Farin Gada', slug: 'farin-gada' },
  { name: 'Tudun Wada', slug: 'tudun-wada' },
  { name: 'Rukuba Road', slug: 'rukuba-road' },
  { name: 'Anglo Jos', slug: 'anglo-jos' },
  { name: 'Dadin Kowa', slug: 'dadin-kowa' },
  { name: 'State Low Cost', slug: 'state-low-cost' },
  { name: 'Lamingo', slug: 'lamingo' },
  { name: 'Kabong', slug: 'kabong' },
];

export function areaBySlug(slug: string): Area | undefined {
  return AREAS.find((a) => a.slug === slug);
}
