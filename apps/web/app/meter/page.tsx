"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Timer, AlertTriangle, CheckCircle2, Plus,
  ArrowLeft, Clock, Radio, CreditCard, Zap
} from "lucide-react";
import Navbar from "@web/components/layout/Navbar";
import GlassCard from "@web/components/ui/GlassCard";
import NeonButton from "@web/components/ui/NeonButton";
import {
  useParkingSessionStore,
  fmtDuration,
  type ParkingSession,
} from "@web/lib/parking-session-store";

/* ── Spatial Chrome Radial Timer Ring ──────────────────────── */
function TimerRing({
  elapsed,
  total,
  warning,
}: {
  elapsed: number;
  total: number;
  warning: boolean;
}) {
  const pct = Math.min(elapsed / total, 1);
  const r = 94;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const color = warning ? "#F43F5E" : pct > 0.75 ? "#F59E0B" : "#67E8F9";

  return (
    <svg width="240" height="240" viewBox="0 0 240 240" className="absolute inset-0">
      <circle cx="120" cy="120" r={r} fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="10" />
      <circle cx="120" cy="120" r={r - 14} fill="none" stroke="rgba(160, 160, 176, 0.15)" strokeWidth="1.5" strokeDasharray="3 6" />
      <circle
        cx="120" cy="120" r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 120 120)"
        style={{
          transition: "stroke-dashoffset 1s linear, stroke 0.6s ease",
          filter: `drop-shadow(0 0 10px ${color})`,
        }}
      />
    </svg>
  );
}

