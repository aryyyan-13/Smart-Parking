"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Map, Cpu, QrCode, Shield, BarChart3, ArrowLeft,
  Wifi, Zap, ChevronRight
} from "lucide-react";
import dynamic from "next/dynamic";

const IoTSandboxWidget = dynamic(() => import("@web/components/deck/IoTSandboxWidget"), {
  ssr: false,
  loading: () => <WidgetSkeleton label="Loading IoT Sandbox…" />,
});
const HolographicPassWidget = dynamic(() => import("@web/components/deck/HolographicPassWidget"), {
  ssr: false,
  loading: () => <WidgetSkeleton label="Loading Gate Pass…" />,
});
const HostVerificationWidget = dynamic(() => import("@web/components/deck/HostVerificationWidget"), {
  ssr: false,
  loading: () => <WidgetSkeleton label="Loading Verification Desk…" />,
});
const AnalyticsWidget = dynamic(() => import("@web/components/deck/AnalyticsWidget"), {
  ssr: false,
  loading: () => <WidgetSkeleton label="Loading Analytics…" />,
});

function WidgetSkeleton({ label }: { label: string }) {
  return (
    <div className="flex-1 h-full min-h-[400px] flex items-center justify-center text-muted text-sm font-mono animate-pulse">
      {label}
    </div>
  );
}

type WidgetId = "search" | "iot" | "pass" | "host" | "analytics";

const WIDGETS: { id: WidgetId; icon: React.ReactNode; label: string; badge?: string }[] = [
  { id: "iot", icon: <Cpu className="w-4 h-4" />, label: "IoT Sandbox", badge: "LIVE" },
  { id: "pass", icon: <QrCode className="w-4 h-4" />, label: "Holographic Pass" },
  { id: "host", icon: <Shield className="w-4 h-4" />, label: "Host Verification" },
  { id: "analytics", icon: <BarChart3 className="w-4 h-4" />, label: "Spatial Analytics" },
  { id: "search", icon: <Map className="w-4 h-4" />, label: "Quick Finder" },
];

function SearchWidget() {
  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto">
      <div className="glass-elevated p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <p className="font-heading font-bold text-base text-white">Spatial Bay Finder</p>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30">
            12 TIER-1 CITIES
          </span>
        </div>
        <div className="grid sm:grid-cols-3 gap-3.5">
          <div className="space-y-1">
            <label className="hud-label text-[10px]">Target City</label>
            <select className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/12 text-sm text-white focus:border-accent-cyan focus:outline-none cursor-pointer">
              {["Bengaluru", "Mumbai", "Delhi NCR", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad"].map(c => (
                <option key={c} className="bg-bg-deep text-white">{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="hud-label text-[10px]">Vehicle Category</label>
            <select className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/12 text-sm text-white focus:border-accent-cyan focus:outline-none cursor-pointer">
              <option className="bg-bg-deep text-white">4-Wheeler (Car / SUV)</option>
              <option className="bg-bg-deep text-white">2-Wheeler (Motorcycle)</option>
              <option className="bg-bg-deep text-white">Accessible / Handicap</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="hud-label text-[10px]">EV Charging Power</label>
            <select className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/12 text-sm text-white focus:border-accent-cyan focus:outline-none cursor-pointer">
              <option className="bg-bg-deep text-white">Any Standard / EV</option>
              <option className="bg-bg-deep text-white">50 kW Fast AC</option>
              <option className="bg-bg-deep text-white">150 kW Ultra-Fast DC</option>
            </select>
          </div>
        </div>
        <Link href="/search">
          <button className="w-full py-3 rounded-xl bg-accent-cyan/15 border border-accent-cyan/40 text-accent-cyan text-sm font-semibold hover:bg-accent-cyan/25 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(103,232,249,0.2)]">
            <Map className="w-4 h-4" />
            Launch Full 3D Map Explorer
            <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </div>

      <div className="glass p-5 space-y-3">
        <p className="hud-label text-[10px]">Nearby High-Density Hubs</p>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {[
            { name: "MG Road Metro Multi-Level", dist: "0.3 km", price: "₹40/hr", ev: true, available: 28 },
            { name: "BKC Financial Center Smart Hub", dist: "0.8 km", price: "₹70/hr", ev: true, available: 45 },
            { name: "Indiranagar 100ft Road Smart Lot", dist: "1.2 km", price: "₹50/hr", ev: true, available: 18 },
            { name: "Connaught Place Inner Circle", dist: "0.5 km", price: "₹50/hr", ev: true, available: 32 },
          ].map((spot, i) => (
            <Link key={i} href="/parking/1">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-accent-cyan/40 transition-all cursor-pointer group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate group-hover:text-accent-cyan transition-colors">{spot.name}</p>
                  <p className="text-xs text-muted font-mono">{spot.dist} · {spot.price}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {spot.ev && <Zap className="w-3.5 h-3.5 text-emerald-400" />}
                  <span className="text-xs font-mono text-emerald-400 font-bold">{spot.available} free</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function HUDCommandDeckPage() {
  const [activeWidget, setActiveWidget] = useState<WidgetId>("iot");

  return (
    <div className="min-h-screen bg-bg-void flex flex-col">
      {/* Top HUD Header */}
      <header className="bg-bg-deep/80 backdrop-blur-2xl border-b border-white/10 shrink-0 z-40">
        <div className="flex items-center gap-4 px-4 sm:px-6 h-16 max-w-7xl mx-auto w-full">
          <Link
            href="/"
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-cyan/20 border border-accent-cyan/40 flex items-center justify-center shadow-[0_0_15px_rgba(103,232,249,0.3)]">
              <Cpu className="w-4 h-4 text-accent-cyan" />
            </div>
            <div>
              <span className="font-heading text-sm font-bold text-white flex items-center gap-1.5">
                SmartPark <span className="text-accent-cyan font-mono">/ HUD Command Deck</span>
              </span>
              <p className="text-[10px] text-muted font-mono">Modular Hardware & Simulation Mesh</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 ml-auto px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-mono text-emerald-400 font-bold">IoT Mesh: 99.8% Nominal</span>
          </div>
        </div>
      </header>

      {/* Widget Tabs Toolbar with Sliding Spring Pill */}
      <nav className="bg-bg-deep/50 backdrop-blur-xl border-b border-white/10 shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 max-w-7xl mx-auto w-full min-w-max">
          {WIDGETS.map((w) => {
            const isActive = activeWidget === w.id;
            return (
              <button
                key={w.id}
                onClick={() => setActiveWidget(w.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium
                  transition-all duration-200 cursor-pointer select-none
                  ${isActive ? "text-white font-bold" : "text-muted hover:text-white"}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="deck-active-pill"
                    className="absolute inset-0 rounded-xl bg-accent-cyan/15 border border-accent-cyan/40 shadow-[0_0_15px_rgba(103,232,249,0.25)] -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                {w.icon}
                <span>{w.label}</span>
                {w.badge && (
                  <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-accent-cyan/30 text-accent-cyan" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  }`}>
                    {w.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Dynamic Widget Viewport */}
      <main className="flex-1 overflow-auto p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeWidget}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            {activeWidget === "iot" && <IoTSandboxWidget />}
            {activeWidget === "pass" && <HolographicPassWidget />}
            {activeWidget === "host" && <HostVerificationWidget />}
            {activeWidget === "analytics" && <AnalyticsWidget />}
            {activeWidget === "search" && <SearchWidget />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
