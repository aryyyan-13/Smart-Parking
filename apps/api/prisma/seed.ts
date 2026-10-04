import { PrismaClient, UserRole, VehicleType, ListingStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // --- Organization 1: Green Spaces ---
  const org1 = await prisma.organization.create({
    data: {
      name: 'Green Spaces Parking',
      slug: 'green-spaces',
    },
  });

  const org1AdminAuth = randomUUID();
  const org1Admin = await prisma.user.create({
    data: {
      authId: org1AdminAuth,
      email: 'admin@greenspaces.com',
      name: 'Green Admin',
      status: 'ACTIVE',
      memberships: {
        create: {
          organizationId: org1.id,
          role: UserRole.ADMIN,
        },
      },
    },
  });

  const org1OwnerAuth = randomUUID();
  const org1Owner = await prisma.user.create({
    data: {
      authId: org1OwnerAuth,
      email: 'owner@greenspaces.com',
      name: 'Green Owner',
      status: 'ACTIVE',
      memberships: {
        create: {
          organizationId: org1.id,
          role: UserRole.OWNER,
        },
      },
    },
  });

  const org1ViewerAuth = randomUUID();
  const org1Viewer = await prisma.user.create({
    data: {
      authId: org1ViewerAuth,
      email: 'viewer@greenspaces.com',
      name: 'Green Viewer',
      status: 'ACTIVE',
      memberships: {
        create: {
          organizationId: org1.id,
          role: UserRole.VIEWER,
        },
      },
    },
  });

  // Green Spaces Listing
  const org1Listing = await prisma.listing.create({
    data: {
      organizationId: org1.id,
      title: 'Premium Covered Parking - Green Spaces',
      address: '123 Park Ave, Mumbai',
      latitude: 19.0760,
      longitude: 72.8777,
      status: ListingStatus.PUBLISHED,
      vehicleType: VehicleType.FOUR_WHEELER,
      slotLabel: 'A1',
      priceRules: {
        create: {
          organizationId: org1.id,
          unit: 'HOUR',
          amount: 5000, // ₹50.00
        },
      },
    },
  });

  // Green Spaces Vehicle
  const org1Vehicle = await prisma.vehicle.create({
    data: {
      organizationId: org1.id,
      userId: org1Owner.id,
      type: VehicleType.FOUR_WHEELER,
      licensePlate: 'MH01AB1234',
    },
  });

  // Green Spaces Booking
  await prisma.booking.create({
    data: {
      organizationId: org1.id,
      listingId: org1Listing.id,
      driverId: org1Owner.id,
      vehicleId: org1Vehicle.id,
      startsAt: new Date(Date.now() + 86400000), // Tomorrow
      endsAt: new Date(Date.now() + 90000000),
      amountPaise: 5000,
      status: 'CONFIRMED',
    },
  });

  // --- Organization 2: Metro Park ---
  const org2 = await prisma.organization.create({
    data: {
      name: 'Metro Park Solutions',
      slug: 'metro-park',
    },
  });

  const org2AdminAuth = randomUUID();
  const org2Admin = await prisma.user.create({
    data: {
      authId: org2AdminAuth,
      email: 'admin@metropark.com',
      name: 'Metro Admin',
      status: 'ACTIVE',
      memberships: {
        create: {
          organizationId: org2.id,
          role: UserRole.ADMIN,
        },
      },
    },
  });

  const org2OwnerAuth = randomUUID();
  const org2Owner = await prisma.user.create({
    data: {
      authId: org2OwnerAuth,
      email: 'owner@metropark.com',
      name: 'Metro Owner',
      status: 'ACTIVE',
      memberships: {
        create: {
          organizationId: org2.id,
          role: UserRole.OWNER,
        },
      },
    },
  });

  const org2ViewerAuth = randomUUID();
  const org2Viewer = await prisma.user.create({
    data: {
      authId: org2ViewerAuth,
      email: 'viewer@metropark.com',
      name: 'Metro Viewer',
      status: 'ACTIVE',
      memberships: {
        create: {
          organizationId: org2.id,
          role: UserRole.VIEWER,
        },
      },
    },
  });

  // Metro Park Listing
  const org2Listing = await prisma.listing.create({
    data: {
      organizationId: org2.id,
      title: 'Open Lot - Metro Park',
      address: '456 Tech Blvd, Bangalore',
      latitude: 12.9716,
      longitude: 77.5946,
      status: ListingStatus.PUBLISHED,
      vehicleType: VehicleType.TWO_WHEELER,
      slotLabel: 'B1',
      priceRules: {
        create: {
          organizationId: org2.id,
          unit: 'HOUR',
          amount: 2000, // ₹20.00
        },
      },
    },
  });

  // Metro Park Vehicle
  const org2Vehicle = await prisma.vehicle.create({
    data: {
      organizationId: org2.id,
      userId: org2Owner.id,
      type: VehicleType.TWO_WHEELER,
      licensePlate: 'KA01XY9876',
    },
  });

  // Metro Park Booking
  await prisma.booking.create({
    data: {
      organizationId: org2.id,
      listingId: org2Listing.id,
      driverId: org2Owner.id,
      vehicleId: org2Vehicle.id,
      startsAt: new Date(Date.now() + 86400000), // Tomorrow
      endsAt: new Date(Date.now() + 90000000),
      amountPaise: 2000,
      status: 'CONFIRMED',
    },
  });

  console.log('Database seeded successfully: 2 Organizations, 6 Users, 2 Listings.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
