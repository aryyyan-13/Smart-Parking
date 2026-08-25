"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Timer, AlertTriangle, CheckCircle2, Plus, X,
  ArrowLeft, Clock
} from "lucide-react";
import Navbar from "@web/components/layout/Navbar";
import GlassCard from "@web/components/ui/GlassCard";
import NeonButton from "@web/components/ui/NeonButton";
import { useCurrencyStore, formatPrice } from "@web/lib/currency-store";

type SessionState = "idle" | "active" | "warning" | "extended" | "ended";

interface SessionData {
  location: string;
  slot: string;
  pricePerHour: number; // INR
  startTime: Date;
  endTime: Date;
  extensions: number;
}

function fmtDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

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
      {/* Chrome Glass Background Ring */}
      <circle
        cx="120"
        cy="120"
        r={r}
        fill="none"
        stroke="rgba(255, 255, 255, 0.08)"
        strokeWidth="10"
      />
      {/* Inner Tick Dots */}
      <circle
        cx="120"
        cy="120"
        r={r - 14}
        fill="none"
        stroke="rgba(160, 160, 176, 0.15)"
        strokeWidth="1.5"
        strokeDasharray="3 6"
      />
      {/* Animated Glowing Progress Arc */}
      <circle
        cx="120"
        cy="120"
        r={r}
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

const MOCK_SESSION: SessionData = {
  location: "MG Road Metro Multi-Level",
  slot: "L3-04 (150kW EV)",
  pricePerHour: 40,
  startTime: new Date(),
  endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
  extensions: 0,
};

