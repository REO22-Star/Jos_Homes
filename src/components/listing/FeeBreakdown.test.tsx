import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { buildFeeSummary } from '@/lib/domain/fees';
import { nairaToMinor } from '@/lib/domain/money';
import { FeeBreakdown } from './FeeBreakdown';

describe('FeeBreakdown', () => {
  it('renders each fee, marks not-stated distinctly, and shows the estimated total', () => {
    const fees = buildFeeSummary({
      rentMinor: nairaToMinor(850_000),
      rentFrequency: 'annual',
      disclosure: 'fees_listed',
      agencyMinor: nairaToMinor(85_000),
      serviceMinor: null,
    });
    render(<FeeBreakdown fees={fees} />);

    expect(screen.getByText('Rent')).toBeInTheDocument();
    expect(screen.getByText('NGN 85,000')).toBeInTheDocument();
    expect(screen.getByText('Not stated')).toBeInTheDocument();
    expect(screen.getByText('Estimated move-in total')).toBeInTheDocument();
    // 850,000 + 85,000 (service is not stated -> excluded)
    expect(screen.getByText('NGN 935,000')).toBeInTheDocument();
  });

  it('states clearly when no additional fee was declared', () => {
    const fees = buildFeeSummary({
      rentMinor: nairaToMinor(300_000),
      rentFrequency: 'annual',
      disclosure: 'none_known',
    });
    render(<FeeBreakdown fees={fees} />);
    expect(screen.getByText(/No additional fee was declared/)).toBeInTheDocument();
  });
});
