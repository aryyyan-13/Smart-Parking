"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Layers, MapPin, Zap } from "lucide-react";
import type { FloorData } from "@web/components/3d/ParkingGarage3D";
import BookingForm from "@web/components/booking/BookingForm";
import GlassCard from "@web/components/ui/GlassCard";
import MiniMapWidget from "@web/components/map/MiniMapWidget";
import CyberPaymentModal from "@web/components/booking/CyberPaymentModal";
import { useCurrencyStore, formatPrice } from "@web/lib/currency-store";

const ParkingGarage3D = dynamic(
  () => import("@web/components/3d/ParkingGarage3D"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#050508] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin" />
      </div>
    ),
  }
);

/* ── Mock Garage Floor Generator ─────────────────────────── */
function generateMockFloors(): FloorData[] {
  const floorLabels = ["B1", "G", "L1", "L2"];
  return floorLabels.map((label, fi) => ({
    id: `floor-${fi}`,
    label,
    slots: Array.from({ length: 10 }, (_, si) => ({
      id: `${label}-${String(si + 1).padStart(2, "0")}`,
      index: si,
      occupied: (fi * 3 + si * 7) % 4 === 0,
      label: `${label}-${String(si + 1).padStart(2, "0")}`,
    })),
  }));
}

export default function ParkingViewerPage() {
  const floors = useMemo(() => generateMockFloors(), []);
  const [activeFloor, setActiveFloor] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [bookingDuration, setBookingDuration] = useState(8);
  const { active: currency } = useCurrencyStore();

  const currentFloor = floors[activeFloor];
  const availableCount = currentFloor.slots.filter((s) => !s.occupied).length;
  const totalCount = currentFloor.slots.length;
  const baseRateINR = 40;

  const selectedSlotData = selectedSlot
    ? currentFloor.slots.find((s) => s.id === selectedSlot)
    : null;

  const handleSlotClick = (slotId: string) => {
    setSelectedSlot(slotId === selectedSlot ? null : slotId);
  };

  const isEVFloor = currentFloor.label === "L1" || currentFloor.label === "L2";

  return (
    <div className="min-h-screen bg-bg-void">
      {/* Chrome Glass Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-bg-deep/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <Link
              href="/search"
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 transition-colors text-muted hover:text-white"
              aria-label="Back to search"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-base font-bold text-white">MG Road Metro Multi-Level</h1>
                {isEVFloor && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-bold">
                    <Zap className="w-2.5 h-2.5" />EV Tier 150kW
                  </span>
                )}
              </div>
              <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-accent-cyan" />
                Church Street, Off MG Road, Bengaluru
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            <p className="text-accent-cyan font-bold text-lg text-glow">
              {formatPrice(baseRateINR, currency)}
              <span className="text-xs text-muted font-normal">/hr</span>
            </p>
            <p className="text-[10px] text-muted">Base parking rate</p>
          </div>
        </div>
      </header>

      {/* Main Spatial Grid */}
      <div className="pt-20 flex flex-col lg:flex-row min-h-screen">
        {/* Vertical Floor Selector Dock */}
        <aside className="lg:w-24 order-2 lg:order-1 flex lg:flex-col items-center gap-2 p-3 lg:py-8 lg:border-r border-t lg:border-t-0 border-white/10 overflow-x-auto lg:overflow-x-visible bg-bg-deep/40 backdrop-blur-xl">
          <div className="hud-label mb-0 lg:mb-3 flex lg:flex-col items-center gap-1 text-[10px]">
            <Layers className="w-3.5 h-3.5 text-accent-cyan" />
            <span className="hidden lg:inline">Floors</span>
          </div>

          {floors.map((floor, i) => {
            const floorAvail = floor.slots.filter((s) => !s.occupied).length;
            const isActive = i === activeFloor;
            return (
              <button
                key={floor.id}
                onClick={() => {
                  setActiveFloor(i);
                  setSelectedSlot(null);
                }}
                className={`
                  flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 cursor-pointer min-w-[56px]
                  ${
                    isActive
                      ? "bg-accent-cyan/20 border border-accent-cyan text-white shadow-[0_0_20px_rgba(103,232,249,0.35)]"
                      : "bg-white/5 border border-white/10 text-muted hover:text-white hover:border-white/20"
                  }
                `}
                aria-label={`Floor ${floor.label}: ${floorAvail} spots available`}
                aria-pressed={isActive}
              >
                <span className="font-heading font-extrabold text-base">{floor.label}</span>
                <span className="text-[10px] font-mono text-chrome">
                  {floorAvail}/{floor.slots.length}
                </span>
              </button>
            );
          })}
        </aside>

        {/* 3D Interactive Garage Canvas */}
        <main className="flex-1 order-1 lg:order-2 relative h-[52vh] lg:h-auto bg-bg-void">
          <ParkingGarage3D
            floors={floors}
            activeFloor={activeFloor}
            selectedSlot={selectedSlot}
            onSlotClick={handleSlotClick}
          />

          {/* Floor Info Badge */}
          <div className="absolute top-4 left-4 z-10">
            <GlassCard className="px-4 py-2.5">
              <div className="flex items-center gap-3">
                <span className="font-heading font-black text-accent-cyan text-lg text-glow">
                  Level {currentFloor.label}
                </span>
                <div className="h-4 w-px bg-white/15" />
                <span className="text-xs text-muted font-mono">
                  <span className="text-emerald-400 font-bold">{availableCount}</span>/{totalCount} available
                </span>
              </div>
            </GlassCard>
          </div>

          {/* 3D Status Legend */}
          <div className="absolute bottom-4 left-4 z-10">
            <GlassCard className="px-3.5 py-2 flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-accent-cyan/40 border border-accent-cyan shadow-[0_0_8px_#67E8F9]" />
                Available
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-700/60 border border-slate-600" />
                Occupied
              </div>
              <div className="flex items-center gap-1.5 text-sky-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-500/50 border border-sky-400 shadow-[0_0_10px_#38BDF8]" />
                Selected
              </div>
            </GlassCard>
          </div>

          {/* Mini-Map corner preview */}
          <div className="absolute bottom-4 right-4 z-10 hidden sm:block">
            <MiniMapWidget
              locationName="MG Road Metro Multi-Level"
              address="Church Street, Off MG Road"
            />
          </div>
        </main>

        {/* Booking Configuration Panel */}
        <aside className="lg:w-[400px] order-3 p-5 lg:p-6 lg:border-l border-white/10 overflow-y-auto bg-bg-deep/50 backdrop-blur-2xl">
          <BookingForm
            selectedSlotLabel={selectedSlotData?.label ?? null}
            floorLabel={currentFloor.label}
            listingName="MG Road Metro Multi-Level"
            pricePerHour={baseRateINR}
            currency="₹"
            onConfirm={(duration) => {
              setBookingDuration(duration);
              setPaymentOpen(true);
            }}
          />
        </aside>
      </div>

      {/* Cyber Payment Gateway Modal */}
      <CyberPaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        basePrice={baseRateINR}
        duration={bookingDuration}
        currency="₹"
        bookingRef="BKG-20260825-C07"
        isEVSpot={isEVFloor}
      />
    </div>
  );
}
