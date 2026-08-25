"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Shield, CheckCircle2, XCircle, QrCode, AlertTriangle } from "lucide-react";
import GlassCard from "@web/components/ui/GlassCard";
import NeonButton from "@web/components/ui/NeonButton";

/* ── Mock verified bookings database ─────────────────────── */
const MOCK_DB: Record<string, {
  id: string; name: string; vehicle: string; plate: string;
  floor: string; slot: string; startTime: string; endTime: string;
  status: "valid" | "expired" | "invalid";
}> = {
  "BKG-20260822-C07": {
    id: "BKG-20260822-C07", name: "Aryan Sharma",
    vehicle: "Tata Nexon EV", plate: "KA-01-EQ-5678",
    floor: "L3", slot: "L3-03",
    startTime: "18:30", endTime: "21:00", status: "valid",
  },
  "BKG-20260822-A12": {
    id: "BKG-20260822-A12", name: "Priya Verma",
    vehicle: "Maruti Swift", plate: "MH-12-AB-1234",
    floor: "L1", slot: "L1-07",
    startTime: "10:00", endTime: "14:00", status: "expired",
  },
  "BKG-20260822-B03": {
    id: "BKG-20260822-B03", name: "Ravi Kumar",
    vehicle: "Honda City", plate: "DL-08-CX-9900",
    floor: "L2", slot: "L2-05",
    startTime: "16:00", endTime: "20:00", status: "valid",
  },
};

type GateClearanceState = "idle" | "verifying" | "cleared" | "denied";

