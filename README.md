# 🅿️ SmartPark — Spatial 3D Parking & EV Charging Mesh

> **SmartPark** is a next-generation, location-based spatial parking and EV charging platform. Features real-time 3D garage floor visualizers, live in-app pay-as-you-park meters, ESP32 computer vision ANPR plate verification, and interactive occupancy heatmaps across Tier-1 cities.

---

## ✨ Key Features

- **🌐 Spatial 3D Garage Viewer**: Interactive Three.js/React Three Fiber 3D garage with multi-level floor selection and camera animations.
- **🗺️ Real-Time Street & Lot Heatmap**: Multi-city map search with density heatmaps, safety ratings, and dynamic multi-currency pricing (`INR`, `USD`, `EUR`, `GBP`, `AED`).
- **⚡ 150 kW EV Fast-Charging Matrix**: Reserve AC Fast (50 kW) or DC Ultra-Fast (150 kW) charging bays alongside parking reservations.
- **⏱️ Live Pay-As-You-Park Meter (`/meter`)**: Radial SVG progress dial with live minute-by-minute cost accumulation and automated 15-minute expiry warning alerts.
- **🛡️ Admin Global Command & AI Vision (`/admin`)**: Moderate space listings, arbitrate disputes/refunds, and inspect ESP32-CAM live computer vision detection streams with ANPR OCR plate recognition.
- **🎛️ Modular HUD Command Deck (`/deck`)**: Live IoT sensor sandbox, holographic QR gate passes, host verification desk, and analytics.
- **🏢 Host Operations Studio (`/owner/dashboard`)**: Track live occupancies, weekly revenue yield SVG charts, and incoming driver check-ins.
- **🎨 Chrome Glass Design System**: Deep slate void base (`#050508`), silver/chrome metallic highlights (`#A0A0B0`), electric ice-blue glow (`#67E8F9`), and Satoshi typography.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Chrome Glass Spatial Design Tokens
- **Typography**: [Satoshi](https://www.fontshare.com/fonts/satoshi) + [JetBrains Mono](https://www.jetbrains.com/lp/mono/)
- **3D & Canvas**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://r3f.docs.pmnd.rs/) + [@react-three/drei](https://github.com/pmndrs/drei)
- **Animations**: [Framer Motion v12](https://www.framer.com/motion/) (Magnetic springs, 3D perspective tilts, 3D flip cards, and scroll reveals)
- **Maps**: [Leaflet](https://leafletjs.com/) + [React Google Maps](https://visgl.github.io/react-google-maps/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Multi-currency store & IoT sensor simulation)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+
- npm 10+

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/aryyyan-13/Smart-Parking.git
cd Smart-Parking

# Install dependencies
npm install
```

### 3. Environment Setup (Optional)
```bash
cp apps/web/.env.example apps/web/.env.local
```

### 4. Run Locally
```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) in your browser to experience the 3D landing page.

---

## 📁 Repository Structure

```text
smart-parking/
├── apps/
│   └── web/                    # Next.js 16 Web Application
│       ├── app/                # App Router routes (11 routes)
│       │   ├── page.tsx        # 3D Spatial Landing Page
│       │   ├── search/         # Live Heatmap & Bay Discovery
│       │   ├── parking/[id]/   # 3D Garage Viewer & Booking
│       │   ├── meter/          # Pay-As-You-Park Live Meter
│       │   ├── deck/           # HUD Command Deck & IoT Sandbox
│       │   ├── admin/          # Admin Portal & AI Vision
│       │   ├── owner/dashboard/# Host Operations Studio
│       │   ├── bookings/       # Active Pass History
│       │   └── booking/confirmation/ # Holographic Entry Pass
│       ├── components/         # 3D, Map, UI & Layout components
│       └── lib/                # Multi-currency & simulation stores
├── docs/                       # Architecture & API specifications
└── package.json                # Monorepo workspace configuration
```

---

## 📄 License
MIT © 2026 SmartPark Platform.
