"use client";

import { MapPin, Navigation, Maximize2 } from "lucide-react";
import GlassCard from "@web/components/ui/GlassCard";

interface MiniMapWidgetProps {
  locationName?: string;
  address?: string;
  className?: string;
  onExpand?: () => void;
}

export default function MiniMapWidget({
  locationName = "Metro Central Parking",
  address = "123 Downtown Blvd",
  className = "",
  onExpand,
}: MiniMapWidgetProps) {
  return (
    <GlassCard
      className={`p-3 relative overflow-hidden group w-48 sm:w-56 ${className}`}
      glow
    >
      {/* Background mini map grid simulation */}
      <div className="absolute inset-0 bg-bg-base/90">
        <div className="absolute inset-0 bg-grid opacity-40" />
        {/* Animated radar/sonar scan effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-accent-cyan/20 animate-ping opacity-20 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-accent-cyan/40 pointer-events-none" />
      </div>

      {/* Foreground content */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-accent-cyan">
            <Navigation className="w-3.5 h-3.5 animate-pulse" />
            <span className="hud-label text-[10px] text-accent-cyan font-bold tracking-wider">
              MAP INSET
            </span>
          </div>

          {onExpand && (
            <button
              onClick={onExpand}
              className="p-1 rounded hover:bg-surface-glass text-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Expand map"
              title="Expand map"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Pin marker visualization */}
        <div className="flex items-center gap-2 pt-1">
          <div className="w-7 h-7 rounded-lg bg-accent-cyan/20 border border-accent-cyan/40 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,255,255,0.3)]">
            <MapPin className="w-4 h-4 text-accent-cyan" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate text-foreground">{locationName}</p>
            <p className="text-[10px] text-muted truncate">{address}</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
