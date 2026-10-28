import { sumMinor } from './money';
import type { FeeDisclosureState, FeeLine, FeeSummary, MinorAmount, RentFrequency } from './types';

export interface FeeInput {
  rentMinor: MinorAmount;
  rentFrequency: RentFrequency;
  disclosure: FeeDisclosureState;
  /** undefined = line not applicable/hidden; null = shown as "Not stated". */
  agencyMinor?: MinorAmount | null;
  legalMinor?: MinorAmount | null;
  cautionMinor?: MinorAmount | null;
  serviceMinor?: MinorAmount | null;
  otherMinor?: MinorAmount | null;
  otherLabel?: string;
}

/**
 * Build the fee summary and estimated move-in total.
 *
 * The total is derived business logic (docs/DATA_MODEL.md #5), never an
 * independently editable amount. A `null` amount means "not stated" and is
 * NOT counted in the total, so unknown is never silently shown as zero
 * (docs/CONTENT_AND_COPY.md).
 */
export function buildFeeSummary(input: FeeInput): FeeSummary {
  const lines: FeeLine[] = [
    { key: 'rent', label: 'Rent', amountMinor: input.rentMinor, includedInTotal: true },
  ];

  const optional: Array<{
    key: FeeLine['key'];
    label: string;
    amount: MinorAmount | null | undefined;
  }> = [
    { key: 'agency', label: 'Agency fee', amount: input.agencyMinor },
    { key: 'legal', label: 'Legal fee', amount: input.legalMinor },
    { key: 'caution', label: 'Caution fee', amount: input.cautionMinor },
    { key: 'service', label: 'Service charge', amount: input.serviceMinor },
    { key: 'other', label: input.otherLabel?.trim() || 'Other fee', amount: input.otherMinor },
  ];

  for (const item of optional) {
    if (item.amount === undefined) continue; // line not applicable to this listing
    lines.push({
      key: item.key,
      label: item.label,
      amountMinor: item.amount,
      includedInTotal: item.amount !== null,
    });
  }

  const estimatedMoveInTotalMinor = sumMinor(
    lines.filter((line) => line.includedInTotal).map((line) => line.amountMinor),
  );

  return {
    rentFrequency: input.rentFrequency,
    disclosure: input.disclosure,
    lines,
    estimatedMoveInTotalMinor,
  };
}

/** Copy for a fee amount, distinguishing a real value from "not stated". */
export function feeAmountIsStated(line: FeeLine): boolean {
  return line.amountMinor !== null;
}

export function rentFrequencyLabel(frequency: RentFrequency): string {
  return frequency === 'annual' ? 'per year' : 'per month';
}
