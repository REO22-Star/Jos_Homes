import { EmptyState } from '@/components/ui/EmptyState';
import { ButtonLink } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="container section">
      <EmptyState
        title="This page could not be found"
        description="The listing may have been removed, or the link may be incorrect. Explore current available homes instead."
      >
        <ButtonLink href="/search">Browse available homes</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Go to the home page
        </ButtonLink>
      </EmptyState>
    </div>
  );
}
