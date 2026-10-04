"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Clock, Car, MapPin, CreditCard, Hash } from "lucide-react";
import GlassCard from "@web/components/ui/GlassCard";
import NeonButton from "@web/components/ui/NeonButton";
import StatusBadge from "@web/components/ui/StatusBadge";
import { useParkingSessionStore } from "@web/lib/parking-session-store";

interface BookingFormProps {
  selectedSlotLabel: string | null;
  floorLabel: string;
  listingName: string;
  pricePerHour: number;
  currency?: string;
  zoneId?: string;
  onConfirm?: (duration: number) => void;
}

export default function BookingForm({
  selectedSlotLabel,
  floorLabel,
  listingName,
  pricePerHour,
  currency = "₹",
  zoneId = "L1-STD",
  onConfirm,
}: BookingFormProps) {
  const router = useRouter();
  const createBooking = useParkingSessionStore((s) => s.createBooking);

  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [vehicleType, setVehicleType] = useState<"FOUR_WHEELER" | "TWO_WHEELER">("FOUR_WHEELER");
  const [licensePlate, setLicensePlate] = useState("");
  const [fastagId, setFastagId] = useState("");

  const duration = useMemo(() => {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const diff = endMin - startMin;
    return diff > 0 ? diff / 60 : 0;
  }, [startTime, endTime]);

  const totalPrice = (duration * pricePerHour).toFixed(2);

  // Auto-generate a demo FASTag ID from the plate number
  const handlePlateChange = (val: string) => {
    setLicensePlate(val);
    if (!fastagId || fastagId.startsWith("FAST-")) {
      const clean = val.replace(/\s/g, "").toUpperCase();
      setFastagId(clean ? `FAST-${clean}` : "");
    }
  };

  const handleConfirm = () => {
    const plate = licensePlate.trim() || "KA 01 EQ 5678";
    const fid = fastagId.trim() || `FAST-${plate.replace(/\s/g, "").toUpperCase()}`;

    // Register session in the store — zone label derived from floorLabel
    const sessionId = createBooking({
      licensePlate: plate,
      fastagId: fid,
      vehicleType,
      location: listingName,
      zoneId,
      zoneLabel: floorLabel,
      pricePerHour,
      durationHours: duration > 0 ? duration : 2,
    });

    if (onConfirm) {
      onConfirm(duration);
    } else {
      router.push(`/booking/confirmation?sid=${sessionId}`);
    }
  };

  const canBook = !!selectedSlotLabel && duration > 0;

  return (
    <GlassCard className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-heading text-lg font-semibold">Book a Spot</h3>
        <p className="text-sm text-muted mt-1">{listingName}</p>
      </div>

      {/* Selected slot info */}
      <div className="space-y-2">
        <label className="hud-label">Selected Zone / Slot</label>
        {selectedSlotLabel ? (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20">
            <MapPin className="w-4 h-4 text-accent-cyan" />
            <span className="font-mono text-sm font-medium text-accent-cyan">
              {floorLabel} — {selectedSlotLabel}
            </span>
            <StatusBadge status="available" dot className="ml-auto" />
          </div>
        ) : (
          <div className="px-3 py-2.5 rounded-lg bg-surface-glass border border-border text-sm text-muted">
            Click a slot in the 3D viewer to select
          </div>
        )}
      </div>

      {/* Vehicle Plate */}
      <div className="space-y-1.5">
        <label htmlFor="license-plate" className="hud-label">License Plate Number</label>
        <div className="relative">
          <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" aria-hidden="true" />
          <input
            id="license-plate"
            type="text"
            placeholder="e.g. KA 01 EQ 5678"
            value={licensePlate}
            onChange={(e) => handlePlateChange(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-bg-elevated border border-border text-sm font-mono text-foreground placeholder:text-muted/50 focus:border-accent-cyan/50 focus:outline-none transition-colors uppercase"
          />
        </div>
      </div>

      {/* FASTag ID */}
      <div className="space-y-1.5">
        <label htmlFor="fastag-id" className="hud-label flex items-center gap-1.5">
          <CreditCard className="w-3 h-3 text-accent-cyan" />
          FASTag ID
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 ml-auto">
            NPCI NETC
          </span>
        </label>
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" aria-hidden="true" />
          <input
            id="fastag-id"
            type="text"
            placeholder="Auto-generated from plate"
            value={fastagId}
            onChange={(e) => setFastagId(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-bg-elevated border border-border text-sm font-mono text-foreground placeholder:text-muted/50 focus:border-accent-cyan/50 focus:outline-none transition-colors"
          />
        </div>
        <p className="text-[10px] text-muted font-mono">
          Used for automatic barrier entry / exit and FASTag wallet auto-debit on exit.
        </p>
      </div>

      {/* Time selection */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="start-time" className="hud-label">Start Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" aria-hidden="true" />
            <input
              id="start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-bg-elevated border border-border text-sm font-mono text-foreground focus:border-accent-cyan/50 focus:outline-none transition-colors [color-scheme:dark]"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="end-time" className="hud-label">End Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" aria-hidden="true" />
            <input
              id="end-time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-bg-elevated border border-border text-sm font-mono text-foreground focus:border-accent-cyan/50 focus:outline-none transition-colors [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* Vehicle type */}
      <div className="space-y-1.5">
        <label className="hud-label">Vehicle Type</label>
        <div className="grid grid-cols-2 gap-2">
          {(["FOUR_WHEELER", "TWO_WHEELER"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setVehicleType(type)}
              className={`
                flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-200 cursor-pointer
                ${
                  vehicleType === type
                    ? "bg-accent-cyan/15 border border-accent-cyan/40 text-accent-cyan"
                    : "bg-bg-elevated border border-border text-muted hover:text-foreground hover:border-accent-cyan/20"
                }
              `}
            >
              <Car className="w-4 h-4" />
              {type === "FOUR_WHEELER" ? "4 Wheeler" : "2 Wheeler"}
            </button>
          ))}
        </div>
      </div>

      {/* 15-min grace notice */}
      <div className="px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-300">
        ⏱ 15-min grace window: Your zone slot is held for 15 minutes after the scheduled start. Drive in within that window to keep your reservation.
      </div>

      {/* Price breakdown */}
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Rate</span>
          <span className="font-mono">{currency}{pricePerHour.toFixed(2)}/hr</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Duration</span>
          <span className="font-mono">{duration.toFixed(1)} hrs</span>
        </div>
        <div className="flex justify-between text-base font-semibold pt-2 border-t border-border">
          <span>Estimated Total</span>
          <span className="font-mono text-accent-cyan text-glow text-lg">
            {currency}{totalPrice}
          </span>
        </div>
        <p className="text-[10px] text-muted font-mono text-right">
          Exact amount billed by FASTag auto-debit at exit
        </p>
      </div>

      {/* Book button */}
      <NeonButton
        variant="primary"
        size="lg"
        fullWidth
        pulse={canBook}
        disabled={!selectedSlotLabel || duration <= 0}
        onClick={handleConfirm}
        magnetic
      >
        {selectedSlotLabel ? "Confirm & Get FASTag Pass" : "Select a Zone Slot First"}
      </NeonButton>
    </GlassCard>
  );
}
