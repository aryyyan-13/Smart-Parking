"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard, MapPin, CalendarCheck, DollarSign,
  Settings, Bell, User, ChevronDown, TrendingUp, BarChart3, ParkingCircle, ArrowLeft
} from "lucide-react";
import GlassCard from "@web/components/ui/GlassCard";
import StatusBadge from "@web/components/ui/StatusBadge";
import { useCurrencyStore, formatPrice } from "@web/lib/currency-store";
import { createClient } from "@web/utils/supabase/client";

const sidebarItems = [
  { label: "Dashboard", href: "/owner/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: "Listings", href: "/owner/listings", icon: <MapPin className="w-4 h-4" /> },
  { label: "Bookings", href: "/owner/bookings", icon: <CalendarCheck className="w-4 h-4" /> },
  { label: "Earnings", href: "/owner/earnings", icon: <DollarSign className="w-4 h-4" /> },
  { label: "Settings", href: "/owner/settings", icon: <Settings className="w-4 h-4" /> },
];



function MiniChart({ weeklyData }: { weeklyData: { day: string; amount: number }[] }) {
  const max = Math.max(...weeklyData.map((d) => d.amount), 100);
  const height = 120;

  const points = weeklyData.map((d, i) => {
    const x = (i / (weeklyData.length - 1)) * 100;
    const y = height - (d.amount / max) * height;
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(" L ")}`;
  const areaPath = `${linePath} L 100,${height} L 0,${height} Z`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 100 ${height}`}
        className="w-full h-36"
        preserveAspectRatio="none"
        aria-label="Weekly earnings chart"
        role="img"
      >
        <defs>
          <linearGradient id="chromeChartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#67E8F9" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#67E8F9" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#chromeChartGradient)" />
        <path
          d={linePath}
          fill="none"
          stroke="#67E8F9"
          strokeWidth="1.2"
          vectorEffect="non-scaling-stroke"
          style={{ filter: "drop-shadow(0 0 8px rgba(103,232,249,0.5))" }}
        />
        {weeklyData.map((d, i) => {
          const x = (i / (weeklyData.length - 1)) * 100;
          const y = height - (d.amount / max) * height;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2"
              fill="#67E8F9"
              stroke="#0D0D12"
              strokeWidth="0.8"
            />
          );
        })}
      </svg>
      <div className="flex justify-between text-[11px] text-muted font-mono mt-2 px-1">
        {weeklyData.map((d) => (
          <span key={d.day}>{d.day}</span>
        ))}
      </div>
    </div>
  );
}

