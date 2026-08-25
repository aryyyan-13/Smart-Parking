# Delivery Plan

## 1. Foundation

- [ ] Initialize the monorepo structure from `README.md`.
- [ ] Configure TypeScript, linting, formatting, tests, environment validation, and CI.
- [ ] Provision PostgreSQL and migrations; implement the core domain schema from `ARCHITECTURE.md`.
- [ ] Implement authentication, role-based authorization, and seed accounts for Driver, Owner, and Admin.

**Done when:** a fresh environment starts from documented commands; migration and seed data work; protected endpoints reject unauthenticated/wrong-role requests.

## 2. Owner listing management

- [ ] Implement listing CRUD with address/geocoding, coordinates, photos, vehicle type, price rules, and publication status.
- [ ] Implement recurring availability and date/time blocks.
- [ ] Create owner dashboard views for listings and earnings summary.

**Done when:** an owner can publish a listing and a blocked interval is unavailable through the API and UI.

## 3. Driver discovery

- [ ] Build map-first search with address/location input, result markers, list fallback, and filters.
- [ ] Show listing details, photos, price/unit, vehicle compatibility, and real availability for a selected time window.
- [ ] Add vehicle management and driver booking history screens.

**Done when:** a driver can locate a compatible available listing on desktop and mobile and see why unavailable listings are excluded.

## 4. Booking workflow

- [ ] Implement overlap-safe availability and transactional booking creation.
- [ ] Support auto-approval and manual pending/approve/decline paths.
- [ ] Implement cancellation rules as a configurable first version; add in-app confirmations/status notifications.

**Done when:** concurrent attempts cannot create conflicting active bookings, and each role sees the correct booking state.

## 5. Administration and reporting

- [ ] Build admin user/listing moderation.
- [ ] Build reports for bookings, occupancy proxy, and calculated revenue with date/location filters.
- [ ] Add audit events for moderation and important booking state changes.

**Done when:** admin totals agree with persisted booking records and non-admin users cannot access admin data.

## 6. Quality and release

- [ ] Add unit tests for price, availability, and booking-state rules; API integration tests for authorization and conflict prevention.
- [ ] Test responsive layouts, keyboard navigation, validation, error states, and core flows on mobile/desktop.
- [ ] Load-test representative search/booking routes and address regressions against the under-3-second target.
- [ ] Document deployment, monitoring, backups, and environment variables. Deploy a staging environment.

## Deferred backlog

- [ ] Payments, refunds, owner payouts, and tax/invoice handling.
- [ ] Owner/listing verification and fraud controls.
- [ ] Email/SMS/push channels.
- [ ] IoT occupancy feeds and automated barriers.
- [ ] Dynamic pricing and demand analytics.
