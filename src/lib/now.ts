/**
 * Single source of "current time" for server rendering. Centralised so tests
 * and future milestones can inject a fixed clock. Freshness and availability
 * are always computed against this value.
 */
export function getNow(): Date {
  return new Date();
}