export default function OwnerDashboardPage() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const { active: currency } = useCurrencyStore();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    stats: { totalRevenue: number; activeBookings: number; occupancyRate: string; listedSpaces: number };
    recentBookings: Array<Record<string, unknown> & { id: string, driver: string, slot: string, time: string, status: string, amountPaise: number }>;
    weeklyData: { day: string; amount: number }[];
  } | null>(null);

  useEffect(() => {
    async function fetchStats() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/listings/stats`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [supabase.auth]);

  const stats = [
    { label: "Total Revenue", value: data ? formatPrice(data.stats.totalRevenue, currency) : "...", icon: <DollarSign className="w-4 h-4" />, change: "0" },
    { label: "Active Bookings", value: data?.stats.activeBookings.toString() || "...", icon: <CalendarCheck className="w-4 h-4" />, change: "0" },
    { label: "Occupancy Rate", value: data?.stats.occupancyRate || "...", icon: <BarChart3 className="w-4 h-4" />, change: "0" },
    { label: "Listed Spaces", value: data?.stats.listedSpaces.toString() || "...", icon: <ParkingCircle className="w-4 h-4" />, change: "0" },
  ];

  const recentBookings = data?.recentBookings || [];

  return (
    <div className="min-h-screen bg-bg-void flex">
      {/* Chrome Glass Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-white/10 bg-bg-deep/70 backdrop-blur-2xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-cyan/20 border border-accent-cyan/40 flex items-center justify-center shadow-[0_0_15px_rgba(103,232,249,0.3)]">
              <MapPin className="w-4 h-4 text-accent-cyan" />
            </div>
            <span className="font-heading text-sm font-bold text-white">
              Smart<span className="text-accent-cyan">Park</span>
              <span className="text-[9px] font-mono text-muted block -mt-0.5">HOST STUDIO</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-3.5 space-y-1" aria-label="Owner dashboard navigation">
          {sidebarItems.map((item) => {
            const isActive = activeNav === item.label;
            return (
              <button
                key={item.label}
                onClick={() => setActiveNav(item.label)}
                className={`
                  relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-mono font-medium
                  transition-all duration-200 cursor-pointer select-none
                  ${
                    isActive
                      ? "text-white font-bold"
                      : "text-muted hover:text-white hover:bg-white/5"
                  }
                `}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="owner-sidebar-active-pill"
                    className="absolute inset-0 rounded-xl bg-accent-cyan/15 border border-accent-cyan/40 shadow-[0_0_15px_rgba(103,232,249,0.25)] -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Studio Viewport */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 lg:px-8 bg-bg-deep/50 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/" className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-muted">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-heading text-base font-bold text-white">Host Operations Studio</h1>
              <p className="text-[10px] text-muted font-mono">Live booking settlements & occupancy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl bg-white/5 border border-white/10 text-muted hover:text-white transition-colors relative" aria-label="Notifications">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-accent-cyan/20 border border-accent-cyan/30 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-accent-cyan" />
              </div>
              <span className="text-xs font-medium text-white hidden sm:inline">Koramangala Space</span>
              <ChevronDown className="w-3 h-3 text-muted" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
          {/* 3D Tilt Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <GlassCard key={i} tilt className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="hud-label text-[10px]">{stat.label}</span>
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent-cyan shadow-[0_0_12px_rgba(103,232,249,0.2)]">
                    {stat.icon}
                  </div>
                </div>
                <div>
                  <div className="font-heading text-2xl font-black text-white">{stat.value}</div>
                  {stat.change !== "0" && (
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono mt-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change} vs last cycle
                    </div>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Earnings Chart Card */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
              <div>
                <h2 className="font-heading text-base font-bold text-white">Weekly Revenue Yield</h2>
                <p className="text-xs text-muted font-mono">Calculated gross earnings from all bays</p>
              </div>
              <span className="text-xs font-mono text-accent-cyan bg-accent-cyan/10 px-2.5 py-1 rounded-xl border border-accent-cyan/30">
                7-Day Interval
              </span>
            </div>
            <MiniChart weeklyData={data?.weeklyData || []} />
          </GlassCard>

          {/* Recent Activity Table */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
              <div>
                <h2 className="font-heading text-base font-bold text-white">Live Booking Activity</h2>
                <p className="text-xs text-muted font-mono">Real-time driver arrivals and departures</p>
              </div>
              <span className="text-xs text-muted font-mono">{recentBookings.length} Total</span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-muted font-mono text-sm animate-pulse">Loading bookings...</div>
            ) : recentBookings.length === 0 ? (
              <div className="py-12 text-center text-muted font-mono text-sm">No recent bookings found.</div>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono" aria-label="Recent bookings">
                <thead>
                  <tr className="border-b border-white/10 text-muted">
                    <th className="text-left py-3 px-3 hud-label">Driver</th>
                    <th className="text-left py-3 px-3 hud-label">Bay</th>
                    <th className="text-left py-3 px-3 hud-label hidden sm:table-cell">Check-In</th>
                    <th className="text-left py-3 px-3 hud-label">Status</th>
                    <th className="text-right py-3 px-3 hud-label">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-3 font-medium text-white font-sans">{b.driver}</td>
                      <td className="py-3 px-3 font-bold text-accent-cyan">{b.slot}</td>
                      <td className="py-3 px-3 text-muted hidden sm:table-cell">{new Date(b.time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="py-3 px-3">
                        <StatusBadge status={b.status === "CONFIRMED" || b.status === "COMPLETED" ? "verified" : b.status === "PENDING" ? "pending" : "error"} />
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-white">{formatPrice(b.amountPaise, currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
