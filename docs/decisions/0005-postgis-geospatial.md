# ADR 0005 — PostGIS for Geospatial Search

## Status
Accepted

## Context
The core driver experience requires searching for parking slots near a given location (address or map pin). This requires computing distances between a search origin and each listing's stored coordinates, and filtering to a radius.

Supabase Postgres ships with PostGIS pre-installed and enabled by default.

## Decision
Use **PostGIS** with a `GEOGRAPHY(POINT)` column on the `listings` table. Radius searches use `ST_DWithin` with a `GIST` spatial index for sub-millisecond filtering.

```sql
-- Column type
location  GEOGRAPHY(POINT, 4326)

-- Index
CREATE INDEX listings_location_gist ON listings USING GIST(location);

-- Query pattern
SELECT * FROM listings
WHERE ST_DWithin(location, ST_MakePoint($lon, $lat)::geography, $radius_metres)
  AND owner_id = auth.uid()  -- RLS
ORDER BY ST_Distance(location, ST_MakePoint($lon, $lat)::geography);
```

## Alternatives Considered

### Haversine formula in SQL (no PostGIS)
- Compute distance using trigonometry inside a `WHERE` clause
- **Rejected**: Requires a full table scan — every row is evaluated regardless of distance. Acceptable at 100 listings, unacceptable at 10,000. PostGIS's spatial index prunes the search space geometrically before any distance computation.

### Application-level bounding box + Haversine
- Fetch all listings within a lat/lon bounding box (simple `BETWEEN` query), then filter in Node.js
- **Rejected**: Still requires scanning all listings in the bounding box. More code to maintain in application logic. No upgrade path to full spatial queries without a schema change.

### External geospatial service (Algolia GeoSearch, Elasticsearch)
- Dedicated search/geospatial engine
- **Rejected**: Adds a fourth vendor, index synchronisation logic, and significant cost ($50–100/mo at scale). PostGIS on our existing DB is functionally equivalent for our access patterns.

## Consequences
- ✅ Spatial index means search stays fast as listing count grows
- ✅ PostGIS already enabled on Supabase — no extension installation required
- ✅ `ST_Distance` gives exact geodesic distance (metres) for accurate "X km away" display
- ✅ Supports future queries (polygon search, viewport-based search) with no schema changes
- ⚠️ PostGIS geometry types are not natively supported by Prisma — spatial queries must be written as `$queryRaw`
- ⚠️ Raw queries bypass RLS — every raw spatial query must include an explicit ownership/visibility filter
- ⚠️ Coordinates must be stored in WGS 84 (EPSG:4326) — validate on input (lat: -90..90, lon: -180..180)
