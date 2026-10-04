import { prisma } from '../../lib/prisma.js';
import { z } from 'zod';
import { createListingSchema, updateListingSchema } from './listings.schema.js';
import { User, UserRole } from '@prisma/client';

export class ListingsService {
  /**
   * Helper to get or create a personal organization for a user.
   */
  private static async getOrCreatePersonalOrg(user: User) {
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

  static async createListing(user: User, data: z.infer<typeof createListingSchema>) {
    const orgId = await this.getOrCreatePersonalOrg(user);

    return prisma.$transaction(async (tx) => {
      const listing = await tx.listing.create({
        data: {
          organizationId: orgId,
          title: data.title,
          description: data.description,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          vehicleType: data.vehicleType,
          slotLabel: data.slotLabel,
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

  static async getUserListings(user: User) {
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

  static async updateListing(user: User, listingId: string, data: z.infer<typeof updateListingSchema>) {
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
      const updated = await tx.listing.update({
        where: { id: listingId },
        data: {
          title: data.title,
          description: data.description,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          status: data.status,
          approvalMode: data.approvalMode,
          vehicleType: data.vehicleType,
          slotLabel: data.slotLabel,
        },
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
}
