import { prisma } from '../../lib/prisma.js';

export class AdminService {
  static async getStats() {
    const [totalUsers, totalListings, totalBookings, revenueData] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count({ where: { status: 'PUBLISHED' } }),
      prisma.booking.count(),
      prisma.booking.aggregate({
        _sum: { amountPaise: true },
        where: { status: 'COMPLETED' },
      }),
    ]);

    return {
      users: totalUsers,
      listings: totalListings,
      bookings: totalBookings,
      revenuePaise: revenueData._sum.amountPaise || 0,
    };
  }

  static async getPendingListings() {
    // Treat DRAFT or UNPUBLISHED as pending for moderation
    return prisma.listing.findMany({
      where: { status: 'DRAFT' },
      include: {
        organization: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateListingStatus(id: string, status: 'PUBLISHED' | 'UNPUBLISHED' | 'DELETED', actorId: string) {
    const listing = await prisma.listing.findUnique({ where: { id }, select: { organizationId: true } });
    if (!listing) throw new Error('Listing not found');
    
    return prisma.$transaction([
      prisma.listing.update({
        where: { id },
        data: { status },
      }),
      prisma.auditEvent.create({
        data: {
          organizationId: listing.organizationId,
          actorId,
          entityType: 'Listing',
          entityId: id,
          action: `STATUS_CHANGED_TO_${status}`,
          metadata: { status }
        }
      })
    ]);
  }

  static async getUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateUserStatus(id: string, status: 'ACTIVE' | 'BANNED' | 'PENDING_VERIFICATION') {
    return prisma.user.update({
      where: { id },
      data: { status }
    });
  }

  static async getAuditLogs() {
    return prisma.auditEvent.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { name: true, email: true } },
      }
    });
  }
}