/* ── Host Verification Desk Widget ───────────────────────── */
export default function HostVerificationWidget() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<typeof MOCK_DB[string] | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [gateState, setGateState] = useState<GateClearanceState>("idle");
  const [authToken, setAuthToken] = useState("");

  const handleSearch = () => {
    const key = query.trim().toUpperCase();
    const found = MOCK_DB[key];
    setResult(found ?? null);
    setNotFound(!found);
    setGateState("idle");
  };

  const handleClearance = () => {
    if (!result) return;
    setGateState("verifying");
    setTimeout(() => {
      const isValid = result.status === "valid";
      setGateState(isValid ? "cleared" : "denied");
      if (isValid) setAuthToken(Date.now().toString(36).toUpperCase());
    }, 2200);
  };

  const reset = () => {
    setGateState("idle");
    setResult(null);
    setNotFound(false);
    setQuery("");
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 overflow-auto no-scrollbar">
      {/* LEFT — Search panel */}
      <div className="flex-1 space-y-4">
        <GlassCard className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent-cyan" />
            <h3 className="font-heading text-base font-semibold">Host Verification Desk</h3>
          </div>

          {/* Search input */}
          <div className="space-y-2">
            <label htmlFor="verify-search" className="hud-label">Booking Reference / Plate</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  id="verify-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="e.g. BKG-20260822-C07"
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-bg-elevated border border-border text-sm font-mono text-foreground focus:border-accent-cyan/50 focus:outline-none transition-colors placeholder:text-muted/50"
                />
              </div>
              <NeonButton variant="primary" size="md" onClick={handleSearch}>
                Verify
              </NeonButton>
            </div>
          </div>

          {/* Quick-load presets */}
          <div className="space-y-1.5">
            <p className="hud-label">Quick Load</p>
            <div className="flex flex-wrap gap-2">
              {Object.keys(MOCK_DB).map((key) => (
                <button
                  key={key}
                  onClick={() => { setQuery(key); }}
                  className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-bg-elevated border border-border text-muted hover:text-foreground hover:border-accent-cyan/30 transition-colors cursor-pointer"
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Verification result */}
        <AnimatePresence mode="wait">
          {notFound && (
            <motion.div
              key="notfound"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            >
              <GlassCard className="p-4 flex items-center gap-3">
                <XCircle className="w-5 h-5 text-status-cancelled shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-status-cancelled">Booking Not Found</p>
                  <p className="text-xs text-muted">Check the reference and try again.</p>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            >
              <GlassCard className={`p-5 space-y-4 ${result.status === "valid" ? "border-status-confirmed/30" : "border-status-cancelled/30"}`} glow={result.status === "valid"}>
                {/* Status badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.status === "valid" ? (
                      <CheckCircle2 className="w-5 h-5 text-status-confirmed" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-status-cancelled" />
                    )}
                    <span className={`text-sm font-semibold ${result.status === "valid" ? "text-status-confirmed" : "text-status-cancelled"}`}>
                      {result.status === "valid" ? "Valid Booking" : "Expired Pass"}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-muted">{result.id}</span>
                </div>

                {/* Driver info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <InfoCell label="Driver" value={result.name} />
                  <InfoCell label="Plate" value={result.plate} mono />
                  <InfoCell label="Vehicle" value={result.vehicle} />
                  <InfoCell label="Floor / Bay" value={`${result.floor} — ${result.slot}`} mono />
                  <InfoCell label="Check-in" value={result.startTime} mono />
                  <InfoCell label="Check-out" value={result.endTime} mono />
                </div>

                {/* Gate clearance button */}
                {gateState === "idle" && (
                  <NeonButton
                    variant={result.status === "valid" ? "primary" : "ghost"}
                    size="md"
                    fullWidth
                    onClick={handleClearance}
                    disabled={result.status !== "valid"}
                  >
                    <Shield className="w-4 h-4" />
                    {result.status === "valid" ? "Authorize Gate Clearance" : "Cannot Authorize — Pass Expired"}
                  </NeonButton>
                )}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT — Gate clearance animation */}
      <div className="lg:w-64 flex flex-col gap-3">
        <GlassCard className="p-5 flex-1 flex flex-col items-center justify-center gap-4 min-h-[240px]">
          <AnimatePresence mode="wait">
            {gateState === "idle" && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-2xl bg-bg-elevated border border-border flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-muted" />
                </div>
                <p className="text-sm text-muted">Verify a booking to<br />authorize gate access</p>
              </motion.div>
            )}

            {gateState === "verifying" && (
              <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-accent-cyan/30 border-t-accent-cyan animate-spin" />
                  <Shield className="absolute inset-0 m-auto w-7 h-7 text-accent-cyan" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-accent-cyan">Verifying…</p>
                  <p className="text-xs text-muted font-mono">Checking cryptographic token</p>
                </div>
              </motion.div>
            )}

            {gateState === "cleared" && (
              <motion.div key="cleared"
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className="flex flex-col items-center gap-3 text-center">
                <motion.div
                  className="w-20 h-20 rounded-full bg-status-confirmed/15 border-2 border-status-confirmed/50 flex items-center justify-center"
                  style={{ boxShadow: "0 0 40px rgba(34,197,94,0.3)" }}
                  animate={{ boxShadow: ["0 0 30px rgba(34,197,94,0.2)", "0 0 60px rgba(34,197,94,0.4)", "0 0 30px rgba(34,197,94,0.2)"] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <CheckCircle2 className="w-10 h-10 text-status-confirmed" />
                </motion.div>
                <div>
                  <p className="font-heading text-lg font-bold text-status-confirmed">GATE CLEARED</p>
                  <p className="text-xs text-muted mt-1">Barrier opening…</p>
                  <p className="font-mono text-xs text-status-confirmed/70 mt-2">AUTH-{authToken}</p>
                </div>
                <NeonButton variant="ghost" size="sm" onClick={reset}>New Scan</NeonButton>
              </motion.div>
            )}

            {gateState === "denied" && (
              <motion.div key="denied"
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-3 text-center">
                <div className="w-20 h-20 rounded-full bg-status-cancelled/10 border-2 border-status-cancelled/40 flex items-center justify-center"
                  style={{ boxShadow: "0 0 30px rgba(239,68,68,0.2)" }}>
                  <XCircle className="w-10 h-10 text-status-cancelled" />
                </div>
                <div>
                  <p className="font-heading text-lg font-bold text-status-cancelled">ACCESS DENIED</p>
                  <p className="text-xs text-muted mt-1">Pass is expired or invalid</p>
                </div>
                <NeonButton variant="ghost" size="sm" onClick={reset}>Try Again</NeonButton>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </div>
  );
}

function InfoCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] hud-label">{label}</p>
      <p className={`text-sm font-medium ${mono ? "font-mono text-accent-cyan" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
