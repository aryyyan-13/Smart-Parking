"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin, Clock, Car, CalendarDays, ChevronRight, Search, Plus
} from "lucide-react";
import Navbar from "@web/components/layout/Navbar";
import BottomNav from "@web/components/layout/BottomNav";
import GlassCard from "@web/components/ui/GlassCard";
import StatusBadge from "@web/components/ui/StatusBadge";
import NeonButton from "@web/components/ui/NeonButton";
import type { StatusType } from "@web/components/ui/StatusBadge";

interface BookingRecord {
  id: string;
  listingName: string;
  address: string;
  floor: string;
  slot: string;
  date: string;
  startTime: string;
  endTime: string;
  vehicleType: "FOUR_WHEELER" | "TWO_WHEELER";
  amount: string;
  status: StatusType;
}

const MOCK_BOOKINGS: BookingRecord[] = [
  {
    id: "BKG-20260815-A12",
    listingName: "MG Road Metro Multi-Level",
    address: "Church Street, Bengaluru",
    floor: "L1",
    slot: "A-12 (150kW EV)",
    date: "Aug 15, 2026",
    startTime: "09:00",
    endTime: "17:00",
    vehicleType: "FOUR_WHEELER",
    amount: "₹320.00",
    status: "confirmed",
  },
  {
    id: "BKG-20260810-B03",
    listingName: "Connaught Place Inner Circle Garage",
    address: "Block A, CP, New Delhi",
    floor: "G",
    slot: "B-03",
    date: "Aug 10, 2026",
    startTime: "10:00",
    endTime: "14:00",
    vehicleType: "FOUR_WHEELER",
    amount: "₹200.00",
    status: "confirmed",
  },
  {
    id: "BKG-20260805-C07",
    listingName: "BKC Financial Center Hub",
    address: "G Block, BKC, Mumbai",
    floor: "B2",
    slot: "C-07",
    date: "Aug 5, 2026",
    startTime: "08:00",
    endTime: "09:00",
    vehicleType: "TWO_WHEELER",
    amount: "₹70.00",
    status: "pending",
  },
  {
    id: "BKG-20260720-D11",
    listingName: "HITEC City Cyber Towers Hub",
    address: "Madhapur, Hyderabad",
    floor: "G",
    slot: "D-11",
    date: "Jul 20, 2026",
    startTime: "12:00",
    endTime: "18:00",
    vehicleType: "FOUR_WHEELER",
    amount: "₹240.00",
    status: "cancelled",
  },
];

type FilterTab = "all" | "upcoming" | "completed" | "cancelled";

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

function BookingCard({ booking, index }: { booking: BookingRecord; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href="/booking/confirmation" aria-label={`View booking at ${booking.listingName}`}>
        <GlassCard tilt hover className="p-5 space-y-3.5 group">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-heading text-sm font-bold text-white group-hover:text-accent-cyan transition-colors truncate">
                {booking.listingName}
              </h3>
              <p className="text-xs text-muted flex items-center gap-1 mt-0.5 font-sans">
                <MapPin className="w-3 h-3 text-accent-cyan shrink-0" />
                <span className="truncate">{booking.address}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge status={booking.status} dot />
              <ChevronRight className="w-4 h-4 text-muted group-hover:text-white transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs font-mono pt-1">
            <div className="space-y-0.5">
              <p className="hud-label text-[9px]">Date</p>
              <p className="flex items-center gap-1 text-slate-300">
                <CalendarDays className="w-3 h-3 text-accent-cyan/70" />
                {booking.date}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="hud-label text-[9px]">Window</p>
              <p className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3 h-3 text-accent-cyan/70" />
                {booking.startTime}–{booking.endTime}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="hud-label text-[9px]">Bay</p>
              <p className="text-accent-cyan font-bold truncate">
                {booking.floor} · {booking.slot}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-white/10 font-mono">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Car className="w-3.5 h-3.5" />
              {booking.vehicleType === "FOUR_WHEELER" ? "4-Wheeler" : "2-Wheeler"}
            </div>
            <span className="font-bold text-base text-white">
              {booking.amount}
            </span>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const filtered = MOCK_BOOKINGS.filter((b) => {
    if (activeTab === "upcoming" && b.status !== "confirmed" && b.status !== "pending") return false;
    if (activeTab === "completed" && b.status !== "confirmed") return false;
    if (activeTab === "cancelled" && b.status !== "cancelled") return false;
    if (search && !b.listingName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-bg-void pb-28 md:pb-12">
      <Navbar />

      <div className="pt-24 max-w-2xl mx-auto px-4 space-y-4">
        {/* Header Title */}
        <div className="flex items-center justify-between pb-2">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              My Spatial Passes
            </h1>
            <p className="text-xs text-muted font-mono mt-0.5">
              {MOCK_BOOKINGS.length} total active & completed gate passes
            </p>
          </div>
          <Link href="/search">
            <NeonButton size="sm" variant="primary" pulse magnetic>
              <Plus className="w-3.5 h-3.5" />
              New Booking
            </NeonButton>
          </Link>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by hub name or address…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-muted focus:border-accent-cyan focus:outline-none transition-colors"
            aria-label="Search bookings"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative px-4 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap cursor-pointer transition-colors
                  ${isActive ? "text-white font-bold" : "text-muted hover:text-white"}
                `}
                aria-pressed={isActive}
              >
                {isActive && (
                  <motion.div
                    layoutId="bookings-active-tab-pill"
                    className="absolute inset-0 rounded-lg bg-accent-cyan/15 border border-accent-cyan/40 shadow-[0_0_12px_rgba(103,232,249,0.25)] -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Booking Card Stream */}
        <div className="space-y-3.5 pt-2">
          {filtered.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <CalendarDays className="w-10 h-10 text-muted/30 mx-auto" />
              <p className="text-sm text-muted font-mono">No reservations found for this filter</p>
              <Link href="/search">
                <NeonButton size="sm" variant="chrome" magnetic>
                  Discover Parking Hubs
                </NeonButton>
              </Link>
            </div>
          ) : (
            filtered.map((b, i) => <BookingCard key={b.id} booking={b} index={i} />)
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
