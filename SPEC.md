# Product Specification — Smart Parking

## Users and permissions

| Role | Primary permissions |
| --- | --- |
| Driver | Manage profile and vehicles; search slots; make, view, and cancel eligible bookings. |
| Owner | Manage own listings, availability, prices, booking approvals, and earnings view. |
| Admin | Manage users/listings, view platform metrics and reports. |

## Functional requirements

### Driver experience

1. A driver can register, sign in, and sign out securely.
2. A driver can store one or more vehicles, including vehicle type: two-wheeler or four-wheeler.
3. A driver can search by location/address and view matching slots in a map-first interface, with a list fallback.
4. Search results show address/location, supported vehicle type, estimated distance, availability, price, pricing unit (hourly/daily/monthly), and relevant listing details/photos.
5. A driver can select a start/end time and receive only slots available for that entire interval.
6. A driver can request or confirm a booking depending on the listing approval setting.
7. A driver receives booking status/confirmation notifications in-app; email/SMS is a later integration.
8. A driver can view current and past booking history.

### Owner experience

1. An owner can create, edit, publish, unpublish, and delete their own listings.
2. A listing records address, geolocation, photos, vehicle capacity/type, description, pricing, and pricing unit.
3. An owner can define a recurring availability schedule and block exceptional unavailable dates/time windows.
4. An owner can choose automatic approval or manual approval for booking requests.
5. An owner can view booking activity and a calculated earnings summary for their listings.

### Admin experience

1. An admin can view and moderate users and listings.
2. An admin can view booking, occupancy, and revenue summaries, with date/location filters where data is available.
3. Admin reporting must distinguish platform-calculated amounts from actual payment settlement until payments are implemented.

## Business rules

- A booking must have an end time after its start time and must match the listed vehicle type.
- A confirmed or pending booking may not overlap another non-cancelled booking for the same slot/time interval.
- Blocked periods always make a slot unavailable.
- Manual-approval bookings reserve the interval while pending to prevent double booking; expiry duration is configurable.
- Prices are shown with currency and pricing unit. The default currency and cancellation/refund policy are product decisions still required before payment work.
- Only the listing owner and admins may modify a listing. Only the booking driver, owner, or admin may view its details.

## Non-functional requirements

- Typical search and booking views should load in under 3 seconds on a reasonable mobile connection, excluding third-party map-provider outages.
- Use authenticated, role-based access control; hash passwords; validate and sanitize inputs; rate-limit authentication endpoints; keep secrets outside source control.
- Make the core experience responsive, accessible by keyboard, and clear on mobile.
- Design locations and queries to support multi-city expansion.
- Record auditable timestamps for key state changes (listing publication, booking status changes, admin actions).

## Acceptance criteria for Phase 1

- A driver can find a compatible available slot, reserve a valid time window, receive a confirmed status for an auto-approve listing, and see it in history.
- An owner can publish a listing with photos, set hours/pricing, block a date, and see the blocked interval excluded from driver search.
- A manual-approval request changes state only when the owner approves or declines it; conflicting requests cannot both confirm.
- Users cannot access or edit other users' private data or listings.
- Admin reporting returns consistent totals derived from persisted booking data.

## Out of scope for Phase 1

- Live IoT sensor occupancy detection
- Automated gate/barrier control
- Real payment processing, refunds, and payouts
- Dynamic demand-based pricing

## Open product decisions

Before release, decide the launch geography/currency, payment provider and settlement model, cancellation rules, owner identity/listing verification, notification channel, and whether a listing represents one bookable slot or a capacity of multiple slots.