/* ── FASTag Exit Receipt Modal ──────────────────────────────── */
function FastagExitModal({
  session,
  elapsed,
  fare,
  onClose,
}: {
  session: ParkingSession;
  elapsed: number;
  fare: number;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("idle");
  const simulateFastagExit = useParkingSessionStore((s) => s.simulateFastagExit);

  const handleExit = () => {
    setPhase("scanning");
    setTimeout(() => {
      simulateFastagExit(session.id);
      setPhase("done");
    }, 2000);
  };

  const mins = Math.ceil(elapsed / 60);
  const hrs = (elapsed / 3600).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={phase === "done" ? onClose : undefined}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-bg-base/95 rounded-3xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Header */}
        <div className={`border-b px-6 py-5 flex items-center gap-3.5 ${
          phase === "done"
            ? "bg-emerald-500/10 border-emerald-500/20"
            : "bg-accent-cyan/10 border-accent-cyan/20"
        }`}>
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
            phase === "done"
              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
              : "bg-accent-cyan/20 border-accent-cyan/30 text-accent-cyan"
          }`}>
            {phase === "done" ? <CheckCircle2 className="w-5 h-5" /> : <Radio className="w-5 h-5" />}
          </div>
          <div>
            <p className="font-heading font-bold text-white text-base">
              {phase === "done" ? "FASTag Auto-Debit Complete" : "FASTag Exit Gate"}
            </p>
            <p className="text-xs text-muted font-mono">
              {phase === "done" ? "Receipt Generated — NPCI NETC" : "UHF RFID 865MHz · EPC Gen2"}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Session breakdown */}
          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-muted">Location</span>
              <span className="font-medium text-white truncate max-w-[60%]">{session.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Zone Occupied</span>
              <span className="text-accent-cyan font-bold">{session.zoneLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">License Plate</span>
              <span className="font-bold text-white">{session.licensePlate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">FASTag ID</span>
              <span className="text-accent-cyan">{session.fastagId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Entry Time</span>
              <span className="text-white">{session.entryTime ? new Date(session.entryTime).toLocaleTimeString("en-IN") : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Exit Time</span>
              <span className="text-white">{phase === "done" && session.exitTime ? new Date(session.exitTime).toLocaleTimeString("en-IN") : "Now"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Exact Duration</span>
              <span className="font-bold text-white">{mins} mins ({hrs} hrs)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Rate</span>
              <span className="text-white">₹{session.pricePerHour}/hr</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 flex justify-between items-center">
            <div>
              <span className="font-heading font-bold text-white text-sm">Total Charged</span>
              <p className="text-[10px] text-muted font-mono">Billed to exact minute via FASTag wallet</p>
            </div>
            <div className="text-right">
              <p className="font-mono font-black text-3xl text-accent-cyan text-glow">
                ₹{fare.toFixed(2)}
              </p>
            </div>
          </div>

          {phase === "done" && (
            <p className="text-[11px] text-center text-emerald-400 bg-emerald-500/10 rounded-xl px-3 py-2 border border-emerald-500/20 font-mono">
              ✓ Exit barrier raised — FASTag debit confirmed. Receipt: {session.receiptId}
            </p>
          )}

          {phase !== "done" ? (
            <NeonButton
              variant="primary"
              size="lg"
              fullWidth
              pulse={phase === "idle"}
              onClick={handleExit}
              magnetic
            >
              <Radio className="w-4 h-4" />
              {phase === "scanning" ? "Processing FASTag exit scan…" : "Simulate FASTag Exit & Pay ₹" + fare.toFixed(2)}
            </NeonButton>
          ) : (
            <NeonButton variant="primary" size="lg" fullWidth onClick={onClose} magnetic>
              <CheckCircle2 className="w-4 h-4" />
              Done
            </NeonButton>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Demo session starter (no active booking) ───────────────── */
function NoSessionCard() {
  const createBooking = useParkingSessionStore((s) => s.createBooking);
  const simulateFastagEntry = useParkingSessionStore((s) => s.simulateFastagEntry);
  const [loading, setLoading] = useState(false);

  const startDemoSession = () => {
    setLoading(true);
    const sid = createBooking({
      licensePlate: "KA 01 EQ 5678",
      fastagId: "FAST-KA01EQ5678",
      vehicleType: "FOUR_WHEELER",
      location: "MG Road Metro Multi-Level",
      zoneId: "L1-STD",
      zoneLabel: "Level 1 — Standard",
      pricePerHour: 40,
      durationHours: 2,
    });
    setTimeout(() => {
      simulateFastagEntry(sid);
      setLoading(false);
    }, 800);
  };

  return (
    <GlassCard className="p-8 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center mx-auto">
        <Timer className="w-8 h-8 text-accent-cyan" />
      </div>
      <div>
        <p className="font-heading font-bold text-white text-lg">No Active Session</p>
        <p className="text-sm text-muted font-mono mt-1">Book a parking spot to begin, or start a demo session.</p>
      </div>
      <div className="space-y-3">
        <Link href="/search">
          <NeonButton variant="primary" size="md" fullWidth magnetic>
            <Zap className="w-4 h-4" />
            Book a Spot
          </NeonButton>
        </Link>
        <NeonButton variant="chrome" size="md" fullWidth magnetic onClick={startDemoSession}>
          <Timer className="w-4 h-4" />
          {loading ? "Starting demo…" : "Start Demo Session (KA 01 EQ 5678)"}
        </NeonButton>
      </div>
    </GlassCard>
  );
}

/* ── Live Meter Page ─────────────────────────────────────────── */
export default function LiveMeterPage() {
  const session = useParkingSessionStore((s) => s.getActiveSession());
  const extendSession = useParkingSessionStore((s) => s.extendSession);

  const [elapsed, setElapsed] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [sessionState, setSessionState] = useState<"active" | "warning" | "ended">("active");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalBookedSecs = session
    ? Math.floor((session.bookedEnd - (session.entryTime ?? session.bookedStart)) / 1000)
    : 7200;

  const tick = useCallback(() => {
    if (!session?.entryTime) return;
    const nowElapsed = Math.floor((Date.now() - session.entryTime) / 1000);
    setElapsed(nowElapsed);

    const remaining = totalBookedSecs - nowElapsed;
    if (remaining <= 900 && remaining > 0) setSessionState("warning");
    if (remaining <= 0) setSessionState("ended");
  }, [session, totalBookedSecs]);

  useEffect(() => {
    if (session?.status === "active") {
      setTimeout(() => tick(), 0); // avoid synchronous setState
      intervalRef.current = setInterval(tick, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [session?.id, session?.status, tick]);

  const remaining = Math.max(totalBookedSecs - elapsed, 0);
  const fareINR = session ? (elapsed / 3600) * session.pricePerHour : 0;

  const isCompleted = session?.status === "completed" || session?.status === "manager_ended";

  // If session was completed externally (manager override), stop the ticker
  useEffect(() => {
    if (isCompleted && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [isCompleted]);

  return (
    <div className="min-h-screen bg-bg-void">
      <Navbar />

      <div className="pt-24 pb-28 px-4 max-w-lg mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center gap-3.5">
          <Link
            href="/"
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-black text-white tracking-tight">
              Live Spatial Meter
            </h1>
            <p className="text-xs text-muted font-mono">
              {session ? `${session.fastagId} · ${session.licensePlate}` : "Precision billing for actual duration parked"}
            </p>
          </div>
        </div>

        {/* No session state */}
        {!session && <NoSessionCard />}

        {/* Completed / Manager-ended banner */}
        {isCompleted && (
          <GlassCard className="p-5 flex items-center gap-3 bg-emerald-500/5 border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white text-sm">Session Completed</p>
              <p className="text-xs text-muted font-mono">
                {session?.settlement === "manager_override"
                  ? `Manager override: ${session.managerNote}`
                  : `FASTag auto-debit: ₹${session?.finalAmountINR?.toFixed(2)}. Receipt: ${session?.receiptId}`}
              </p>
            </div>
          </GlassCard>
        )}

        {session && session.status === "active" && (
          <>
            {/* 15-Min Expiry Warning Banner */}
            <AnimatePresence>
              {sessionState === "warning" && (
                <motion.div
                  initial={{ opacity: 0, y: -12, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />
                    <div>
                      <p className="text-xs font-bold text-rose-300 font-mono">⚠️ EXPIRY WARNING (&lt; 15 MINS)</p>
                      <p className="text-xs text-slate-300 leading-snug">
                        Booked window nearing end. Extend now to avoid overstay charges.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Radial Timer Dial */}
            <GlassCard tilt className="p-8 flex flex-col items-center gap-6">
              <div className="relative w-[240px] h-[240px] flex items-center justify-center">
                <TimerRing elapsed={elapsed} total={totalBookedSecs} warning={sessionState === "warning"} />
                <div className="text-center z-10 space-y-1.5">
                  <p className="font-mono text-4xl font-extrabold tracking-tight text-white tabular-nums">
                    {fmtDuration(elapsed)}
                  </p>
                  <p className="hud-label text-[10px]">ELAPSED TIME</p>
                  <div className="pt-1">
                    <p className="font-mono text-2xl font-black text-accent-cyan text-glow">
                      ₹{fareINR.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-muted font-mono">ACCRUED CHARGE</p>
                  </div>
                </div>
              </div>

              {/* Remaining Time Linear Indicator */}
              <div className="w-full space-y-1.5 font-mono">
                <div className="flex justify-between text-xs text-muted">
                  <span className="flex items-center gap-1.5 text-chrome">
                    <Clock className="w-3.5 h-3.5 text-accent-cyan" />
                    Remaining Window
                  </span>
                  <span className={remaining <= 900 ? "text-rose-400 font-bold animate-pulse" : "text-white font-bold"}>
                    {fmtDuration(remaining)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      remaining <= 900
                        ? "bg-rose-500 shadow-[0_0_10px_#F43F5E]"
                        : remaining / totalBookedSecs < 0.3
                        ? "bg-amber-400 shadow-[0_0_10px_#F59E0B]"
                        : "bg-accent-cyan shadow-[0_0_10px_#67E8F9]"
                    }`}
                    style={{ width: `${(remaining / totalBookedSecs) * 100}%` }}
                  />
                </div>
              </div>
            </GlassCard>

            {/* Active Session Info */}
            <GlassCard className="p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <p className="hud-label text-xs">Active Bay Telemetry</p>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                  LIVE
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3.5 text-xs font-mono">
                <div className="space-y-0.5">
                  <p className="text-muted text-[10px]">Location</p>
                  <p className="font-medium text-white truncate">{session.location}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted text-[10px]">Zone</p>
                  <p className="font-bold text-accent-cyan">{session.zoneLabel}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted text-[10px]">License Plate</p>
                  <p className="font-bold text-white">{session.licensePlate}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted text-[10px]">FASTag ID</p>
                  <p className="text-accent-cyan truncate">{session.fastagId}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted text-[10px]">Entry Time</p>
                  <p className="font-medium text-white">
                    {session.entryTime ? new Date(session.entryTime).toLocaleTimeString("en-IN") : "—"}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted text-[10px]">Rate</p>
                  <p className="font-medium text-white">₹{session.pricePerHour}/hr</p>
                </div>
              </div>
            </GlassCard>

            {/* Controls */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <NeonButton variant="chrome" size="md" fullWidth magnetic onClick={() => extendSession(session.id, 30)}>
                  <Plus className="w-4 h-4" />
                  Extend +30m
                </NeonButton>
                <NeonButton variant="chrome" size="md" fullWidth magnetic onClick={() => extendSession(session.id, 60)}>
                  <Plus className="w-4 h-4" />
                  Extend +1h
                </NeonButton>
              </div>

              <NeonButton
                variant="destructive"
                size="lg"
                fullWidth
                magnetic
                onClick={() => setShowExitModal(true)}
              >
                <CreditCard className="w-4 h-4" />
                FASTag Exit & Pay ₹{fareINR.toFixed(2)}
                <Radio className="w-3.5 h-3.5 ml-1" />
              </NeonButton>
            </div>
          </>
        )}
      </div>

      {/* FASTag Exit Modal */}
      <AnimatePresence>
        {showExitModal && session && (
          <FastagExitModal
            session={session}
            elapsed={elapsed}
            fare={fareINR}
            onClose={() => setShowExitModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
