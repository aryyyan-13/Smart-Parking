"use client";

import { useEffect, useRef } from "react";
import { Zap, AlertTriangle, Activity, ToggleLeft, ToggleRight, Wifi } from "lucide-react";
import GlassCard from "@web/components/ui/GlassCard";
import { useIotSimStore, getFloorStats, type SlotStatus, type SimSpeed } from "@web/lib/iot-simulation-store";

/* ── Slot status colors ───────────────────────────────────── */
const STATUS_COLORS: Record<SlotStatus, string> = {
  available: "bg-status-available",
  occupied: "bg-status-occupied",
  "ev-charging": "bg-emerald-400",
  "ev-fault": "bg-status-cancelled",
  reserved: "bg-status-pending",
};

const STATUS_LABELS: Record<SlotStatus, string> = {
  available: "Free",
  occupied: "Occ",
  "ev-charging": "EV⚡",
  "ev-fault": "FAULT",
  reserved: "Res",
};

/* ── Speed selector button ────────────────────────────────── */
const SPEED_OPTIONS: SimSpeed[] = ["paused", "0.5x", "1x", "2x", "5x"];

/* ── Heatmap colour for occupancy % ─────────────────────────── */
function heatColor(pct: number) {
  if (pct < 40) return "bg-status-available/20 border-status-available/40";
  if (pct < 70) return "bg-status-pending/20 border-status-pending/40";
  return "bg-status-cancelled/20 border-status-cancelled/40";
}

/* ── IoT Sandbox Widget ───────────────────────────────────── */
export default function IoTSandboxWidget() {
  const {
    floors, speed, rushHour, telemetryLog,
    setSpeed, toggleRushHour, triggerEVFault, clearEVFault,
    manualToggleSlot, tick,
  } = useIotSimStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Drive simulation ticks
  useEffect(() => {
    const INTERVALS: Record<SimSpeed, number> = {
      paused: 0, "0.5x": 4000, "1x": 2000, "2x": 1000, "5x": 400,
    };
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (speed !== "paused") {
      intervalRef.current = setInterval(tick, INTERVALS[speed]);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [speed, tick]);

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto no-scrollbar">
      {/* Header controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="hud-label">Sim Speed</span>
          <div className="flex items-center gap-1">
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all duration-200 cursor-pointer ${
                  speed === s
                    ? "bg-accent-cyan/20 border border-accent-cyan/50 text-accent-cyan shadow-[0_0_8px_rgba(0,255,255,0.2)]"
                    : "bg-bg-elevated border border-border text-muted hover:text-foreground"
                }`}
              >
                {s === "paused" ? "⏸" : s}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={toggleRushHour}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer ${
            rushHour
              ? "bg-status-cancelled/15 border-status-cancelled/40 text-status-cancelled animate-pulse"
              : "bg-bg-elevated border-border text-muted hover:text-foreground"
          }`}
        >
          {rushHour ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
          Rush Hour
        </button>

        <div className="flex items-center gap-1.5 ml-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-status-available animate-pulse" />
          <span className="text-xs text-muted font-mono">{speed !== "paused" ? "LIVE" : "PAUSED"}</span>
          <Wifi className="w-3 h-3 text-accent-cyan" />
        </div>
      </div>

      {/* Floor heatmaps + slot grid */}
      <div className="grid lg:grid-cols-3 gap-3">
        {floors.map((floor) => {
          const stats = getFloorStats(floor);
          return (
            <GlassCard key={floor.id} className="p-3 space-y-3">
              {/* Floor header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-heading font-semibold text-foreground">{floor.label}</p>
                  <p className="text-[10px] text-muted font-mono">{stats.available}/{stats.total} free</p>
                </div>
                {/* Heatmap bar */}
                <div className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold ${heatColor(stats.pct)}`}>
                  {stats.pct}%
                </div>
              </div>

              {/* Occupancy bar */}
              <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    stats.pct < 40 ? "bg-status-available" : stats.pct < 70 ? "bg-status-pending" : "bg-status-cancelled"
                  }`}
                  style={{ width: `${stats.pct}%` }}
                />
              </div>

              {/* EV stats */}
              {floor.type !== "standard" && (
                <div className="flex items-center gap-3 text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Zap className="w-3 h-3" />{stats.evCharging} charging
                  </span>
                  {stats.faults > 0 && (
                    <span className="flex items-center gap-1 text-status-cancelled">
                      <AlertTriangle className="w-3 h-3" />{stats.faults} fault
                    </span>
                  )}
                </div>
              )}

              {/* Slot grid — clickable */}
              <div className="grid grid-cols-5 gap-1">
                {floor.slots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => {
                      if (slot.status === "ev-fault") {
                        clearEVFault(floor.id, slot.id);
                      } else if (slot.isEV && slot.status === "available") {
                        // For EV slots, allow fault injection via context
                        manualToggleSlot(floor.id, slot.id);
                      } else {
                        manualToggleSlot(floor.id, slot.id);
                      }
                    }}
                    title={`${slot.label}: ${STATUS_LABELS[slot.status]}${slot.plate ? ` — ${slot.plate}` : ""}${slot.kwDelivered !== undefined ? ` — ${slot.kwDelivered.toFixed(1)}kWh` : ""}`}
                    className={`
                      relative h-6 rounded-sm border cursor-pointer transition-all duration-300
                      hover:scale-110 hover:z-10 hover:shadow-lg
                      ${STATUS_COLORS[slot.status]} border-current/30
                      ${slot.status === "ev-charging" ? "animate-[pulse_2s_ease-in-out_infinite]" : ""}
                      ${slot.status === "ev-fault" ? "animate-[ping_1s_ease-in-out_infinite] opacity-70" : ""}
                      ${slot.manualOverride ? "ring-1 ring-accent-blue/60" : ""}
                    `}
                    aria-label={`${slot.label}: ${STATUS_LABELS[slot.status]}`}
                  >
                    <span className="sr-only">{slot.label}</span>
                  </button>
                ))}
              </div>

              {/* EV fault controls */}
              {floor.type !== "standard" && (
                <div className="flex flex-wrap gap-1">
                  {floor.slots.filter(s => s.isEV && s.status !== "ev-fault").slice(0, 2).map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => triggerEVFault(floor.id, slot.id)}
                      className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-status-cancelled/10 border border-status-cancelled/30 text-status-cancelled hover:bg-status-cancelled/20 transition-colors cursor-pointer"
                    >
                      ⚠ Fault {slot.label}
                    </button>
                  ))}
                </div>
              )}
            </GlassCard>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-1">
        {(Object.entries(STATUS_LABELS) as [SlotStatus, string][]).map(([st, label]) => (
          <div key={st} className="flex items-center gap-1.5 text-[11px] text-muted">
            <span className={`w-2.5 h-2.5 rounded-sm ${STATUS_COLORS[st]}`} />
            {label}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-[11px] text-muted">
          <span className="w-2.5 h-2.5 rounded-sm border border-accent-blue/60" />
          Manual Override
        </div>
      </div>

      {/* Telemetry log */}
      <GlassCard className="p-3 flex-1 min-h-[180px] max-h-[220px] flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-accent-cyan" />
          <span className="hud-label">Telemetry Feed</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 no-scrollbar">
          {telemetryLog.map((ev, i) => (
            <div key={i} className={`flex items-start gap-2 text-[11px] font-mono ${
              ev.level === "alert" ? "text-status-cancelled" : ev.level === "warn" ? "text-status-pending" : "text-muted"
            }`}>
              <span className="shrink-0 opacity-60">
                {new Date(ev.ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
              <span>{ev.message}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
