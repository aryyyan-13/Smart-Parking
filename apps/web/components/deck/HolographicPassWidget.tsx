"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Shield, Clock, MapPin, Car, Zap, CheckCircle2,
  RefreshCw, Copy, CheckCheck, Navigation,
} from "lucide-react";
import GlassCard from "@web/components/ui/GlassCard";
import NeonButton from "@web/components/ui/NeonButton";

const QRCodeDisplay = dynamic(() => import("@web/components/booking/QRCodeDisplay"), {
  ssr: false,
  loading: () => <div className="w-36 h-36 rounded-xl bg-bg-elevated border border-border animate-pulse" />,
});

/* ── Mock booking data ────────────────────────────────────── */
const MOCK_BOOKING = {
  id: "BKG-20260822-C07",
  listingName: "MG Road Metro Multi-Level",
  address: "Church Street, Off MG Road, Bengaluru",
  floor: "L3",
  slot: "L3-03",
  date: "Aug 22, 2026",
  startTime: "18:30",
  endTime: "21:00",
  vehicle: "Tata Nexon EV (KA-01-EQ-5678)",
  vehicleType: "EV",
  amount: "₹360",
  evCharging: true,
  kWh: "25 kWh",
  chargingTier: "150 kW Fast Charge",
  validUntil: new Date(Date.now() + 2.5 * 60 * 60 * 1000),
};

/* ── Countdown hook ───────────────────────────────────────── */
function useCountdown(target: Date) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const update = () => setRemaining(Math.max(0, target.getTime() - Date.now()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [target]);

  const hours = Math.floor(remaining / 3_600_000);
  const mins = Math.floor((remaining % 3_600_000) / 60_000);
  const secs = Math.floor((remaining % 60_000) / 1000);

  return { hours, mins, secs, expired: remaining === 0 };
}

/* ── Security hash ticker ─────────────────────────────────── */
function SecurityHash({ bookingId }: { bookingId: string }) {
  const [hash, setHash] = useState("A3F9-C12B-77E4");

  useEffect(() => {
    const chars = "0123456789ABCDEF";
    const id = setInterval(() => {
      const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      setHash(`${seg()}-${seg()}-${seg()}`);
    }, 3000);
    return () => clearInterval(id);
  }, [bookingId]);

  return (
    <div className="flex items-center gap-2">
      <Shield className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
      <span className="font-mono text-xs text-accent-cyan tracking-widest">{hash}</span>
    </div>
  );
}

