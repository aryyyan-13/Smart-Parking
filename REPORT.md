# Smart Parking System - Project Report

## 🚗 Project Overview
The **Smart Parking System** is a modern, full-stack web application designed to alleviate urban parking congestion. It enables users to seamlessly discover, visualize, and reserve parking slots in real-time. By bridging digital booking with physical parking infrastructure, this platform ensures guaranteed parking, reduces traffic caused by drivers searching for spots, and optimizes parking lot utilization.

## 🏗️ Architecture & Technology Stack
The project is built using a **Modular Monolith** architecture, split into a frontend web app and a backend API, communicating via a RESTful interface.

**Frontend:**
- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** TailwindCSS, Vanilla CSS, and modern Glassmorphism UI/UX principles
- **3D Visualization:** `@react-three/fiber` and `@react-three/drei` for interactive parking lot layouts
- **State Management:** Zustand for client-side state

**Backend:**
- **Framework:** Express.js + Node.js with TypeScript
- **Database:** PostgreSQL with **PostGIS** extension for geospatial queries
- **ORM:** Prisma (schema-first migrations and type-safe database access)
- **Validation:** Zod for strict request validation and environment parsing

## ✨ Key Features
1. **Geospatial Search:** Users can find parking lots near their destination using PostGIS-powered radius searches.
2. **Interactive 3D Spot Selection:** A WebGL-powered 3D canvas allows users to visually inspect a multi-level parking garage and select their desired slot in real-time.
3. **Robust Booking Engine:** A transactional booking system that strictly prevents double-booking and overlapping schedules using row-level concurrency control.
4. **Automated Spot Assignment:** A fallback mechanism to automatically assign the next available spot if the user opts out of manual 3D selection.
5. **Simulated Payment Gateway:** A "Cyber Payment" interface mimicking real-world FASTag and credit card processing logic.

## 🚀 Key Learnings & Challenges Overcome
1. **Concurrency and Double-Bookings:** Implementing database transactions to ensure that if two users attempt to book the exact same slot at the exact same millisecond, the system successfully rejects one request, maintaining absolute data integrity.
2. **Integrating 3D in the Browser:** Managing WebGL contexts and React Suspense boundaries to ensure the 3D parking layout loaded instantly without hanging the rest of the Next.js application.
3. **Monorepo Management:** Coordinating shared types and workflows between an Express backend and a Next.js frontend within a single repository structure.

## 🔗 Repository
[Smart Parking GitHub Repository](https://github.com/aryyyan-13/Smart-Parking)
