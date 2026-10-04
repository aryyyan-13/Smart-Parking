import { prisma } from '../../lib/prisma.js';
import { z } from 'zod';
import { createListingSchema, updateListingSchema } from './listings.schema.js';
import { User, UserRole } from '@prisma/client';

export class ListingsService {
  /**
   * Helper to get or create a personal organization for a user.
   */
  private static async getOrCreatePersonalOrg(user: { id: string, name: string | null, email: string }) {
    const membership = await prisma.organizationMember.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    });

    if (membership) {
      return membership.organizationId;
    }

    const org = await prisma.organization.create({
      data: {
        name: `${user.name || 'User'}'s Parking`,
        slug: `org-${user.id.substring(0, 8)}`,
        members: {
          create: {
            userId: user.id,
            role: 'OWNER',
          },
        },
      },
    });

    return org.id;
  }

  static async createListing(user: { id: string, name: string | null, email: string }, data: z.infer<typeof createListingSchema>) {
    const orgId = await this.getOrCreatePersonalOrg(user);

    return prisma.$transaction(async (tx) => {
      const listing = await tx.listing.create({
        data: {
          organizationId: orgId,
          title: data.title,
          description: data.description ?? null,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          vehicleType: data.vehicleType,
          slotLabel: data.slotLabel ?? null,
        },
      });

      if (data.pricePerHour) {
        await tx.priceRule.create({
          data: {
            organizationId: orgId,
            listingId: listing.id,
            unit: 'HOUR',
            amount: data.pricePerHour,
          },
        });
      }

      return listing;
    });
  }

  static async getUserListings(user: { id: string }) {
    const memberships = await prisma.organizationMember.findMany({
      where: { userId: user.id },
      select: { organizationId: true },
    });
    
    if (memberships.length === 0) return [];

    return prisma.listing.findMany({
      where: {
        organizationId: { in: memberships.map((m) => m.organizationId) },
        deletedAt: null,
      },
      include: {
        priceRules: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateListing(user: { id: string }, listingId: string, data: z.infer<typeof updateListingSchema>) {
    // Verify ownership
    const memberships = await prisma.organizationMember.findMany({
      where: { userId: user.id, role: { in: ['OWNER', 'ADMIN'] } },
      select: { organizationId: true },
    });

    const listing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        organizationId: { in: memberships.map((m) => m.organizationId) },
        deletedAt: null,
      },
    });

    if (!listing) {
      throw new Error('Listing not found or unauthorized');
    }

    return prisma.$transaction(async (tx) => {
      const updateData: any = {
        title: data.title,
        description: data.description ?? (data.description === undefined ? undefined : null),
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        status: data.status,
        approvalMode: data.approvalMode,
        vehicleType: data.vehicleType,
        slotLabel: data.slotLabel ?? (data.slotLabel === undefined ? undefined : null),
      };

      // Clean up undefined properties so Prisma doesn't complain about exactOptionalPropertyTypes
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      const updated = await tx.listing.update({
        where: { id: listingId },
        data: updateData,
      });

      if (data.pricePerHour !== undefined) {
        // Upsert hourly price rule
        const existingRule = await tx.priceRule.findFirst({
          where: { listingId, unit: 'HOUR' }
        });
        
        if (existingRule) {
          await tx.priceRule.update({
            where: { id: existingRule.id },
            data: { amount: data.pricePerHour },
          });
        } else {
          await tx.priceRule.create({
            data: {
              organizationId: listing.organizationId,
              listingId,
              unit: 'HOUR',
              amount: data.pricePerHour,
            },
          });
        }
      }

      return updated;
    });
  }

  static async getDashboardStats(user: { id: string }) {
    const memberships = await prisma.organizationMember.findMany({
      where: { userId: user.id },
      select: { organizationId: true },
    });
    
    if (memberships.length === 0) {
      return {
        stats: {
          totalRevenue: 0,
          activeBookings: 0,
          occupancyRate: '0%',
          listedSpaces: 0,
        },
        recentBookings: [],
        weeklyData: Array(7).fill(0).map((_, i) => ({ day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][(new Date().getDay() - 6 + i + 7) % 7], amount: 0 }))
      };
    }

    const orgIds = memberships.map((m) => m.organizationId);

    // Get basic stats
    const listedSpaces = await prisma.listing.count({
      where: { organizationId: { in: orgIds }, deletedAt: null }
    });

    // Get bookings
    const bookings = await prisma.booking.findMany({
      where: { organizationId: { in: orgIds } },
      include: { driver: true, listing: true },
      orderBy: { createdAt: 'desc' }
    });

    let totalRevenue = 0;
    let activeBookings = 0;
    const recent = [];

    for (const b of bookings) {
      if (b.status === 'COMPLETED' || b.status === 'CONFIRMED') {
        totalRevenue += b.amountPaise;
      }
      if (b.status === 'CONFIRMED' || b.status === 'PENDING') {
        activeBookings++;
      }
      
      // Limit recent to 10
      if (recent.length < 10) {
        recent.push({
          id: b.id,
          driver: b.driver?.name || 'Unknown',
          slot: b.listing.slotLabel || b.listing.title,
          time: b.startsAt,
          status: b.status,
          amountPaise: b.amountPaise,
        });
      }
    }

    // Mock weekly data for now since we don't have historical aggregation set up
    const weeklyData = Array(7).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
      
      // Calculate revenue just for this day from bookings
      const dayStart = new Date(d.setHours(0,0,0,0));
      const dayEnd = new Date(d.setHours(23,59,59,999));
      
      const dayRevenue = bookings
        .filter(b => b.createdAt >= dayStart && b.createdAt <= dayEnd && (b.status === 'COMPLETED' || b.status === 'CONFIRMED'))
        .reduce((sum, b) => sum + b.amountPaise, 0);

      return {
        day: dayName,
        amount: dayRevenue, // in paise
      };
    });

    return {
      stats: {
        totalRevenue,
        activeBookings,
        occupancyRate: listedSpaces > 0 && activeBookings > 0 ? Math.round((activeBookings / (listedSpaces * 3)) * 100) + '%' : '0%', // Mock calc
        listedSpaces,
      },
      recentBookings: recent,
      weeklyData,
    };
  }
}
