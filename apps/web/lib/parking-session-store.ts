/**
 * parking-session-store.ts
 *
 * Unified reactive store for the full FASTag parking lifecycle:
 *   1. Advance Booking → zone allotment + 15-min grace queue
 *   2. FASTag Entry  → barrier simulation, entry timestamp
 *   3. Live Meter    → real-time elapsed + accrued fare
 *   4. FASTag Exit   → duration calculation + auto-debit receipt
 *   5. Manager End   → admin force-terminate + audit log entry
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ── Types ──────────────────────────────────────────────────── */

export type SessionStatus =
  | "booked"        // Advance booking created, vehicle not yet entered
  | "grace_expired" // 15-min grace window passed without entry
  | "active"        // Vehicle inside, meter running
  | "completed"     // FASTag exit processed, receipt settled
  | "manager_ended";// Force-terminated by parking manager

export type SettlementMethod = "fastag_auto_debit" | "manager_override" | "pending";

export interface ZoneCapacity {
  zoneId: string;
  label: string;       // e.g. "Level 1 — Standard"
  total: number;
  occupied: number;
}

export interface AuditEntry {
  ts: number;
  level: "info" | "warn" | "error";
  message: string;
}

export interface ParkingSession {
  id: string;               // e.g. BKG-20260907-A12
  fastagId: string;         // e.g. FAST-KA01EQ5678
  licensePlate: string;     // e.g. KA 01 EQ 5678
  vehicleType: "FOUR_WHEELER" | "TWO_WHEELER";
  location: string;
  zoneId: string;
  zoneLabel: string;
  pricePerHour: number;     // INR
  bookedStart: number;      // epoch ms — scheduled start
  bookedEnd: number;        // epoch ms — scheduled end
  entryTime: number | null; // epoch ms — actual FASTag gate scan
  exitTime: number | null;  // epoch ms — actual FASTag exit scan
  status: SessionStatus;
  settlement: SettlementMethod;
  finalAmountINR: number | null;
  receiptId: string | null;
  managerNote?: string;
}

export interface ParkingSessionState {
  sessions: ParkingSession[];
  zones: ZoneCapacity[];
  auditLog: AuditEntry[];

  /* Actions */
  createBooking: (params: {
    licensePlate: string;
    fastagId: string;
    vehicleType: "FOUR_WHEELER" | "TWO_WHEELER";
    location: string;
    zoneId: string;
    zoneLabel: string;
    pricePerHour: number;
    durationHours: number;
  }) => string; // returns session ID

  simulateFastagEntry: (sessionId: string) => void;
  simulateFastagExit: (sessionId: string) => void;
  managerEndTrip: (sessionId: string, note: string) => void;
  extendSession: (sessionId: string, extraMinutes: number) => void;
  expireGracePeriod: (sessionId: string) => void;
  clearHistory: () => void;

  /* Computed helpers */
  getActiveSession: () => ParkingSession | null;
  getActiveSessions: () => ParkingSession[];
  getElapsedSeconds: (session: ParkingSession) => number;
  getAccruedFare: (session: ParkingSession) => number;
}

/* ── Helpers ────────────────────────────────────────────────── */

function genBookingId(): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `BKG-${datePart}-${suffix}`;
}

