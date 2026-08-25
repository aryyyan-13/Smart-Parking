"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, AlertTriangle, CheckCircle2, Car, Cpu, Eye } from "lucide-react";
import GlassCard from "@web/components/ui/GlassCard";
import NeonButton from "@web/components/ui/NeonButton";

/* ponytail: Canvas-based CV simulation — no external CV lib needed for demo */

/* ── Types ────────────────────────────────────────────────── */
type VehicleClass = "Car" | "SUV" | "Motorcycle";
type ViolationType = "line_crossing" | "double_bay" | "wrong_type" | null;

interface DetectedVehicle {
  id: number;
  x: number; y: number; w: number; h: number;
  cls: VehicleClass;
  confidence: number;
  violation: ViolationType;
  plate: string;
}

interface UltrasonicReading {
  sensorId: string;
  distance: number; // cm
  state: "free" | "near" | "occupied";
}

/* ── Deterministic pseudo-random (stable between renders) ── */
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const PLATES = ["KA01EQ5678","MH12AB1234","DL08CX9900","TN09KR4567","GJ05PQ8812","RJ14MN2233"];

/* ── Generate stable mock detections ─────────────────────── */
const BASE_DETECTIONS: DetectedVehicle[] = [
  { id: 1, x: 40, y: 80, w: 110, h: 80, cls: "Car", confidence: 97, violation: null, plate: PLATES[0] },
  { id: 2, x: 200, y: 75, w: 120, h: 90, cls: "SUV", confidence: 94, violation: null, plate: PLATES[1] },
  { id: 3, x: 370, y: 100, w: 80, h: 60, cls: "Car", confidence: 91, violation: null, plate: PLATES[2] },
];

const ULTRASONICS: UltrasonicReading[] = [
  { sensorId: "L3-01", distance: 12, state: "occupied" },
  { sensorId: "L3-02", distance: 45, state: "near" },
  { sensorId: "L3-03", distance: 182, state: "free" },
  { sensorId: "L3-04", distance: 8, state: "occupied" },
];

const violationColors: Record<NonNullable<ViolationType>, string> = {
  line_crossing: "#EF4444",
  double_bay: "#F59E0B",
  wrong_type: "#8B5CF6",
};

/* ── Canvas: draw bounding boxes ─────────────────────────── */
function drawDetections(
  ctx: CanvasRenderingContext2D,
  vehicles: DetectedVehicle[],
  showScanLine: boolean,
  scanY: number,
) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;

  // Dark camera background
  ctx.fillStyle = "#0a0a0f";
  ctx.fillRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = "rgba(0,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Parking bay lines
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  [35, 175, 335, 460].forEach(x => {
    ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x, H - 20); ctx.stroke();
  });
  ctx.setLineDash([]);

  // Scan line
  if (showScanLine) {
    const grad = ctx.createLinearGradient(0, scanY - 8, 0, scanY + 8);
    grad.addColorStop(0, "rgba(0,255,255,0)");
    grad.addColorStop(0.5, "rgba(0,255,255,0.4)");
    grad.addColorStop(1, "rgba(0,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, scanY - 8, W, 16);
  }

  // Draw vehicles and bounding boxes
  vehicles.forEach((v) => {
    const color = v.violation ? violationColors[v.violation] : "#00FFFF";
    const lineWidth = v.violation ? 2.5 : 1.5;

    // Mock vehicle silhouette
    ctx.fillStyle = `rgba(${v.cls === "Motorcycle" ? "150,120,180" : "80,100,140"},0.25)`;
    ctx.beginPath();
    ctx.roundRect(v.x + 10, v.y + 15, v.w - 20, v.h - 25, 6);
    ctx.fill();

    // Bounding box
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.strokeRect(v.x, v.y, v.w, v.h);

    // Corner accents
    const cs = 12;
    ctx.lineWidth = 3;
    ctx.beginPath();
    // TL
    ctx.moveTo(v.x, v.y + cs); ctx.lineTo(v.x, v.y); ctx.lineTo(v.x + cs, v.y);
    // TR
    ctx.moveTo(v.x + v.w - cs, v.y); ctx.lineTo(v.x + v.w, v.y); ctx.lineTo(v.x + v.w, v.y + cs);
    // BL
    ctx.moveTo(v.x, v.y + v.h - cs); ctx.lineTo(v.x, v.y + v.h); ctx.lineTo(v.x + cs, v.y + v.h);
    // BR
    ctx.moveTo(v.x + v.w - cs, v.y + v.h); ctx.lineTo(v.x + v.w, v.y + v.h); ctx.lineTo(v.x + v.w, v.y + v.h - cs);
    ctx.stroke();

    // Label bg
    ctx.fillStyle = color;
    ctx.font = "bold 10px 'JetBrains Mono', monospace";
    const label = `${v.cls} ${v.confidence}%`;
    const lw = ctx.measureText(label).width;
    ctx.fillRect(v.x, v.y - 18, lw + 10, 16);
    ctx.fillStyle = "#000";
    ctx.fillText(label, v.x + 5, v.y - 5);

    // Violation badge
    if (v.violation) {
      ctx.fillStyle = violationColors[v.violation];
      const vl = v.violation.replace("_", " ").toUpperCase();
      const vw = ctx.measureText(vl).width;
      ctx.fillRect(v.x, v.y + v.h + 2, vw + 10, 16);
      ctx.fillStyle = "#000";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText(vl, v.x + 5, v.y + v.h + 14);
    }

    // Plate label
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.font = "9px 'JetBrains Mono', monospace";
    const pw = ctx.measureText(v.plate).width;
    ctx.fillRect(v.x + (v.w - pw - 10) / 2, v.y + v.h - 18, pw + 10, 14);
    ctx.fillStyle = "#FFF";
    ctx.fillText(v.plate, v.x + (v.w - pw - 10) / 2 + 5, v.y + v.h - 7);
  });

  // HUD overlay text
  ctx.fillStyle = "rgba(0,255,255,0.7)";
  ctx.font = "10px 'JetBrains Mono', monospace";
  ctx.fillText(`SmartPark CV v2.4 | ${vehicles.length} vehicles`, 8, 18);
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillText(new Date().toLocaleTimeString(), W - 80, 18);
}

