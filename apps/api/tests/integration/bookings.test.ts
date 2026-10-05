import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';
import { supabaseAdmin } from '../../src/lib/supabase.js';

vi.mock('../../src/lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  }
}));

vi.mock('../../src/lib/supabase.js', () => ({
  supabaseAdmin: {
    auth: {
      getUser: vi.fn(),
    }
  }
}));

const app = createApp();

describe('Bookings API Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('allows unauthenticated requests to create booking (demo mode)', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: 'demo-user-id',
      authId: 'demo-auth-id',
    } as any);

    vi.mocked(prisma.$transaction).mockResolvedValue({ id: 'booking-id' });

    const res = await request(app)
      .post('/api/v1/bookings')
      .send({
        listingId: '2b4c7304-44b4-4b47-b84e-33636737526d', // Valid UUID
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 3600000).toISOString(),
        amountPaise: 5000,
        currency: 'INR'
      });
    expect(res.status).toBe(201);
  });

  it('handles overlapping bookings correctly in the transaction', async () => {
    // Mock valid auth
    vi.mocked(supabaseAdmin.auth.getUser).mockResolvedValue({
      data: { user: { id: 'auth-user-id' } },
      error: null
    } as any);

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'db-user-id',
      authId: 'auth-user-id',
      status: 'ACTIVE',
      memberships: [],
      email: 'test@example.com',
      name: 'Test'
    } as any);

    vi.mocked(prisma.user.findFirst).mockResolvedValue({
      id: 'demo-user-id',
      authId: 'demo-auth-id',
    } as any);

    // Mock transaction to simulate an overlap error thrown by the service
    vi.mocked(prisma.$transaction).mockRejectedValue(new Error('Time slot overlaps with an existing booking'));

    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', 'Bearer valid-token')
      .send({
        listingId: '2b4c7304-44b4-4b47-b84e-33636737526d',
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 3600000).toISOString(),
        amountPaise: 5000,
        currency: 'INR'
      });

    expect(res.status).toBe(409); // Controller returns 409 on overlap
    // If it's a 500 or 400, we should expect the appropriate error.
    // Based on typical express error handling, if service throws Error, it might be 400 or 500 depending on controller implementation.
  });
});