function genReceiptId(): string {
  return `RCP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
}

function genFastagId(plate: string): string {
  const clean = plate.replace(/\s/g, "").toUpperCase();
  return `FAST-${clean}`;
}

function calcFare(session: ParkingSession, nowMs: number): number {
  const entry = session.entryTime ?? nowMs;
  const elapsedHrs = (nowMs - entry) / 3_600_000;
  return Math.max(0, elapsedHrs * session.pricePerHour);
}

function addAudit(
  log: AuditEntry[],
  level: AuditEntry["level"],
  message: string
): AuditEntry[] {
  return [{ ts: Date.now(), level, message }, ...log].slice(0, 100);
}

/* ── Default seed zones ─────────────────────────────────────── */

const SEED_ZONES: ZoneCapacity[] = [
  { zoneId: "L1-STD",  label: "Level 1 — Standard",       total: 12, occupied: 3 },
  { zoneId: "L2-EV",   label: "Level 2 — Compact / EV",   total: 10, occupied: 4 },
  { zoneId: "L3-PREM", label: "Level 3 — Premium EV Fast", total: 8,  occupied: 2 },
];

/* ── Store ──────────────────────────────────────────────────── */

export const useParkingSessionStore = create<ParkingSessionState>()(
  persist(
    (set, get) => ({
      sessions: [],
      zones: SEED_ZONES,
      auditLog: [
        {
          ts: Date.now(),
          level: "info",
          message: "SmartPark FASTag gateway online. All zone sensors nominal.",
        },
      ],

      /* ── createBooking ────────────────────────────────────── */
      createBooking: (params) => {
        const id = genBookingId();
        const fastagId = params.fastagId || genFastagId(params.licensePlate);
        const now = Date.now();
        const bookedStart = now;
        const bookedEnd = now + params.durationHours * 3_600_000;

        const session: ParkingSession = {
          id,
          fastagId,
          licensePlate: params.licensePlate.toUpperCase(),
          vehicleType: params.vehicleType,
          location: params.location,
          zoneId: params.zoneId,
          zoneLabel: params.zoneLabel,
          pricePerHour: params.pricePerHour,
          bookedStart,
          bookedEnd,
          entryTime: null,
          exitTime: null,
          status: "booked",
          settlement: "pending",
          finalAmountINR: null,
          receiptId: null,
        };

        set((s) => ({
          sessions: [session, ...s.sessions],
          auditLog: addAudit(
            s.auditLog,
            "info",
            `Booking ${id} created for ${params.licensePlate} — Zone ${params.zoneLabel}. 15-min grace window active.`
          ),
        }));

        return id;
      },

      /* ── simulateFastagEntry ─────────────────────────────── */
      simulateFastagEntry: (sessionId) => {
        const now = Date.now();
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === sessionId
              ? { ...sess, status: "active", entryTime: now }
              : sess
          ),
          zones: s.zones.map((z) => {
            const sess = s.sessions.find((se) => se.id === sessionId);
            if (!sess || z.zoneId !== sess.zoneId) return z;
            return { ...z, occupied: Math.min(z.occupied + 1, z.total) };
          }),
          auditLog: addAudit(
            s.auditLog,
            "info",
            (() => {
              const sess = s.sessions.find((se) => se.id === sessionId);
              return sess
                ? `FASTag ENTRY — ${sess.fastagId} (${sess.licensePlate}) scanned at entry barrier. Zone ${sess.zoneLabel} capacity +1. Boom gate opened.`
                : `FASTag ENTRY — session ${sessionId} recorded.`;
            })()
          ),
        }));
      },

      /* ── simulateFastagExit ──────────────────────────────── */
      simulateFastagExit: (sessionId) => {
        const now = Date.now();
        set((s) => {
          const sess = s.sessions.find((se) => se.id === sessionId);
          if (!sess || sess.status !== "active") return s;

          const fare = calcFare(sess, now);
          const receiptId = genReceiptId();

          return {
            sessions: s.sessions.map((se) =>
              se.id === sessionId
                ? {
                    ...se,
                    exitTime: now,
                    status: "completed",
                    settlement: "fastag_auto_debit",
                    finalAmountINR: fare,
                    receiptId,
                  }
                : se
            ),
            zones: s.zones.map((z) => {
              if (z.zoneId !== sess.zoneId) return z;
              return { ...z, occupied: Math.max(z.occupied - 1, 0) };
            }),
            auditLog: addAudit(
              s.auditLog,
              "info",
              `FASTag EXIT — ${sess.fastagId} (${sess.licensePlate}). Duration: ${Math.ceil((now - (sess.entryTime ?? now)) / 60000)} min. ₹${fare.toFixed(2)} auto-debited. Receipt: ${receiptId}.`
            ),
          };
        });
      },

      /* ── managerEndTrip ──────────────────────────────────── */
      managerEndTrip: (sessionId, note) => {
        const now = Date.now();
        set((s) => {
          const sess = s.sessions.find((se) => se.id === sessionId);
          if (!sess || (sess.status !== "active" && sess.status !== "booked")) return s;

          const fare = sess.entryTime ? calcFare(sess, now) : 0;
          const receiptId = genReceiptId();

          return {
            sessions: s.sessions.map((se) =>
              se.id === sessionId
                ? {
                    ...se,
                    exitTime: now,
                    status: "manager_ended",
                    settlement: "manager_override",
                    finalAmountINR: fare,
                    receiptId,
                    managerNote: note,
                  }
                : se
            ),
            zones: s.zones.map((z) => {
              if (z.zoneId !== sess?.zoneId || sess.status !== "active") return z;
              return { ...z, occupied: Math.max(z.occupied - 1, 0) };
            }),
            auditLog: addAudit(
              s.auditLog,
              "warn",
              `MANAGER OVERRIDE — Session ${sessionId} (${sess?.licensePlate ?? "unknown"}) force-ended by parking manager. Reason: "${note}". ₹${fare.toFixed(2)} settled. Receipt: ${receiptId}.`
            ),
          };
        });
      },

      /* ── extendSession ───────────────────────────────────── */
      extendSession: (sessionId, extraMinutes) => {
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === sessionId && (sess.status === "active")
              ? { ...sess, bookedEnd: sess.bookedEnd + extraMinutes * 60_000 }
              : sess
          ),
          auditLog: addAudit(s.auditLog, "info", `Session ${sessionId} extended by +${extraMinutes} min.`),
        }));
      },

      /* ── expireGracePeriod ───────────────────────────────── */
      expireGracePeriod: (sessionId) => {
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === sessionId && sess.status === "booked"
              ? { ...sess, status: "grace_expired" }
              : sess
          ),
          zones: s.zones.map((z) => {
            const sess = s.sessions.find((se) => se.id === sessionId);
            if (!sess || z.zoneId !== sess.zoneId) return z;
            return z; // capacity not yet incremented for booked-only sessions
          }),
          auditLog: addAudit(
            s.auditLog,
            "warn",
            `Grace period expired for session ${sessionId}. Zone capacity released.`
          ),
        }));
      },

      /* ── clearHistory ────────────────────────────────────── */
      clearHistory: () =>
        set((s) => ({
          sessions: s.sessions.filter((se) => se.status === "active" || se.status === "booked"),
        })),

      /* ── Computed helpers ────────────────────────────────── */
      getActiveSession: () => {
        const s = get();
        return s.sessions.find((se) => se.status === "active") ?? null;
      },

      getActiveSessions: () => {
        return get().sessions.filter(
          (se) => se.status === "active" || se.status === "booked"
        );
      },

      getElapsedSeconds: (session) => {
        if (!session.entryTime) return 0;
        const ref = session.exitTime ?? Date.now();
        return Math.floor((ref - session.entryTime) / 1000);
      },

      getAccruedFare: (session) => {
        if (!session.entryTime) return 0;
        return calcFare(session, session.exitTime ?? Date.now());
      },
    }),
    {
      name: "smartpark-sessions",
      // Only persist sessions and zones; auditLog reconstructed on load
      partialize: (state) => ({
        sessions: state.sessions,
        zones: state.zones,
        auditLog: state.auditLog,
      }),
    }
  )
);

/* ── Convenience selector re-exports ────────────────────────── */

export function fmtDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export function fmtElapsedMins(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}
