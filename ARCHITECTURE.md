# Architecture

## System shape

```text
Next.js web app  ->  Express REST API  ->  PostgreSQL
       |                    |
       +-> Map/geocoding    +-> Image object storage
```

The web app owns responsive presentation and client interaction. The API owns authorization, availability calculation, booking state changes, and reporting. PostgreSQL is the source of truth for all operational data.

## Core domain model

| Entity | Important fields / relationships |
| --- | --- |
| User | id, role, name, email, password hash, status; has vehicles, listings, or bookings. |
| Vehicle | id, driverId, type (TWO_WHEELER/FOUR_WHEELER), identifier, optional label. |
| Listing | id, ownerId, title, address, latitude, longitude, status, approval mode, description. |
| ParkingSlot | id, listingId, vehicle type, status. Start with one slot per listing; retain this entity for future multi-slot capacity. |
| ListingPhoto | id, listingId, storage key, ordering. |
| PriceRule | id, listingId, unit (HOUR/DAY/MONTH), amount, currency, effective range. |
| AvailabilityRule | id, listingId, weekday, start/end local time. |
| AvailabilityBlock | id, listingId, start/end timestamp, reason. |
| Booking | id, slotId, driverId, vehicleId, start/end timestamp, amount snapshot, status. |
| Notification | id, userId, type, payload, read timestamp. |
| AuditEvent | actorId, entity type/id, action, timestamp, metadata. |

## Booking lifecycle

```text
requested -> pending -> confirmed -> completed
                |            |
                v            v
             declined     cancelled

Auto-approve listings: requested -> confirmed
```

Availability is calculated from the slot's configured schedule, explicit blocks, matching vehicle type, and non-cancelled booking intervals. Create the booking inside a database transaction and enforce an overlap-safe constraint/query so concurrent requests cannot double-book.

## API modules

- `auth`: registration, login, session/token refresh, password reset later.
- `users` and `vehicles`: profile and driver vehicle management.
- `listings`: owner CRUD, photos, publishing, pricing, schedules, and blocks.
- `search`: geospatial/location search, filters, and availability checks.
- `bookings`: create, approve/decline, cancel, history, and notifications.
- `admin`: moderation, metrics, and reports.

Version APIs under `/api/v1`. Define request/response schemas in `packages/shared` and validate both at the boundary and in the service layer.

## Data and security choices

- Store timestamps in UTC and retain each listing's IANA timezone for display and recurring schedules.
- Use PostGIS if available for nearby-location queries; otherwise start with latitude/longitude plus a bounding-box/Haversine query and migrate when needed.
- Store images in object storage; persist only their keys and generated delivery URLs.
- Use short-lived access tokens or secure server sessions, with refresh/session revocation support. Never expose map, storage, database, or auth secrets to the browser.
- Apply role checks in API middleware and ownership checks in every resource service.

## Future integration seams

Introduce an `OccupancyProvider` interface for optional IoT feeds and a `PaymentProvider` interface for checkout/payouts. Their absence must not change Phase 1 booking correctness.
