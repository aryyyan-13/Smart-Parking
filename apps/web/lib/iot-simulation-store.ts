/**
 * IoT Simulation Store
 * Zustand store managing simulated parking bay states across 3 floors.
 * All state transitions happen client-side; no real sensors or network.
 */

import { create } from "zustand";

/* ── Types ────────────────────────────────────────────────── */

export type SlotStatus = "available" | "occupied" | "ev-charging" | "ev-fault" | "reserved";
export type SimSpeed = "paused" | "0.5x" | "1x" | "2x" | "5x";

export interface SimSlot {
  id: string;
  label: string;
  status: SlotStatus;
  isEV: boolean;
  /** If occupied or charging, simulated vehicle plate */
  plate?: string;
  /** kW delivered (only for ev-charging) */
  kwDelivered?: number;
  manualOverride: boolean;
}

export interface SimFloor {
  id: string;
  label: string;
  type: "standard" | "compact-ev" | "premium-ev";
  slots: SimSlot[];
}

export interface TelemetryEvent {
  ts: number;
  level: "info" | "warn" | "alert";
  message: string;
}

export interface IotSimState {
  floors: SimFloor[];
  speed: SimSpeed;
  rushHour: boolean;
  globalFault: boolean;
  telemetryLog: TelemetryEvent[];
  tickCount: number;

  // Actions
  setSpeed: (s: SimSpeed) => void;
  toggleRushHour: () => void;
  triggerEVFault: (floorId: string, slotId: string) => void;
  clearEVFault: (floorId: string, slotId: string) => void;
  manualToggleSlot: (floorId: string, slotId: string) => void;
  tick: () => void;
  addLog: (msg: string, level?: TelemetryEvent["level"]) => void;
}

/* ── Helpers ──────────────────────────────────────────────── */

const PLATES = [
  "MH-12-AB-1234", "KA-01-EQ-5678", "DL-08-CX-9900",
  "TN-22-ZY-3344", "GJ-05-NN-0011", "UP-78-DD-5566",
  "RJ-14-AK-8800", "WB-02-BN-7755",
];
const randomPlate = () => PLATES[Math.floor(Math.random() * PLATES.length)];

function makeSlot(id: string, label: string, status: SlotStatus, isEV = false): SimSlot {
  return {
    id,
    label,
    status,
    isEV,
    plate: status === "occupied" || status === "ev-charging" ? randomPlate() : undefined,
    kwDelivered: status === "ev-charging" ? Math.round(Math.random() * 40) : undefined,
    manualOverride: false,
  };
}

function buildInitialFloors(): SimFloor[] {
  return [
    {
      id: "floor-1",
      label: "L1 — Standard",
      type: "standard",
      slots: [
        makeSlot("L1-01", "L1-01", "occupied"),
        makeSlot("L1-02", "L1-02", "available"),
        makeSlot("L1-03", "L1-03", "occupied"),
        makeSlot("L1-04", "L1-04", "available"),
        makeSlot("L1-05", "L1-05", "available"),
        makeSlot("L1-06", "L1-06", "reserved"),
        makeSlot("L1-07", "L1-07", "occupied"),
        makeSlot("L1-08", "L1-08", "available"),
        makeSlot("L1-09", "L1-09", "available"),
        makeSlot("L1-10", "L1-10", "occupied"),
      ],
    },
    {
      id: "floor-2",
      label: "L2 — Compact & EV",
      type: "compact-ev",
      slots: [
        makeSlot("L2-01", "L2-01", "ev-charging", true),
        makeSlot("L2-02", "L2-02", "available", true),
        makeSlot("L2-03", "L2-03", "ev-charging", true),
        makeSlot("L2-04", "L2-04", "available", true),
        makeSlot("L2-05", "L2-05", "occupied"),
        makeSlot("L2-06", "L2-06", "available"),
        makeSlot("L2-07", "L2-07", "occupied"),
        makeSlot("L2-08", "L2-08", "available"),
        makeSlot("L2-09", "L2-09", "available", true),
        makeSlot("L2-10", "L2-10", "ev-charging", true),
      ],
    },
    {
      id: "floor-3",
      label: "L3 — Premium EV Fast Charge",
      type: "premium-ev",
      slots: [
        makeSlot("L3-01", "L3-01", "ev-charging", true),
        makeSlot("L3-02", "L3-02", "ev-charging", true),
        makeSlot("L3-03", "L3-03", "available", true),
        makeSlot("L3-04", "L3-04", "available", true),
        makeSlot("L3-05", "L3-05", "ev-charging", true),
        makeSlot("L3-06", "L3-06", "available", true),
        makeSlot("L3-07", "L3-07", "ev-fault", true),
        makeSlot("L3-08", "L3-08", "available", true),
      ],
    },
  ];
}

/* ── Store ────────────────────────────────────────────────── */

