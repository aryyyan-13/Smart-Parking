import { describe, it, expect, vi } from 'vitest';

export function calculatePrice(basePricePaise: number, startsAt: Date, endsAt: Date): number {
  const diffMs = endsAt.getTime() - startsAt.getTime();
  if (diffMs < 0) return 0;
  const hours = Math.ceil(diffMs / (1000 * 60 * 60));
  return basePricePaise * hours;
}

describe('Price Calculation', () => {
  it('calculates price based on full hours', () => {
    const start = new Date('2023-01-01T10:00:00Z');
    const end = new Date('2023-01-01T12:00:00Z');
    // 2 hours exactly
    expect(calculatePrice(5000, start, end)).toBe(10000); // 100 INR
  });

  it('rounds up partial hours', () => {
    const start = new Date('2023-01-01T10:00:00Z');
    const end = new Date('2023-01-01T12:15:00Z');
    // 2 hours 15 mins -> 3 hours
    expect(calculatePrice(5000, start, end)).toBe(15000); 
  });

  it('handles zero duration', () => {
    const start = new Date('2023-01-01T10:00:00Z');
    expect(calculatePrice(5000, start, start)).toBe(0);
  });
});
