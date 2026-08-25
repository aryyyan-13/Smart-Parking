"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Clock, Car, MapPin } from "lucide-react";
import GlassCard from "@web/components/ui/GlassCard";
import NeonButton from "@web/components/ui/NeonButton";
import StatusBadge from "@web/components/ui/StatusBadge";

interface BookingFormProps {
  selectedSlotLabel: string | null;
  floorLabel: string;
  listingName: string;
  pricePerHour: number;
  currency?: string;
  onConfirm?: (duration: number) => void;
}

export default function BookingForm({
  selectedSlotLabel,
  floorLabel,
  listingName,
  pricePerHour,
  currency = "₹",
  onConfirm,
}: BookingFormProps) {
  const router = useRouter();
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [vehicleType, setVehicleType] = useState<"FOUR_WHEELER" | "TWO_WHEELER">("FOUR_WHEELER");

  const duration = useMemo(() => {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const diff = endMin - startMin;
    return diff > 0 ? diff / 60 : 0;
  }, [startTime, endTime]);

  const totalPrice = (duration * pricePerHour).toFixed(2);

  return (
    <GlassCard className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-heading text-lg font-semibold">Book a Spot</h3>
        <p className="text-sm text-muted mt-1">{listingName}</p>
      </div>

      {/* Selected slot info */}
      <div className="space-y-2">
        <label className="hud-label">Selected Slot</label>
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
          <span>Total</span>
          <span className="font-mono text-accent-cyan text-glow text-lg">
            {currency}{totalPrice}
          </span>
        </div>
      </div>

      {/* Book button */}
      <NeonButton
        variant="primary"
        size="lg"
        fullWidth
        pulse={!!selectedSlotLabel}
        disabled={!selectedSlotLabel || duration <= 0}
        onClick={() => {
          if (onConfirm) {
            onConfirm(duration);
          } else {
            router.push("/booking/confirmation");
          }
        }}
      >
        {selectedSlotLabel ? "Confirm Booking" : "Select a Slot First"}
      </NeonButton>
    </GlassCard>
  );
}
