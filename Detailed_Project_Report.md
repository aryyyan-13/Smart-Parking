# Smart Parking System: Project Report

## 1. Project Overview
Smart Parking is a modern, full-stack web application designed to solve urban parking challenges. It enables users to seamlessly discover, book, and manage parking slots in real-time, leveraging high-fidelity interactive 3D visualizations and map-based search.

## 2. Problem Statement
Urban mobility is severely hindered by inefficient parking discovery, leading to increased traffic congestion and emissions. Existing solutions lack real-time accuracy, modern user interfaces, and unified payment ecosystems, resulting in poor user experience and low adoption.

## 3. Proposed Solution
A unified marketplace for parking spaces where hosts can list their driveways or commercial garages, and drivers can book them instantly. Key highlights include:
- **Spatial Grid Discovery:** A map-centric interface for finding nearby slots based on radius, vehicle type, and price.
- **3D Bay Viewer:** An interactive 3D representation of parking garages, showing live occupancy using WebGL/Three.js.
- **Automated Metering:** Time-based sessions with dynamic pricing and FASTag-style virtual telemetry.

## 4. Technical Architecture
The system follows a modern decoupled monolith architecture:

### 4.1 Frontend (apps/web)
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 with a custom "Stitch CyberHUD" design system (Glassmorphism, Neon accents).
- **State Management:** Zustand (Session and Currency Stores).
- **Maps & 3D:** Google Maps Platform, Three.js (via React Three Fiber).

### 4.2 Backend (apps/api)
- **Framework:** Express.js 5
- **Language:** TypeScript
- **Database ORM:** Prisma ORM.
- **Geospatial Processing:** PostGIS (via Supabase PostgreSQL) for radius and distance calculations.
- **Validation:** Zod schemas.

### 4.3 Infrastructure
- **Database & Auth:** Supabase (PostgreSQL 15).
- **Deployment:** Vercel (Frontend), Render (Backend).

## 5. Key Features Implemented
1. **Interactive Search & Maps:** Implemented Google Maps with custom markers and PostGIS-backed distance queries.
2. **CyberHUD UI/UX:** Built a tactical, dark-mode-first interface using deep void black (`#0E0E12`) and neon cyan (`#00FBFB`).
3. **Guest & Authenticated Booking Flow:** Supported end-to-end slot reservations, handling time overlaps and vehicle metadata.
4. **Offline Resilience Layer:** Engineered an in-memory DB fallback for the API to ensure the booking flow remains functional during database outages.
5. **Interactive 3D Visualization:** Real-time 3D rendering of multi-level parking structures.

## 6. Challenges and Learnings
- **Challenge:** Maintaining 60fps in the 3D viewer on mobile devices.
  **Solution:** Optimized geometries and disabled heavy dynamic shadows in favor of baked textures.
- **Challenge:** Handling database connection pool limits.
  **Solution:** Migrated to Supabase Transaction Pooler (PgBouncer) for scalable serverless database access.
- **Challenge:** Integrating a custom, high-fidelity UI design spec strictly within Tailwind constraints.
  **Solution:** Rewrote `globals.css` using modern CSS variables and `@theme` directives to create custom utility classes (`bg-spatial-grid`, `bay-breathe`).

## 7. Future Enhancements
- Hardware IoT integration for barrier control.
- Dynamic pricing algorithms based on live occupancy density.
- Computer Vision (ANPR) integration for automated entry/exit.

## 8. Conclusion
The Smart Parking system successfully demonstrates a scalable, modern approach to urban mobility infrastructure. By combining geospatial search, 3D visualization, and a robust backend, it provides a seamless experience for both parking hosts and drivers.