/* ── Ultrasonic distance gauge ────────────────────────────── */
function RadarGauge({ reading }: { reading: UltrasonicReading }) {
  const pct = Math.min(reading.distance / 200, 1);
  const color =
    reading.state === "occupied" ? "#EF4444"
    : reading.state === "near" ? "#F59E0B"
    : "#22C55E";

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="font-mono text-[10px] text-muted">{reading.sensorId}</p>
      <div className="relative h-20 w-4 bg-bg-elevated rounded-full overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-full"
          style={{ background: color }}
          initial={{ height: 0 }}
          animate={{ height: `${pct * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <p className="font-mono text-[10px]" style={{ color }}>{reading.distance}cm</p>
      <div className={`w-2.5 h-2.5 rounded-full ${
        reading.state === "free" ? "bg-emerald-400" : reading.state === "near" ? "bg-yellow-400" : "bg-red-400"
      } ${reading.state === "occupied" ? "animate-pulse" : ""}`} />
    </div>
  );
}

/* ── Main AI Vision Inspector ─────────────────────────────── */
export default function AIVisionInspector() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0); // stores RAF id
  const animFnRef = useRef<() => void>(() => {}); // stores latest draw fn
  const scanYRef = useRef(0);
  const [vehicles, setVehicles] = useState<DetectedVehicle[]>(BASE_DETECTIONS);
  const [showScanLine] = useState(true);
  const [anprResult, setAnprResult] = useState<{ plate: string; confidence: number } | null>(null);
  const [anprScanning, setAnprScanning] = useState(false);
  const [ultrasonics, setUltrasonics] = useState<UltrasonicReading[]>(ULTRASONICS);

  // Simulate ESP32 ultrasonic updates
  useEffect(() => {
    const id = setInterval(() => {
      setUltrasonics((prev) =>
        prev.map((u) => {
          if (u.state === "free") return u;
          // Small distance jitter
          const jitter = Math.floor((seededRandom(Date.now() % 1000 + u.sensorId.charCodeAt(0)) - 0.5) * 4);
          const dist = Math.max(2, u.distance + jitter);
          return { ...u, distance: dist };
        })
      );
    }, 1800);
    return () => clearInterval(id);
  }, []);

  // Canvas animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    scanYRef.current = (scanYRef.current + 1.5) % canvas.height;
    drawDetections(ctx, vehicles, showScanLine, scanYRef.current);
    // ponytail: call via ref to avoid self-referencing closure
    animRef.current = requestAnimationFrame(animFnRef.current);
  }, [vehicles, showScanLine]);

  useEffect(() => {
    animFnRef.current = animate;
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  const injectViolation = (type: ViolationType) => {
    setVehicles((prev) =>
      prev.map((v, i) => i === 1 ? { ...v, violation: type } : v)
    );
  };

  const clearViolations = () => {
    setVehicles(BASE_DETECTIONS.map((v) => ({ ...v, violation: null })));
  };

  const injectMotorcycle = () => {
    setVehicles((prev) => {
      const hasMoto = prev.some((v) => v.cls === "Motorcycle");
      if (hasMoto) return BASE_DETECTIONS;
      return [...prev, {
        id: 99, x: 340, y: 95, w: 60, h: 55,
        cls: "Motorcycle" as VehicleClass,
        confidence: 89,
        violation: "wrong_type",
        plate: PLATES[5],
      }];
    });
  };

  const triggerANPR = () => {
    setAnprScanning(true);
    setAnprResult(null);
    setTimeout(() => {
      setAnprResult({ plate: PLATES[Math.floor(seededRandom(Date.now() % 100) * 6)], confidence: 92 + Math.floor(seededRandom(Date.now() % 50) * 7) });
      setAnprScanning(false);
    }, 2000);
  };

  const violations = vehicles.filter((v) => v.violation);

  return (
    <div className="space-y-4">
      {/* ── Camera Feed ── */}
      <GlassCard className="overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs font-heading font-semibold">ESP32-CAM Feed · Bay L3</span>
          </div>
          <span className="text-[10px] font-mono text-muted">30 FPS · 640×320</span>
        </div>
        <canvas
          ref={canvasRef}
          width={520}
          height={220}
          className="w-full block"
          aria-label="AI vision camera feed with vehicle detection bounding boxes"
        />
      </GlassCard>

      {/* ── Simulation controls ── */}
      <GlassCard className="p-4 space-y-3">
        <p className="hud-label text-xs flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-accent-cyan" />
          CV Rule Violation Simulator
        </p>
        <div className="flex flex-wrap gap-2">
          <NeonButton size="sm" variant="ghost" onClick={() => injectViolation("line_crossing")}>
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            Line Crossing
          </NeonButton>
          <NeonButton size="sm" variant="ghost" onClick={() => injectViolation("double_bay")}>
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
            Double Bay
          </NeonButton>
          <NeonButton size="sm" variant="ghost" onClick={injectMotorcycle}>
            <Car className="w-3.5 h-3.5 text-purple-400" />
            Motorcycle in Car Bay
          </NeonButton>
          <NeonButton size="sm" variant="ghost" onClick={clearViolations}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Clear Violations
          </NeonButton>
        </div>

        {/* Violation alerts */}
        <AnimatePresence>
          {violations.map((v) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-status-cancelled/10 border border-status-cancelled/25"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-status-cancelled shrink-0" />
              <span className="text-xs text-status-cancelled">
                <span className="font-mono">{v.plate}</span> — {v.violation?.replace("_", " ")} detected
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </GlassCard>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* ── ANPR Scanner ── */}
        <GlassCard className="p-4 space-y-3">
          <p className="hud-label text-xs flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-accent-cyan" />
            ANPR Plate Scanner
          </p>
          <NeonButton size="sm" variant="primary" fullWidth onClick={triggerANPR} loading={anprScanning}>
            Scan Entry Plate
          </NeonButton>
          <AnimatePresence>
            {anprResult && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="px-4 py-3 rounded-xl bg-bg-elevated border border-border text-center space-y-1">
                  <p className="font-mono text-2xl font-bold text-foreground tracking-widest">{anprResult.plate}</p>
                  <p className="text-xs text-muted">OCR Confidence: <span className="text-status-confirmed font-mono">{anprResult.confidence}%</span></p>
                </div>
                <p className="text-[10px] text-muted text-center">✓ Cross-checked against booking database</p>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* ── Ultrasonic Distance Radar ── */}
        <GlassCard className="p-4 space-y-3">
          <p className="hud-label text-xs flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-accent-cyan" />
            Ultrasonic Radar
          </p>
          <div className="flex justify-around items-end">
            {ultrasonics.map((u) => (
              <RadarGauge key={u.sensorId} reading={u} />
            ))}
          </div>
          <div className="flex justify-center gap-4 text-[10px] text-muted">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Free (&gt;100cm)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />Near (30–100cm)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Occ. (&lt;30cm)</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
