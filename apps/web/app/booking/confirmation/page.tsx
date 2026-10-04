"use client";

import { useMemo, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, MapPin, Clock, Car, CalendarDays, Navigation,
  ListChecks, Share2, Zap, Shield, Radio, ChevronRight
} from "lucide-react";
import Navbar from "@web/components/layout/Navbar";
import GlassCard from "@web/components/ui/GlassCard";
import NeonButton from "@web/components/ui/NeonButton";
import CountdownTimer from "@web/components/booking/CountdownTimer";
import { useParkingSessionStore, type ParkingSession } from "@web/lib/parking-session-store";

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

/* ── FASTag Entry Simulation Widget ─────────────────────────── */
function FastagEntryCard({ session }: { session: ParkingSession }) {
  const simulateFastagEntry = useParkingSessionStore((s) => s.simulateFastagEntry);
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle");

  const isEntered = session.status === "active";

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isEntered) {
      timeout = setTimeout(() => setPhase("done"), 0);
    }
    return () => clearTimeout(timeout);
  }, [isEntered]);

  const handleEntry = () => {
    setPhase("scanning");
    setTimeout(() => {
      simulateFastagEntry(session.id);
      setPhase("done");
    }, 1800);
  };

  return (
    <GlassCard className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-accent-cyan">
          <Radio className="w-4 h-4" />
          <span className="hud-label text-[10px]">FASTAG BARRIER — ENTRY GATE</span>
        </div>
        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold ${
          phase === "done"
            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
            : phase === "scanning"
            ? "bg-amber-500/15 text-amber-400 border-amber-500/30 animate-pulse"
            : "bg-white/5 text-muted border-white/10"
        }`}>
          {phase === "done" ? "ENTERED" : phase === "scanning" ? "SCANNING…" : "AWAITING VEHICLE"}
        </span>
      </div>

      {/* FASTag ID display */}
      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div className="space-y-0.5">
          <p className="text-muted text-[10px]">FASTag EPC Tag</p>
          <p className="font-bold text-accent-cyan">{session.fastagId}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-muted text-[10px]">License Plate</p>
          <p className="font-bold text-white">{session.licensePlate}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-muted text-[10px]">Zone Assigned</p>
          <p className="font-medium text-white">{session.zoneLabel}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-muted text-[10px]">Entry Status</p>
          <p className={`font-bold ${phase === "done" ? "text-emerald-400" : "text-amber-400"}`}>
            {phase === "done" ? "✓ Gate Cleared" : "Pending Scan"}
          </p>
        </div>
      </div>

      {/* Entry simulation button */}
      <AnimatePresence mode="wait">
        {phase !== "done" ? (
          <motion.div key="entry-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <NeonButton
              variant="primary"
              size="md"
              fullWidth
              pulse={phase === "idle"}
              onClick={handleEntry}
              magnetic
            >
              <Radio className="w-4 h-4" />
              {phase === "scanning" ? "Reading FASTag RFID…" : "Simulate FASTag Gate Entry"}
            </NeonButton>
          </motion.div>
        ) : (
          <motion.div
            key="entry-done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <div>
                <p className="font-bold">Boom gate raised — vehicle entered at {new Date(session.entryTime!).toLocaleTimeString("en-IN")}</p>
                <p className="text-emerald-300/70 text-[10px]">UHF RFID 865MHz scan confirmed. Zone counter incremented.</p>
              </div>
            </div>
            <Link href="/meter">
              <NeonButton variant="primary" size="md" fullWidth magnetic>
                <Clock className="w-4 h-4" />
                Track Live Meter
                <ChevronRight className="w-3.5 h-3.5 ml-auto" />
              </NeonButton>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

/* ── Confirmation Page ───────────────────────────────────────── */
import { Suspense } from "react";

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const sid = searchParams.get("sid");
  const sessions = useParkingSessionStore((s) => s.sessions);
  const session = sessions.find((s) => s.id === sid) ?? null;

  // Fallback mock when no session in store (direct URL access)
  const MOCK = useMemo(() => ({
    id: sid ?? "BKG-20260815-A12",
    listingName: "MG Road Metro Multi-Level",
    address: "Church Street, Off MG Road, Bengaluru",
    floor: "Level 1",
    slot: "Zone L1-STD",
    date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    startTime: "09:00",
    endTime: "17:00",
    vehicle: "KA 01 EQ 5678",
    fastagId: "FAST-KA01EQ5678",
    amount: "₹320.00",
    pricePerHour: "₹40.00",
    duration: "8 hrs",
  }), [sid]);

  const bookingStart = useMemo(() => new Date(), []);
  const qrValue = `smartpark://booking/${session?.id ?? MOCK.id}`;

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

      <main className="pt-24 flex items-start justify-center px-4" aria-labelledby="confirmation-heading">
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
              <CheckCircle2 className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
            </motion.div>

            <div>
              <h1
                id="confirmation-heading"
                className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
              >
                FASTag Pass Issued
              </h1>
              <p className="text-xs text-muted font-mono mt-1">
                Zone allotment confirmed — 15-min grace window active
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/12">
              <span className="hud-label text-[9px]">TOKEN</span>
              <span className="font-mono text-xs text-accent-cyan font-bold tracking-wider">
                {session?.id ?? MOCK.id}
              </span>
            </div>
          </motion.div>

          {/* Countdown Card */}
          <motion.div variants={item}>
            <GlassCard className="px-5 py-3.5 flex items-center justify-center">
              <CountdownTimer targetDate={bookingStart} label="15-min grace window expires in" />
            </GlassCard>
          </motion.div>

          {/* FASTag Entry Barrier Simulation */}
          {session && (
            <motion.div variants={item}>
              <FastagEntryCard session={session} />
            </motion.div>
          )}

          {/* QR Pass Card */}
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
              <DetailRow icon={<MapPin className="w-4 h-4" />} label="Hub Location" value={session?.location ?? MOCK.listingName} />
              <DetailRow icon={<Zap className="w-4 h-4 text-emerald-400" />} label="Zone Assigned" value={session?.zoneLabel ?? MOCK.slot} />
              <DetailRow icon={<CalendarDays className="w-4 h-4" />} label="Scheduled Date" value={MOCK.date} />
              <DetailRow
                icon={<Clock className="w-4 h-4" />}
                label="Duration Window"
                value={`${MOCK.startTime} – ${MOCK.endTime} (${MOCK.duration})`}
              />
              <DetailRow icon={<Car className="w-4 h-4" />} label="License Plate" value={session?.licensePlate ?? MOCK.vehicle} />
              <DetailRow icon={<Radio className="w-4 h-4 text-accent-cyan" />} label="FASTag EPC ID" value={session?.fastagId ?? MOCK.fastagId} />

              <div className="flex items-center justify-between pt-3.5 border-t border-white/10 mt-1">
                <div>
                  <span className="font-heading font-bold text-white text-sm">Estimated Total</span>
                  <p className="text-[10px] text-muted font-mono">Final amount billed by FASTag on exit</p>
                </div>
                <span className="font-mono font-black text-2xl text-accent-cyan text-glow">
                  {session ? `₹${(session.pricePerHour * 2).toFixed(2)}` : MOCK.amount}
                </span>
              </div>
            </GlassCard>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={item} className="grid grid-cols-2 gap-3 pt-1">
            <Link
              href={`https://maps.google.com/?q=${encodeURIComponent(session?.location ?? MOCK.address)}`}
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
        </motion.div>
      </main>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-void flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin"></div></div>}>
      <BookingConfirmationContent />
    </Suspense>
  );
}
