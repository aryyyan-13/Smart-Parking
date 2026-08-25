"use client";

import { useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import GlassCard from "@web/components/ui/GlassCard";
import { useIotSimStore } from "@web/lib/iot-simulation-store";
import { TrendingUp, Zap, IndianRupee, Activity, Car } from "lucide-react";

/* ── Mock time-series data ────────────────────────────────── */
function generateOccupancyHistory() {
  const hours = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00"];
  return hours.map((h, i) => ({
    time: h,
    L1: Math.round(30 + Math.sin(i * 0.7) * 25 + Math.random() * 15),
    L2: Math.round(40 + Math.sin(i * 0.9 + 1) * 20 + Math.random() * 15),
    L3: Math.round(55 + Math.sin(i * 0.5 + 2) * 30 + Math.random() * 10),
  }));
}

function generateRevenueHistory() {
  return ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day) => ({
    day,
    Standard: Math.round(1200 + Math.random() * 800),
    "EV Charging": Math.round(600 + Math.random() * 600),
    Premium: Math.round(400 + Math.random() * 400),
  }));
}

function generateEVPowerHistory() {
  return Array.from({ length: 12 }, (_, i) => ({
    time: `${String(9 + i).padStart(2,"0")}:00`,
    kW: Math.round(80 + Math.sin(i * 0.8) * 40 + Math.random() * 20),
  }));
}

/* ── Tooltip styling ──────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-3 py-2 text-xs space-y-1 border border-border rounded-lg">
      <p className="font-mono text-muted">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted">{p.name}:</span>
          <span className="font-mono font-semibold text-foreground">{p.value}{p.name === "kW" ? " kW" : p.name.includes("L") ? "%" : "₹"}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Stat card ────────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, color = "cyan" }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color?: "cyan" | "green" | "blue";
}) {
  const colorMap = { cyan: "text-accent-cyan", green: "text-emerald-400", blue: "text-accent-blue" };
  return (
    <GlassCard className="p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg bg-current/10 border border-current/20 flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] hud-label truncate">{label}</p>
        <p className={`font-mono text-lg font-bold leading-tight ${colorMap[color]} text-glow`}>{value}</p>
        {sub && <p className="text-[10px] text-muted">{sub}</p>}
      </div>
    </GlassCard>
  );
}

/* ── Analytics Widget ─────────────────────────────────────── */
export default function AnalyticsWidget() {
  const { floors } = useIotSimStore();

  const totalStats = useMemo(() => {
    const allSlots = floors.flatMap(f => f.slots);
    const occupied = allSlots.filter(s => s.status === "occupied" || s.status === "ev-charging").length;
    const evCharging = allSlots.filter(s => s.status === "ev-charging").length;
    // Use deterministic estimate: 35 kW average per EV bay (no Math.random in render)
    const totalKW = evCharging * 35;
    return { total: allSlots.length, occupied, evCharging, totalKW, pct: Math.round(occupied / allSlots.length * 100) };
  }, [floors]);

  const occupancyData = useMemo(() => generateOccupancyHistory(), []);
  const revenueData = useMemo(() => generateRevenueHistory(), []);
  const evPowerData = useMemo(() => generateEVPowerHistory(), []);

  const gridColors = { grid: "rgba(255,255,255,0.04)", tick: "#8A8F98" };

  return (
    <div className="h-full flex flex-col gap-4 overflow-auto no-scrollbar">
      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Car className="w-4 h-4" />} label="Occupancy" value={`${totalStats.pct}%`} sub={`${totalStats.occupied}/${totalStats.total} bays`} />
        <StatCard icon={<Zap className="w-4 h-4" />} label="EV Active" value={`${totalStats.evCharging}`} sub="bays charging" color="green" />
        <StatCard icon={<Activity className="w-4 h-4" />} label="EV Power Draw" value={`${totalStats.totalKW.toFixed(0)} kW`} sub="aggregate" color="green" />
        <StatCard icon={<IndianRupee className="w-4 h-4" />} label="Today Revenue" value="₹8,340" sub="calculated" color="blue" />
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-4 flex-1">
        {/* Occupancy % over time */}
        <GlassCard className="p-4 space-y-3">
          <p className="text-xs font-heading font-semibold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-accent-cyan" />Floor Occupancy (%)
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={occupancyData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="gradL1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00FFFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradL2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradL3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF88" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00FF88" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColors.grid} />
              <XAxis dataKey="time" tick={{ fill: gridColors.tick, fontSize: 9 }} tickLine={false} />
              <YAxis tick={{ fill: gridColors.tick, fontSize: 9 }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, color: gridColors.tick }} />
              <Area type="monotone" dataKey="L1" stroke="#00FFFF" fill="url(#gradL1)" strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="L2" stroke="#3B82F6" fill="url(#gradL2)" strokeWidth={1.5} dot={false} />
              <Area type="monotone" dataKey="L3" stroke="#00FF88" fill="url(#gradL3)" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Weekly revenue */}
        <GlassCard className="p-4 space-y-3">
          <p className="text-xs font-heading font-semibold flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-accent-blue" />Weekly Revenue (₹)
          </p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColors.grid} />
              <XAxis dataKey="day" tick={{ fill: gridColors.tick, fontSize: 9 }} tickLine={false} />
              <YAxis tick={{ fill: gridColors.tick, fontSize: 9 }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, color: gridColors.tick }} />
              <Bar dataKey="Standard" stackId="a" fill="#00FFFF" fillOpacity={0.7} radius={[0,0,0,0]} />
              <Bar dataKey="EV Charging" stackId="a" fill="#00FF88" fillOpacity={0.7} />
              <Bar dataKey="Premium" stackId="a" fill="#3B82F6" fillOpacity={0.7} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* EV power draw */}
        <GlassCard className="p-4 space-y-3 lg:col-span-2">
          <p className="text-xs font-heading font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />EV Fast-Charge Power Demand (kW)
          </p>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={evPowerData} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColors.grid} />
              <XAxis dataKey="time" tick={{ fill: gridColors.tick, fontSize: 9 }} tickLine={false} />
              <YAxis tick={{ fill: gridColors.tick, fontSize: 9 }} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="kW" stroke="#00FF88" strokeWidth={2} dot={false}
                activeDot={{ r: 4, fill: "#00FF88", strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}
