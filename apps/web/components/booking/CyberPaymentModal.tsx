"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  X, CreditCard, Smartphone, Zap, Tag, CheckCircle2,
  Shield, Lock, Download,
} from "lucide-react";
import NeonButton from "@web/components/ui/NeonButton";

const QRCodeDisplay = dynamic(() => import("@web/components/booking/QRCodeDisplay"), { ssr: false });

/* ── Types ────────────────────────────────────────────────── */
type PayMethod = "upi" | "card" | "netbanking";
type TxState = "idle" | "connecting" | "verifying" | "authorizing" | "confirmed" | "failed";

const EV_TIERS = [
  { label: "No EV Charging", kWh: 0, price: 0 },
  { label: "50 kW Fast — 15 kWh", kWh: 15, price: 120 },
  { label: "150 kW Ultra-Fast — 30 kWh", kWh: 30, price: 220 },
  { label: "150 kW Ultra-Fast — 50 kWh", kWh: 50, price: 340 },
];

const PROMO_CODES: Record<string, number> = {
  "CYBER2026": 20,
  "NEOEV": 15,
  "PARK10": 10,
};

const TX_STEPS: { state: TxState; label: string; duration: number }[] = [
  { state: "connecting", label: "Connecting to Secure Payment Gateway…", duration: 900 },
  { state: "verifying", label: "Verifying Cryptographic Token…", duration: 900 },
  { state: "authorizing", label: "Authorizing Transaction…", duration: 800 },
  { state: "confirmed", label: "Payment Confirmed ✓", duration: 0 },
];

/* ── CyberPaymentModal ────────────────────────────────────── */
interface CyberPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  basePrice: number;
  duration: number;
  currency?: string;
  bookingRef?: string;
  isEVSpot?: boolean;
}

