# ADR 0006 — Google Maps Platform for Maps and Geocoding

## Status
Accepted

## Context
The system requires:
1. An interactive map to display listing markers and let drivers explore parking slots visually
2. Address → coordinates geocoding (when an owner creates a listing)
3. Address autocomplete (for driver location search input)

The existing frontend codebase already has both `@vis.gl/react-google-maps` and `react-leaflet` installed, indicating the map choice was previously uncommitted.

## Decision
Standardise on **Google Maps Platform**:
- **Maps JavaScript API** (via `@vis.gl/react-google-maps`) for the browser map
- **Geocoding API** (server-side, Express) for address → lat/lon on listing creation
- **Places Autocomplete API** (browser) for driver search input

Remove `leaflet` and `react-leaflet` from the frontend dependencies to eliminate ambiguity.

Two API keys are required:
- `NEXT_PUBLIC_GOOGLE_MAPS_KEY` — browser key, restricted to Maps JS + Places APIs and the exact Vercel domain(s)
- `GOOGLE_GEOCODING_KEY` — server key, restricted to Geocoding API only, never sent to the browser

## Alternatives Considered

### Mapbox
- Superior visual customisation, competitive pricing
- **Rejected**: Mapbox's geocoding and address autocomplete for Indian addresses is significantly less accurate than Google's. For a parking app targeting India, address quality is critical to correct listing placement.

### Leaflet + OpenStreetMap + Nominatim
- Zero cost, open source, already partially installed
- **Rejected**: Nominatim (OpenStreetMap geocoder) has strict rate limits (1 req/sec, no commercial use without self-hosting) and lower address quality for India. OSM tile quality for Indian localities is inconsistent.

### Leaflet + OpenStreetMap + Google Geocoding API (hybrid)
- Free tiles, paid geocoding
- **Rejected**: This hybrid requires maintaining two map libraries simultaneously (Leaflet for render, Google for geocoding) with no shared coordinate/viewport abstraction. More code, more bugs.

## Consequences
- ✅ Best geocoding quality for Indian addresses
- ✅ `@vis.gl/react-google-maps` already in the codebase — no new frontend dependency
- ✅ Single vendor for all map-related concerns (simpler billing, single API console)
- ⚠️ Pay-as-you-go billing — a traffic spike can generate unexpected costs
  - **Mitigation**: Set daily quota caps in Google Cloud Console from day one
- ⚠️ Browser API key must be restricted to specific referrer domains — document in runbook
- ⚠️ `leaflet` and `react-leaflet` must be removed from `package.json` to avoid bundle bloat and confusion
