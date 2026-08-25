"use client";

import { useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  CheckCircle2, MapPin, Clock, Car, CalendarDays, Navigation,
  ListChecks, Share2, Download, Zap, Shield
} from "lucide-react";
import Navbar from "@web/components/layout/Navbar";
import GlassCard from "@web/components/ui/GlassCard";
import NeonButton from "@web/components/ui/NeonButton";
import CountdownTimer from "@web/components/booking/CountdownTimer";

const QRCodeDisplay = dynamic(() => import("@web/components/booking/QRCodeDisplay"), {
  ssr: false,
  loading: () => (
    <div className="w-40 h-40 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
  ),
});

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/10 last:border-0 font-mono text-xs">
      <div className="flex items-center gap-2.5 text-muted">
        <span className="text-accent-cyan/80 shrink-0" aria-hidden="true">
          {icon}
        </span>
        <span>{label}</span>
      </div>
      <span className="font-medium text-white text-right max-w-[58%] truncate">{value}</span>
    </div>
  );
}

const MOCK_BOOKING = {
  id: "BKG-20260815-A12",
  listingName: "MG Road Metro Multi-Level",
  address: "Church Street, Off MG Road, Bengaluru",
  floor: "Level 1",
  slot: "A-12 (150kW Ultra-Fast EV)",
  date: "Aug 15, 2026",
  startTime: "09:00",
  endTime: "17:00",
  vehicle: "Tata Nexon EV (KA-01-EQ-5678)",
  amount: "₹320.00",
  pricePerHour: "₹40.00",
  duration: "8 hrs",
};

export default function BookingConfirmationPage() {
  const bookingStart = useMemo(() => new Date("2026-08-15T09:00:00"), []);
  const qrValue = `smartpark://booking/${MOCK_BOOKING.id}`;

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
  };

  return (
    <div className="min-h-screen bg-bg-void pb-20">
      <Navbar />

      <main
        className="pt-24 flex items-start justify-center px-4"
        aria-labelledby="confirmation-heading"
      >
        <motion.div
          className="relative z-10 w-full max-w-lg space-y-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Success Banner */}
          <motion.div variants={item} className="text-center space-y-3 pb-2">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.25)]"
            >
              <CheckCircle2
                className="w-10 h-10 text-emerald-400"
                strokeWidth={1.5}
              />
            </motion.div>

            <div>
              <h1
                id="confirmation-heading"
                className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
              >
                Holographic Pass Issued
              </h1>
              <p className="text-xs text-muted font-mono mt-1">
                Your bay and gate clearance are cryptographically signed
              </p>
            </div>

            {/* Reference Token */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/12">
              <span className="hud-label text-[9px]">TOKEN</span>
              <span className="font-mono text-xs text-accent-cyan font-bold tracking-wider">{MOCK_BOOKING.id}</span>
            </div>
          </motion.div>

          {/* Countdown Card */}
          <motion.div variants={item}>
            <GlassCard className="px-5 py-3.5 flex items-center justify-center">
              <CountdownTimer targetDate={bookingStart} label="Session Window begins in" />
            </GlassCard>
          </motion.div>

          {/* Holographic Entry Pass Card with QR */}
          <motion.div variants={item}>
            <GlassCard tilt className="p-6 flex flex-col items-center gap-4 text-center relative overflow-hidden">
              <div className="flex items-center gap-2 text-accent-cyan">
                <Shield className="w-4 h-4" />
                <span className="hud-label text-[10px]">ANPR AUTO-CLEAR PASS</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/15 shadow-[0_0_30px_rgba(103,232,249,0.18)]">
                <QRCodeDisplay value={qrValue} size={150} />
              </div>

              <p className="font-mono text-[11px] text-muted tracking-wider">
                Show at entrance barrier or roll forward for ANPR camera scan
              </p>
            </GlassCard>
          </motion.div>

          {/* Booking Breakdown */}
          <motion.div variants={item}>
            <GlassCard className="p-5">
              <h2 className="font-heading text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2.5 mb-1">
                Reservation Parameters
              </h2>
              <DetailRow
                icon={<MapPin className="w-4 h-4" />}
                label="Hub Location"
                value={MOCK_BOOKING.listingName}
              />
              <DetailRow
                icon={<Zap className="w-4 h-4 text-emerald-400" />}
                label="Floor / Bay"
                value={`${MOCK_BOOKING.floor} — ${MOCK_BOOKING.slot}`}
              />
              <DetailRow
                icon={<CalendarDays className="w-4 h-4" />}
                label="Scheduled Date"
                value={MOCK_BOOKING.date}
              />
              <DetailRow
                icon={<Clock className="w-4 h-4" />}
                label="Duration Window"
                value={`${MOCK_BOOKING.startTime} – ${MOCK_BOOKING.endTime} (${MOCK_BOOKING.duration})`}
              />
              <DetailRow
                icon={<Car className="w-4 h-4" />}
                label="Vehicle Identifier"
                value={MOCK_BOOKING.vehicle}
              />

              <div className="flex items-center justify-between pt-3.5 border-t border-white/10 mt-1">
                <div>
                  <span className="font-heading font-bold text-white text-sm">Total Settled</span>
                  <p className="text-[10px] text-muted font-mono">Includes 150kW fast charge add-on</p>
                </div>
                <span className="font-mono font-black text-2xl text-accent-cyan text-glow">
                  {MOCK_BOOKING.amount}
                </span>
              </div>
            </GlassCard>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={item} className="grid grid-cols-2 gap-3 pt-1">
            <Link
              href={`https://maps.google.com/?q=${encodeURIComponent(MOCK_BOOKING.address)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <NeonButton variant="primary" size="md" fullWidth magnetic>
                <Navigation className="w-4 h-4" />
                Navigate
              </NeonButton>
            </Link>
            <NeonButton variant="chrome" size="md" fullWidth magnetic>
              <Share2 className="w-4 h-4" />
              Share Pass
            </NeonButton>
          </motion.div>

          <motion.div variants={item}>
            <Link href="/bookings">
              <NeonButton variant="secondary" size="md" fullWidth magnetic>
                <ListChecks className="w-4 h-4" />
                View All Active Passes
              </NeonButton>
            </Link>
          </motion.div>

          {/* Download Ticket Action */}
          <motion.div variants={item} className="text-center pt-2">
            <button
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-white font-mono transition-colors cursor-pointer"
              aria-label="Download booking ticket"
            >
              <Download className="w-3.5 h-3.5 text-accent-cyan" />
              Download Cryptographic Pass Receipt
            </button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