function EndSessionModal({
  session,
  elapsed,
  cost,
  onClose,
}: {
  session: SessionData;
  elapsed: number;
  cost: number;
  onClose: () => void;
}) {
  const { active: currency } = useCurrencyStore();
  const mins = Math.ceil(elapsed / 60);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-bg-base/95 rounded-3xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-5 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-heading font-bold text-white text-base">Session Succeeded</p>
            <p className="text-xs text-muted font-mono">Digital Receipt Generated</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-muted">Location</span>
              <span className="font-medium text-white truncate max-w-[60%]">{session.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Bay Allocated</span>
              <span className="text-accent-cyan font-bold">{session.slot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Exact Time Parked</span>
              <span className="text-white font-bold">{mins} mins ({fmtDuration(elapsed)})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Hourly Base Rate</span>
              <span className="text-white">{formatPrice(session.pricePerHour, currency)}/hr</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 flex justify-between items-center">
            <div>
              <span className="font-heading font-bold text-white text-sm">Total Paid</span>
              <p className="text-[10px] text-muted font-mono">Billed to exact minute</p>
            </div>
            <div className="text-right">
              <p className="font-mono font-black text-3xl text-accent-cyan text-glow">
                {formatPrice(cost, currency)}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-center text-emerald-400 bg-emerald-500/10 rounded-xl px-3 py-2 border border-emerald-500/20 font-mono">
            ✓ Gate barrier auto-cleared for departure
          </p>

          <NeonButton variant="primary" size="lg" fullWidth onClick={onClose} magnetic>
            Done
          </NeonButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LiveMeterPage() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { active: currency } = useCurrencyStore();

  const totalBookedSecs = session
    ? Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000)
    : 7200;
  const remaining = Math.max(totalBookedSecs - elapsed, 0);
  const costINR = session ? (elapsed / 3600) * session.pricePerHour : 0;

  const tick = useCallback(() => {
    setElapsed((prev) => {
      const next = prev + 1;
      if (totalBookedSecs - next <= 900 && totalBookedSecs - next > 0) {
        setSessionState("warning");
      }
      if (next >= totalBookedSecs) {
        setSessionState("ended");
      }
      return next;
    });
  }, [totalBookedSecs]);

  useEffect(() => {
    if (sessionState === "active" || sessionState === "warning" || sessionState === "extended") {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionState, tick]);

  const startSession = () => {
    const now = new Date();
    setSession({ ...MOCK_SESSION, startTime: now, endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000) });
    setElapsed(0);
    setSessionState("active");
  };

  const extendSession = (mins: number) => {
    if (!session) return;
    setSession((prev) =>
      prev ? { ...prev, endTime: new Date(prev.endTime.getTime() + mins * 60 * 1000), extensions: prev.extensions + 1 } : prev
    );
    setSessionState("extended");
    setTimeout(() => setSessionState("active"), 1400);
  };

  const endSession = () => {
    setSessionState("ended");
    setShowEndModal(true);
  };

  const resetSession = () => {
    setSession(null);
    setSessionState("idle");
    setElapsed(0);
    setShowEndModal(false);
  };

  const isRunning = sessionState === "active" || sessionState === "warning" || sessionState === "extended";

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
              Precision billing for actual duration parked
            </p>
          </div>
        </div>

        {/* 15-Minute Expiry Warning Banner */}
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
                    Session nearing booked interval. Extend now to prevent overstay penalties.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Radial Timer Dial Card */}
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
                  {formatPrice(costINR, currency)}
                </p>
                <p className="text-[10px] text-muted font-mono">ACCUMULATED CHARGE</p>
              </div>
            </div>
          </div>

          {/* Remaining Time Linear Indicator */}
          {isRunning && (
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
          )}
        </GlassCard>

        {/* Active Session Info Card */}
        {session && (
          <GlassCard className="p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <p className="hud-label text-xs">Active Bay Telemetry</p>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                CONNECTED
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3.5 text-xs font-mono">
              <div className="space-y-0.5">
                <p className="text-muted text-[10px]">Location Hub</p>
                <p className="font-medium text-white truncate">{session.location}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-muted text-[10px]">Bay Slot</p>
                <p className="font-bold text-accent-cyan">{session.slot}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-muted text-[10px]">Active Rate</p>
                <p className="font-medium text-white">{formatPrice(session.pricePerHour, currency)}/hr</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-muted text-[10px]">Extensions</p>
                <p className="font-bold text-amber-400">+{session.extensions} times</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Interactive Controls */}
        <div className="space-y-3">
          {sessionState === "idle" && (
            <NeonButton variant="primary" size="lg" fullWidth pulse magnetic onClick={startSession}>
              <Timer className="w-5 h-5" />
              Start Live Parking Meter
            </NeonButton>
          )}

          {isRunning && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <NeonButton variant="chrome" size="md" fullWidth magnetic onClick={() => extendSession(30)}>
                  <Plus className="w-4 h-4" />
                  Extend +30m
                </NeonButton>
                <NeonButton variant="chrome" size="md" fullWidth magnetic onClick={() => extendSession(60)}>
                  <Plus className="w-4 h-4" />
                  Extend +1h
                </NeonButton>
              </div>

              <NeonButton variant="destructive" size="lg" fullWidth magnetic onClick={endSession}>
                <X className="w-4 h-4" />
                End Session & Pay {formatPrice(costINR, currency)}
              </NeonButton>
            </>
          )}

          {sessionState === "extended" && (
            <div className="flex items-center justify-center gap-2 py-3 text-emerald-400 font-mono text-xs bg-emerald-500/10 rounded-xl border border-emerald-500/25">
              <CheckCircle2 className="w-4 h-4" />
              Session time successfully extended!
            </div>
          )}

          {sessionState === "ended" && !showEndModal && (
            <NeonButton variant="chrome" size="md" fullWidth onClick={resetSession} magnetic>
              Start New Parking Session
            </NeonButton>
          )}
        </div>
      </div>

      {/* End Session Receipt Modal */}
      <AnimatePresence>
        {showEndModal && session && (
          <EndSessionModal
            session={session}
            elapsed={elapsed}
            cost={costINR}
            onClose={resetSession}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
