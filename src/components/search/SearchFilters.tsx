import { Button, ButtonLink } from '@/components/ui/Button';
import { Field, Input, Select, CheckboxField } from '@/components/ui/Form';
import { AREAS } from '@/lib/data/areas';
import { PROPERTY_TYPE_LABEL } from '@/lib/domain/labels';
import type { PropertyType } from '@/lib/domain/types';
import type { SearchParams } from '@/lib/data/types';
import styles from './SearchFilters.module.css';

const PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_LABEL) as PropertyType[];

/**
 * Native GET form: submitting serializes the filters into the URL, so results
 * are shareable and the page works without client JavaScript (acceptance A2).
 */
export function SearchFilters({ params }: { params: SearchParams }) {
  return (
    <form className={styles.form} method="get" action="/search" aria-label="Filter listings">
      <div className={styles.header}>
        <h2 className={styles.heading}>Filters</h2>
        <ButtonLink href="/search" variant="ghost" size="sm">
          Clear
        </ButtonLink>
      </div>

      <Field label="Area" htmlFor="f-area">
        <Select id="f-area" name="area" defaultValue={params.area ?? ''}>
          <option value="">All Jos areas</option>
          {AREAS.map((a) => (
            <option key={a.slug} value={a.slug}>
              {a.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Type of home" htmlFor="f-type">
        <Select id="f-type" name="type" defaultValue={params.type ?? ''}>
          <option value="">Any type</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>
              {PROPERTY_TYPE_LABEL[t]}
            </option>
          ))}
        </Select>
      </Field>

      <div className={styles.pair}>
        <Field label="Lowest rent per year (NGN)" htmlFor="f-min">
          <Input
            id="f-min"
            name="minRent"
            type="number"
            inputMode="numeric"
            min={0}
            step={10000}
            defaultValue={params.minRent ?? ''}
          />
        </Field>
        <Field label="Highest rent per year (NGN)" htmlFor="f-max">
          <Input
            id="f-max"
            name="maxRent"
            type="number"
            inputMode="numeric"
            min={0}
            step={10000}
            defaultValue={params.maxRent ?? ''}
          />
        </Field>
      </div>

      <Field label="Minimum bedrooms" htmlFor="f-beds">
        <Select id="f-beds" name="beds" defaultValue={params.beds ? String(params.beds) : ''}>
          <option value="">Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </Select>
      </Field>

      <Field label="Sort by" htmlFor="f-sort">
        <Select id="f-sort" name="sort" defaultValue={params.sort ?? 'relevance'}>
          <option value="relevance">Recommended</option>
          <option value="newest">Recently confirmed</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </Select>
      </Field>

      <div className={styles.checks}>
        <CheckboxField
          id="f-furnished"
          name="furnished"
          value="true"
          label="Furnished only"
          defaultChecked={params.furnished}
        />
        <CheckboxField
          id="f-landlord"
          name="directLandlord"
          value="true"
          label="Direct landlord only"
          defaultChecked={params.directLandlord}
        />
      </div>

      <Button type="submit" variant="primary" fullWidth>
        Apply filters
      </Button>
    </form>
  );
}
