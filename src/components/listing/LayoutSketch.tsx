import type { PropertyType } from '@/lib/domain/types';
import styles from './LayoutSketch.module.css';

interface Room {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

/**
 * Rooms of a typical layout for each property type, on a 160 x 120 grid.
 * These are generic, never the actual property, and the listing list says so.
 */
const LAYOUTS: Record<PropertyType, Room[]> = {
  self_contained: [
    { x: 8, y: 8, w: 96, h: 104, label: 'Room' },
    { x: 104, y: 8, w: 48, h: 52, label: 'Bath' },
    { x: 104, y: 60, w: 48, h: 52, label: 'Kitchen' },
  ],
  mini_flat: [
    { x: 8, y: 8, w: 72, h: 104, label: 'Parlour' },
    { x: 80, y: 8, w: 72, h: 62, label: 'Bed' },
    { x: 80, y: 70, w: 36, h: 42, label: 'Kitchen' },
    { x: 116, y: 70, w: 36, h: 42, label: 'Bath' },
  ],
  one_bedroom: [
    { x: 8, y: 8, w: 80, h: 104, label: 'Parlour' },
    { x: 88, y: 8, w: 64, h: 62, label: 'Bed' },
    { x: 88, y: 70, w: 32, h: 42, label: 'Kitchen' },
    { x: 120, y: 70, w: 32, h: 42, label: 'Bath' },
  ],
  two_bedroom: [
    { x: 8, y: 8, w: 72, h: 54, label: 'Bed' },
    { x: 80, y: 8, w: 72, h: 54, label: 'Bed' },
    { x: 8, y: 62, w: 92, h: 50, label: 'Parlour' },
    { x: 100, y: 62, w: 52, h: 26, label: 'Kitchen' },
    { x: 100, y: 88, w: 52, h: 24, label: 'Bath' },
  ],
  three_bedroom: [
    { x: 8, y: 8, w: 48, h: 50, label: 'Bed' },
    { x: 56, y: 8, w: 48, h: 50, label: 'Bed' },
    { x: 104, y: 8, w: 48, h: 50, label: 'Bed' },
    { x: 8, y: 58, w: 92, h: 54, label: 'Parlour' },
    { x: 100, y: 58, w: 52, h: 28, label: 'Kitchen' },
    { x: 100, y: 86, w: 52, h: 26, label: 'Bath' },
  ],
  duplex: [
    { x: 8, y: 8, w: 144, h: 50, label: 'Upstairs: bedrooms' },
    { x: 8, y: 58, w: 92, h: 54, label: 'Parlour' },
    { x: 100, y: 58, w: 52, h: 54, label: 'Kitchen' },
  ],
};

/** Line drawing of a typical layout, shown in place of a missing photo. */
export function LayoutSketch({ propertyType }: { propertyType: PropertyType }) {
  return (
    <div className={styles.sketch} aria-hidden="true">
      <svg viewBox="0 0 160 120" focusable="false">
        {LAYOUTS[propertyType].map((room, i) => (
          <g key={i}>
            <rect x={room.x} y={room.y} width={room.w} height={room.h} />
            <text x={room.x + room.w / 2} y={room.y + room.h / 2 + 3}>
              {room.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