export default function CyberPaymentModal({
  isOpen, onClose, basePrice, duration,
  currency = "₹", bookingRef = "BKG-20260822-C07", isEVSpot = true,
}: CyberPaymentModalProps) {
  const [method, setMethod] = useState<PayMethod>("upi");
  const [evTier, setEvTier] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ code: string; pct: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [txState, setTxState] = useState<TxState>("idle");
  const [upiId, setUpiId] = useState("");

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const parkingCost = basePrice * duration;
  const evCost = EV_TIERS[evTier].price;
  const subtotal = parkingCost + evCost;
  const discount = promoApplied ? Math.round(subtotal * promoApplied.pct / 100) : 0;
  const total = subtotal - discount;

  const handlePromo = () => {
    const code = promoCode.trim().toUpperCase();
    const pct = PROMO_CODES[code];
    if (pct) {
      setPromoApplied({ code, pct });
      setPromoError("");
    } else {
      setPromoError("Invalid promo code.");
      setPromoApplied(null);
    }
  };

  const handlePay = async () => {
    setTxState("connecting");
    for (const step of TX_STEPS) {
      await new Promise<void>((resolve) => setTimeout(resolve, step.duration));
      setTxState(step.state);
    }
  };

  const handleClose = () => {
    setTxState("idle");
    setPromoApplied(null);
    setPromoCode("");
    setPromoError("");
    onClose();
  };

  const formatCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative w-full max-w-xl bg-bg-base rounded-2xl border border-border shadow-[0_0_60px_rgba(0,255,255,0.08)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Animated border gradient */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ background: "linear-gradient(135deg, rgba(0,255,255,0.06) 0%, transparent 50%, rgba(59,130,246,0.04) 100%)" }} />

          {/* Header */}
          <div className="relative flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center">
                <Lock className="w-4 h-4 text-accent-cyan" />
              </div>
              <div>
                <h2 className="font-heading text-base font-semibold">Secure Checkout</h2>
                <p className="text-[10px] text-muted font-mono">{bookingRef}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-glass transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="relative overflow-y-auto max-h-[80vh] no-scrollbar">
            <AnimatePresence mode="wait">
              {txState === "idle" && (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="p-5 space-y-5">

                  {/* EV Charging add-on */}
                  {isEVSpot && (
                    <div className="space-y-2">
                      <label className="hud-label flex items-center gap-1.5">
                        <Zap className="w-3 h-3 text-emerald-400" />EV Fast-Charge Add-on
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {EV_TIERS.map((tier, i) => (
                          <button
                            key={i}
                            onClick={() => setEvTier(i)}
                            className={`px-3 py-2.5 rounded-lg text-xs font-medium border text-left transition-all duration-200 cursor-pointer ${
                              evTier === i
                                ? "bg-emerald-400/10 border-emerald-400/40 text-emerald-400"
                                : "bg-bg-elevated border-border text-muted hover:border-emerald-400/20"
                            }`}
                          >
                            <p className="font-semibold">{tier.label}</p>
                            {tier.price > 0 && (
                              <p className="font-mono text-[10px] mt-0.5">+{currency}{tier.price}</p>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Promo code */}
                  <div className="space-y-2">
                    <label className="hud-label flex items-center gap-1.5">
                      <Tag className="w-3 h-3" />Promo Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => { setPromoCode(e.target.value); setPromoError(""); }}
                        placeholder="e.g. CYBER2026"
                        className="flex-1 px-3 py-2.5 rounded-lg bg-bg-elevated border border-border text-sm font-mono text-foreground placeholder:text-muted/40 focus:border-accent-cyan/50 focus:outline-none uppercase transition-colors"
                      />
                      <NeonButton variant="ghost" size="md" onClick={handlePromo}>Apply</NeonButton>
                    </div>
                    {promoApplied && (
                      <p className="text-xs text-status-confirmed flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />{promoApplied.code} — {promoApplied.pct}% off applied!
                      </p>
                    )}
                    {promoError && <p className="text-xs text-status-cancelled">{promoError}</p>}
                    <p className="text-[10px] text-muted">Try: CYBER2026, NEOEV, PARK10</p>
                  </div>

                  {/* Price breakdown */}
                  <div className="rounded-xl bg-bg-elevated border border-border p-4 space-y-2.5">
                    <PriceLine label="Parking" value={`${currency}${parkingCost.toFixed(0)}`} />
                    {evCost > 0 && <PriceLine label={`EV Charge (${EV_TIERS[evTier].kWh} kWh)`} value={`${currency}${evCost}`} accent="emerald" />}
                    {discount > 0 && <PriceLine label={`Promo (${promoApplied?.pct}%)`} value={`-${currency}${discount}`} accent="confirmed" />}
                    <div className="border-t border-border pt-2 flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-mono font-bold text-xl text-accent-cyan text-glow">{currency}{total}</span>
                    </div>
                  </div>

                  {/* Payment method */}
                  <div className="space-y-3">
                    <label className="hud-label">Payment Method</label>
                    <div className="flex gap-2">
                      {(["upi", "card", "netbanking"] as PayMethod[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => setMethod(m)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                            method === m
                              ? "bg-accent-cyan/15 border-accent-cyan/40 text-accent-cyan"
                              : "bg-bg-elevated border-border text-muted hover:text-foreground"
                          }`}
                        >
                          {m === "upi" && <Smartphone className="w-3.5 h-3.5" />}
                          {m === "card" && <CreditCard className="w-3.5 h-3.5" />}
                          {m === "netbanking" && <Shield className="w-3.5 h-3.5" />}
                          {m === "upi" ? "UPI" : m === "card" ? "Card" : "Net Banking"}
                        </button>
                      ))}
                    </div>

                    {/* UPI form */}
                    {method === "upi" && (
                      <div className="space-y-3">
                        <div className="flex gap-3 items-start">
                          <div className="flex-1 space-y-1.5">
                            <label className="hud-label">UPI ID</label>
                            <input
                              type="text" value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="yourname@upi"
                              className="w-full px-3 py-2.5 rounded-lg bg-bg-elevated border border-border text-sm font-mono text-foreground placeholder:text-muted/40 focus:border-accent-cyan/50 focus:outline-none transition-colors"
                            />
                          </div>
                          <div className="shrink-0 mt-5">
                            <div className="p-2 rounded-lg bg-white">
                              <QRCodeDisplay value={`upi://pay?pa=smartpark@upi&am=${total}`} size={64} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card form */}
                    {method === "card" && (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="hud-label">Card Number</label>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                            <input
                              type="text" value={cardNumber}
                              onChange={(e) => setCardNumber(formatCard(e.target.value))}
                              placeholder="4242 4242 4242 4242"
                              className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-bg-elevated border border-border text-sm font-mono text-foreground placeholder:text-muted/40 focus:border-accent-cyan/50 focus:outline-none transition-colors"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="hud-label">Expiry</label>
                            <input
                              type="text" value={cardExpiry}
                              onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                              placeholder="MM/YY"
                              className="w-full px-3 py-2.5 rounded-lg bg-bg-elevated border border-border text-sm font-mono text-foreground placeholder:text-muted/40 focus:border-accent-cyan/50 focus:outline-none transition-colors"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="hud-label">CVV</label>
                            <input
                              type="password" value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.slice(0, 3))}
                              placeholder="•••"
                              className="w-full px-3 py-2.5 rounded-lg bg-bg-elevated border border-border text-sm font-mono text-foreground placeholder:text-muted/40 focus:border-accent-cyan/50 focus:outline-none transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Net banking */}
                    {method === "netbanking" && (
                      <div className="grid grid-cols-2 gap-2">
                        {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "Yes Bank"].map((bank) => (
                          <button
                            key={bank}
                            className="py-2 px-3 rounded-lg bg-bg-elevated border border-border text-sm text-muted hover:text-foreground hover:border-accent-cyan/30 transition-colors cursor-pointer"
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pay button */}
                  <NeonButton variant="primary" size="lg" fullWidth pulse onClick={handlePay}>
                    <Lock className="w-4 h-4" />
                    Pay {currency}{total} Securely
                  </NeonButton>

                  <p className="text-center text-[10px] text-muted flex items-center justify-center gap-1.5">
                    <Shield className="w-3 h-3" />
                    256-bit encrypted · PCI-DSS compliant · Powered by SmartPay
                  </p>
                </motion.div>
              )}

              {/* Transaction processing */}
              {(txState === "connecting" || txState === "verifying" || txState === "authorizing") && (
                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="p-10 flex flex-col items-center gap-6">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-2 border-accent-cyan/20 border-t-accent-cyan animate-spin" />
                    <div className="absolute inset-2 rounded-full border border-accent-blue/20 border-b-accent-blue animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.7s" }} />
                    <Lock className="absolute inset-0 m-auto w-7 h-7 text-accent-cyan" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-heading text-base font-semibold text-accent-cyan">Processing…</p>
                    <p className="text-sm text-muted">{TX_STEPS.find(s => s.state === txState)?.label}</p>
                  </div>
                  <div className="flex gap-2">
                    {TX_STEPS.slice(0, -1).map((step, i) => (
                      <div key={i} className={`h-1 rounded-full transition-all duration-500 ${
                        TX_STEPS.findIndex(s => s.state === txState) >= i
                          ? "w-12 bg-accent-cyan"
                          : "w-6 bg-border"
                      }`} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Confirmed */}
              {txState === "confirmed" && (
                <motion.div key="confirmed"
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  className="p-8 flex flex-col items-center gap-5 text-center">
                  <motion.div
                    className="w-24 h-24 rounded-full bg-status-confirmed/15 border-2 border-status-confirmed/50 flex items-center justify-center"
                    style={{ boxShadow: "0 0 50px rgba(34,197,94,0.25)" }}
                    animate={{ boxShadow: ["0 0 30px rgba(34,197,94,0.15)", "0 0 60px rgba(34,197,94,0.35)", "0 0 30px rgba(34,197,94,0.15)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <CheckCircle2 className="w-12 h-12 text-status-confirmed" strokeWidth={1.5} />
                  </motion.div>

                  <div>
                    <h3 className="font-heading text-2xl font-bold">Payment Confirmed!</h3>
                    <p className="text-muted mt-1">Booking {bookingRef} is active</p>
                    <p className="font-mono text-sm text-accent-cyan mt-2 text-glow">{currency}{total}</p>
                  </div>

                  {/* Receipt preview */}
                  <div className="w-full rounded-xl bg-bg-elevated border border-border p-4 text-left space-y-2">
                    <p className="hud-label">Receipt Summary</p>
                    <PriceLine label="Parking" value={`${currency}${parkingCost.toFixed(0)}`} />
                    {evCost > 0 && <PriceLine label={`EV Charge (${EV_TIERS[evTier].kWh} kWh)`} value={`${currency}${evCost}`} accent="emerald" />}
                    {discount > 0 && <PriceLine label="Promo Discount" value={`-${currency}${discount}`} accent="confirmed" />}
                    <div className="border-t border-border pt-2 flex justify-between font-semibold">
                      <span>Total Paid</span>
                      <span className="font-mono text-accent-cyan">{currency}{total}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full">
                    <NeonButton variant="primary" size="md" fullWidth onClick={handleClose}>
                      View My Pass
                    </NeonButton>
                    <NeonButton variant="ghost" size="md">
                      <Download className="w-4 h-4" />
                    </NeonButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function PriceLine({ label, value, accent }: { label: string; value: string; accent?: "emerald" | "confirmed" }) {
  const colorMap = { emerald: "text-emerald-400", confirmed: "text-status-confirmed" };
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className={`font-mono ${accent ? colorMap[accent] : "text-foreground"}`}>{value}</span>
    </div>
  );
}
