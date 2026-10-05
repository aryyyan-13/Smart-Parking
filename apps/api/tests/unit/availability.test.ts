import { describe, it, expect } from 'vitest';

export function checkOverlap(
  newStart: Date,
  newEnd: Date,
  existingBookings: { startsAt: Date, endsAt: Date }[]
): boolean {
  for (const b of existingBookings) {
    if (newStart < b.endsAt && newEnd > b.startsAt) {
      return true; // Overlaps
    }
  }
  return false;
}

describe('Availability Overlap Logic', () => {
  const existing = [
    { startsAt: new Date('2023-01-01T10:00:00Z'), endsAt: new Date('2023-01-01T12:00:00Z') }
  ];

  it('returns true if completely inside', () => {
    expect(checkOverlap(new Date('2023-01-01T10:30:00Z'), new Date('2023-01-01T11:30:00Z'), existing)).toBe(true);
  });

  it('returns true if partially overlapping at start', () => {
    expect(checkOverlap(new Date('2023-01-01T09:00:00Z'), new Date('2023-01-01T11:00:00Z'), existing)).toBe(true);
  });

  it('returns true if partially overlapping at end', () => {
    expect(checkOverlap(new Date('2023-01-01T11:00:00Z'), new Date('2023-01-01T13:00:00Z'), existing)).toBe(true);
  });

  it('returns false if adjacent before', () => {
    expect(checkOverlap(new Date('2023-01-01T08:00:00Z'), new Date('2023-01-01T10:00:00Z'), existing)).toBe(false);
  });

  it('returns false if adjacent after', () => {
    expect(checkOverlap(new Date('2023-01-01T12:00:00Z'), new Date('2023-01-01T14:00:00Z'), existing)).toBe(false);
  });
});