export const useIotSimStore = create<IotSimState>((set, get) => ({
  floors: buildInitialFloors(),
  speed: "1x",
  rushHour: false,
  globalFault: false,
  telemetryLog: [
    { ts: Date.now(), level: "info", message: "IoT simulation network online. 28 sensors nominal." },
  ],
  tickCount: 0,

  setSpeed: (s) => set({ speed: s }),

  toggleRushHour: () => {
    const current = get().rushHour;
    const msg = current
      ? "Rush-hour mode disabled. Traffic returning to baseline."
      : "⚡ RUSH HOUR ACTIVATED — High inbound traffic spike detected on all levels.";
    get().addLog(msg, current ? "info" : "alert");
    set({ rushHour: !current });
  },

  triggerEVFault: (floorId, slotId) => {
    set((state) => ({
      floors: state.floors.map((f) =>
        f.id !== floorId ? f : {
          ...f,
          slots: f.slots.map((s) =>
            s.id !== slotId ? s : { ...s, status: "ev-fault", plate: undefined, kwDelivered: undefined }
          ),
        }
      ),
    }));
    get().addLog(`⚠ EV fault triggered on sensor ${slotId}. Maintenance alert dispatched.`, "warn");
  },

  clearEVFault: (floorId, slotId) => {
    set((state) => ({
      floors: state.floors.map((f) =>
        f.id !== floorId ? f : {
          ...f,
          slots: f.slots.map((s) =>
            s.id !== slotId ? s : { ...s, status: "available", manualOverride: false }
          ),
        }
      ),
    }));
    get().addLog(`✔ EV fault on ${slotId} cleared. Sensor back online.`, "info");
  },

  manualToggleSlot: (floorId, slotId) => {
    set((state) => ({
      floors: state.floors.map((f) => {
        if (f.id !== floorId) return f;
        return {
          ...f,
          slots: f.slots.map((s) => {
            if (s.id !== slotId) return s;
            const next: SlotStatus =
              s.status === "available" ? "occupied"
              : s.status === "occupied" ? "available"
              : s.status === "ev-charging" ? "available"
              : "available";
            return {
              ...s,
              status: next,
              manualOverride: true,
              plate: next === "occupied" ? randomPlate() : undefined,
              kwDelivered: undefined,
            };
          }),
        };
      }),
    }));
    get().addLog(`Manual override applied to sensor ${slotId}.`, "info");
  },

  addLog: (message, level = "info") => {
    set((state) => ({
      telemetryLog: [
        { ts: Date.now(), level, message },
        ...state.telemetryLog.slice(0, 49), // keep last 50
      ],
    }));
  },

  tick: () => {
    const { rushHour, addLog } = get();
    // Arrival probability per slot per tick
    const arrivalProb = rushHour ? 0.35 : 0.12;
    const departureProb = rushHour ? 0.08 : 0.18;

    set((state) => {
      const updated = state.floors.map((floor) => ({
        ...floor,
        slots: floor.slots.map((slot) => {
          if (slot.manualOverride || slot.status === "ev-fault" || slot.status === "reserved") return slot;

          const r = Math.random();

          if (slot.status === "available" && r < arrivalProb) {
            const newStatus: SlotStatus = slot.isEV && Math.random() < 0.7 ? "ev-charging" : "occupied";
            return {
              ...slot,
              status: newStatus,
              plate: randomPlate(),
              kwDelivered: newStatus === "ev-charging" ? 0 : undefined,
            } satisfies SimSlot;
          }

          if ((slot.status === "occupied" || slot.status === "ev-charging") && r < departureProb) {
            return { ...slot, status: "available" as SlotStatus, plate: undefined, kwDelivered: undefined } satisfies SimSlot;
          }

          // Increment kW delivered for ev-charging
          if (slot.status === "ev-charging" && slot.kwDelivered !== undefined) {
            return { ...slot, kwDelivered: Math.min(slot.kwDelivered + Math.random() * 2, 80) } satisfies SimSlot;
          }

          return slot;
        }),
      }));

      return { floors: updated, tickCount: state.tickCount + 1 };
    });

    // Occasional log events
    if (Math.random() < 0.12) {
      const msgs = [
        "Vehicle arrived on L1. Bay L1-02 now occupied.",
        "EV fast-charge completed on L3-05. Vehicle departed.",
        "Ultrasonic sensor ping: L2-07 cleared.",
        "Camera feed: L1-03 vehicle detected.",
        "L3 EV station energy draw: 47.2 kW aggregate.",
        "Barrier gate cycle — entry authorized: KA-01-EQ-5678.",
      ];
      addLog(msgs[Math.floor(Math.random() * msgs.length)], "info");
    }
  },
}));

/* ── Timer hook — drives simulation ticks ─────────────────── */
export function useIotSimTimer() {
  const { speed, tick } = useIotSimStore();

  // This is imported by the HUD component which mounts the timer
  return { speed, tick };
}

/* ── Occupancy stats helper ───────────────────────────────── */
export function getFloorStats(floor: SimFloor) {
  const total = floor.slots.length;
  const occupied = floor.slots.filter((s) => s.status === "occupied" || s.status === "ev-charging").length;
  const available = floor.slots.filter((s) => s.status === "available").length;
  const evCharging = floor.slots.filter((s) => s.status === "ev-charging").length;
  const faults = floor.slots.filter((s) => s.status === "ev-fault").length;
  const pct = Math.round((occupied / total) * 100);
  return { total, occupied, available, evCharging, faults, pct };
}