/* ── Holographic Gate Pass Widget ─────────────────────────── */
export default function HolographicPassWidget() {
  const [copied, setCopied] = useState(false);
  const { hours, mins, secs, expired } = useCountdown(MOCK_BOOKING.validUntil);
  const qrValue = `smartpark://booking/${MOCK_BOOKING.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(MOCK_BOOKING.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 overflow-auto no-scrollbar">
      {/* LEFT — Holographic pass card */}
      <div className="flex-1 min-w-0">
        <GlassCard glow className="relative overflow-hidden h-full p-6 flex flex-col gap-5">
          {/* Animated background grid */}
          <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 via-transparent to-accent-blue/5 pointer-events-none" />
          {/* Scanline */}
          <div className="absolute inset-0 scanline pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-status-confirmed animate-pulse" />
                <span className="text-xs font-mono text-status-confirmed tracking-widest uppercase">Pass Active</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground">Digital Gate Pass</h3>
              <p className="text-xs text-muted mt-0.5">{MOCK_BOOKING.listingName}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted hud-label">Ref</p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 font-mono text-xs text-accent-cyan hover:text-foreground transition-colors cursor-pointer"
              >
                {MOCK_BOOKING.id}
                {copied ? <CheckCheck className="w-3 h-3 text-status-confirmed" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* QR + validity */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            {/* QR code with holographic border */}
            <div className="relative">
              <div className="p-3 rounded-2xl bg-white shadow-[0_0_30px_rgba(0,255,255,0.2)] ring-2 ring-accent-cyan/30">
                <QRCodeDisplay value={qrValue} size={140} />
              </div>
              <div className="absolute -inset-1 rounded-2xl border border-accent-cyan/20 pointer-events-none" />
            </div>

            {/* Pass details */}
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <DetailCell icon={<MapPin className="w-3 h-3" />} label="Floor / Bay">
                  {MOCK_BOOKING.floor} — {MOCK_BOOKING.slot}
                </DetailCell>
                <DetailCell icon={<Clock className="w-3 h-3" />} label="Duration">
                  {MOCK_BOOKING.startTime} – {MOCK_BOOKING.endTime}
                </DetailCell>
                <DetailCell icon={<Car className="w-3 h-3" />} label="Vehicle">
                  {MOCK_BOOKING.vehicleType}
                </DetailCell>
                <DetailCell icon={<Zap className="w-3 h-3 text-emerald-400" />} label="EV Charging">
                  {MOCK_BOOKING.chargingTier}
                </DetailCell>
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-bg-elevated border border-border">
                <Clock className="w-4 h-4 text-accent-cyan shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] text-muted hud-label">Valid for</p>
                  <div className="flex items-center gap-1 font-mono text-lg font-bold text-accent-cyan text-glow">
                    {expired ? (
                      <span className="text-status-cancelled text-sm">EXPIRED</span>
                    ) : (
                      <>
                        <span>{String(hours).padStart(2, "0")}</span>
                        <span className="opacity-60">:</span>
                        <span>{String(mins).padStart(2, "0")}</span>
                        <span className="opacity-60">:</span>
                        <span>{String(secs).padStart(2, "0")}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Security hash */}
              <SecurityHash bookingId={MOCK_BOOKING.id} />
            </div>
          </div>

          {/* Footer actions */}
          <div className="relative z-10 flex flex-wrap gap-2 mt-auto">
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(MOCK_BOOKING.address)}`}
              target="_blank" rel="noopener noreferrer"
            >
              <NeonButton variant="primary" size="sm">
                <Navigation className="w-3.5 h-3.5" />Directions
              </NeonButton>
            </a>
            <NeonButton variant="ghost" size="sm">
              <RefreshCw className="w-3.5 h-3.5" />Refresh Pass
            </NeonButton>
          </div>
        </GlassCard>
      </div>

      {/* RIGHT — Pass info summary */}
      <div className="lg:w-64 flex flex-col gap-3">
        <GlassCard className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-status-confirmed" />
            <span className="text-sm font-heading font-semibold">Booking Summary</span>
          </div>
          <SummaryRow label="Date" value={MOCK_BOOKING.date} />
          <SummaryRow label="Slot" value={`${MOCK_BOOKING.floor} – ${MOCK_BOOKING.slot}`} />
          <SummaryRow label="EV Charge" value={MOCK_BOOKING.kWh} accent="emerald" />
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="text-sm text-muted">Total Paid</span>
            <span className="font-mono font-bold text-accent-cyan text-glow">{MOCK_BOOKING.amount}</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 space-y-2">
          <p className="text-xs font-heading font-semibold text-muted uppercase tracking-wider">Entry Instructions</p>
          <ol className="space-y-2">
            {[
              "Proceed to L3 EV Fast-Charge Zone",
              "Scan QR at kiosk or show to guard",
              "Wait for barrier clearance (avg 4s)",
              "Plug in to bay L3-03 charging unit",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted">
                <span className="font-mono text-accent-cyan/70 shrink-0">{String(i + 1).padStart(2, "0")}.</span>
                {step}
              </li>
            ))}
          </ol>
        </GlassCard>
      </div>
    </div>
  );
}

function DetailCell({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1 text-muted">
        {icon}
        <span className="text-[10px] hud-label">{label}</span>
      </div>
      <p className="text-xs font-medium text-foreground">{children}</p>
    </div>
  );
}

function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: "emerald" }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className={`font-mono ${accent === "emerald" ? "text-emerald-400" : "text-foreground"}`}>{value}</span>
    </div>
  );
}
