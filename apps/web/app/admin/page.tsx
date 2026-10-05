"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, Shield, CheckCircle2, XCircle, AlertTriangle,
  FileText, TrendingUp, IndianRupee, Building2, Timer,
  Radio, Car, Clock, MapPin, X
} from "lucide-react";
import GlassCard from "@web/components/ui/GlassCard";
import NeonButton from "@web/components/ui/NeonButton";
import Navbar from "@web/components/layout/Navbar";
import {
  useParkingSessionStore,
  fmtDuration,
  type ParkingSession,
} from "@web/lib/parking-session-store";

/* ── Types ──────────────────────────────────────────────────── */

type ListingStatus = "DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "DELETED";
type DisputeStatus = "open" | "resolved" | "refunded";

interface PendingListing {
  id: string;
  ownerName: string;
  location: string;
  city: string;
  totalSpots: number;
  pricePerHour: number;
  submittedAt: string;
  status: ListingStatus;
}

interface Dispute {
  id: string;
  driverName: string;
  location: string;
  amount: number;
  reason: string;
  submittedAt: string;
  status: DisputeStatus;
}

const MOCK_DISPUTES: Dispute[] = [
  { id: "DSP-101", driverName: "Arjun Singh", location: "MG Road Metro Multi-Level", amount: 320, reason: "Overcharged by 2 hours — bay sensor glitch", submittedAt: "25 Aug, 11:05", status: "open" },
  { id: "DSP-102", driverName: "Sneha Verma", location: "Cyber Hub Plaza", amount: 180, reason: "Gate did not open, could not park", submittedAt: "24 Aug, 16:30", status: "open" },
  { id: "DSP-103", driverName: "Karan Malhotra", location: "Sector 17 Chandigarh", amount: 80, reason: "Booking cancelled but charged", submittedAt: "23 Aug, 09:00", status: "refunded" },
];

/* ── Manager Override Modal ─────────────────────────────────── */

function ManagerOverrideModal({
  session,
  elapsed,
  fare,
  onClose,
}: {
  session: ParkingSession;
  elapsed: number;
  fare: number;
  onClose: () => void;
}) {
  const managerEndTrip = useParkingSessionStore((s) => s.managerEndTrip);
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const handleOverride = () => {
    managerEndTrip(session.id, note || "Manager manual override — no reason given");
    setConfirmed(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={confirmed ? onClose : undefined}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-bg-base/95 rounded-3xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Header */}
        <div className={`border-b px-6 py-5 flex items-center justify-between gap-3.5 ${
          confirmed ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              confirmed
                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/20 border-rose-500/30 text-rose-400"
            }`}>
              {confirmed ? <CheckCircle2 className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-heading font-bold text-white text-sm">
                {confirmed ? "Session Terminated" : "Manager Override"}
              </p>
              <p className="text-xs text-muted font-mono">
                {confirmed ? "Bay released & audit logged" : "Force-end active parking session"}
              </p>
            </div>
          </div>
          {!confirmed && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          {/* Session details */}
          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-muted">Session ID</span>
              <span className="text-accent-cyan font-bold">{session.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">License Plate</span>
              <span className="font-bold text-white">{session.licensePlate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">FASTag ID</span>
              <span className="text-accent-cyan">{session.fastagId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Zone</span>
              <span className="text-white">{session.zoneLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Duration</span>
              <span className="font-bold text-white">{fmtDuration(elapsed)}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2.5">
              <span className="text-muted">Amount to Settle</span>
              <span className="font-black text-accent-cyan text-base">₹{fare.toFixed(2)}</span>
            </div>
          </div>

          {!confirmed && (
            <>
              {/* Override reason */}
              <div className="space-y-1.5">
                <label htmlFor="override-note" className="hud-label text-[10px]">Manager Note / Reason</label>
                <textarea
                  id="override-note"
                  rows={2}
                  placeholder="e.g. Vehicle reported abandoned, driver unresponsive..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-bg-elevated border border-border text-xs font-mono text-foreground placeholder:text-muted/50 focus:border-rose-500/50 focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-300">
                ⚠️ This will immediately release the bay, settle ₹{fare.toFixed(2)} via manager override, and log this action to the audit stream.
              </div>

              <NeonButton variant="destructive" size="md" fullWidth magnetic onClick={handleOverride}>
                <Shield className="w-4 h-4" />
                Confirm Manager Override & End Trip
              </NeonButton>
            </>
          )}

          {confirmed && (
            <>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-300">
                ✓ Bay released. ₹{fare.toFixed(2)} settled. Audit log updated. Receipt: {session.receiptId}
              </div>
              <NeonButton variant="primary" size="md" fullWidth onClick={onClose} magnetic>
                Done
              </NeonButton>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Live Session Row ────────────────────────────────────────── */

function LiveSessionRow({ session }: { session: ParkingSession }) {
  const [showOverride, setShowOverride] = useState(false);

  const [now, setNow] = useState(0);
  useEffect(() => {
    setTimeout(() => setNow(Date.now()), 0);
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const elapsed = session.entryTime
    ? Math.floor((now - session.entryTime) / 1000)
    : 0;
  const fare = session.entryTime
    ? (elapsed / 3600) * session.pricePerHour
    : 0;

  return (
    <>
      <GlassCard tilt className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2 flex-wrap font-mono">
              <span className="text-xs text-accent-cyan font-bold">{session.id}</span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                session.status === "active"
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
              }`}>
                {session.status.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Car className="w-4 h-4 text-accent-cyan shrink-0" />
              <span>{session.licensePlate}</span>
              <span className="text-muted">·</span>
              <Radio className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
              <span className="font-mono text-xs text-accent-cyan truncate max-w-[140px]">{session.fastagId}</span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono text-muted">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{session.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Timer className="w-3 h-3" />
                <span className="text-white font-bold">{fmtDuration(elapsed)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>{session.entryTime ? new Date(session.entryTime).toLocaleTimeString("en-IN") : "Not entered"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IndianRupee className="w-3 h-3" />
                <span className="text-accent-cyan font-bold">₹{fare.toFixed(2)} accrued</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <NeonButton
              size="sm"
              variant="destructive"
              magnetic
              onClick={() => setShowOverride(true)}
            >
              <Shield className="w-3.5 h-3.5" />
              End Trip (Manager)
            </NeonButton>
            <Link href="/meter">
              <NeonButton size="sm" variant="chrome" magnetic fullWidth>
                <Timer className="w-3.5 h-3.5" />
                View Meter
              </NeonButton>
            </Link>
          </div>
        </div>
      </GlassCard>

      <AnimatePresence>
        {showOverride && (
          <ManagerOverrideModal
            session={session}
            elapsed={elapsed}
            fare={fare}
            onClose={() => setShowOverride(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Admin Page ──────────────────────────────────────────────── */

type AdminTab = "sessions" | "listings" | "disputes" | "audit";

export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("sessions");
  const [listings, setListings] = useState<PendingListing[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>(MOCK_DISPUTES);
  const [stats, setStats] = useState({ users: 0, listings: 0, bookings: 0, revenuePaise: 0 });
  const [serverAuditLogs, setServerAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
        const [statsRes, listingsRes, auditRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/admin/stats`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/admin/listings/pending`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/admin/audit-logs`, { headers })
        ]);
        
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
        if (listingsRes.ok) {
          const rawListings = await listingsRes.json();
          setListings(rawListings.map((l: any) => ({
            id: l.id,
            ownerName: l.organization?.name || "Unknown Owner",
            location: l.title,
            city: l.address,
            totalSpots: 0, 
            pricePerHour: 0,
            submittedAt: new Date(l.createdAt).toLocaleDateString(),
            status: l.status,
          })));
        }
        if (auditRes.ok) {
          setServerAuditLogs(await auditRes.json());
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchAdminData();
  }, []);

  const allSessions = useParkingSessionStore((s) => s.sessions);
  const auditLog = useParkingSessionStore((s) => s.auditLog);
  const activeSessions = allSessions.filter(
    (s) => s.status === "active" || s.status === "booked"
  );

  const pendingCount = listings.filter((l) => l.status === "DRAFT").length;
  const openDisputeCount = disputes.filter((d) => d.status === "open").length;

  const approveListing = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/admin/listings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status: 'PUBLISHED' })
      });
      setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: "PUBLISHED" } : l));
    } catch (e) {
      console.error(e);
    }
  };

  const rejectListing = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/admin/listings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ status: 'DELETED' })
      });
      setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: "DELETED" } : l));
    } catch (e) {
      console.error(e);
    }
  };
  const resolveDispute = (id: string) =>
    setDisputes((prev) => prev.map((d) => d.id === id ? { ...d, status: "resolved" } : d));
  const refundDispute = (id: string) =>
    setDisputes((prev) => prev.map((d) => d.id === id ? { ...d, status: "refunded" } : d));

  const TABS: { id: AdminTab; icon: React.ReactNode; label: string; badge?: number }[] = [
    { id: "sessions", icon: <Timer className="w-4 h-4" />, label: "Live Sessions", badge: activeSessions.length || undefined },
    { id: "listings", icon: <Building2 className="w-4 h-4" />, label: "Moderation Queue", badge: pendingCount || undefined },
    { id: "disputes", icon: <AlertTriangle className="w-4 h-4" />, label: "Dispute Desk", badge: openDisputeCount || undefined },
    { id: "audit", icon: <FileText className="w-4 h-4" />, label: "Audit Stream" },
  ];

  return (
    <div className="min-h-screen bg-bg-void">
      <Navbar />

      <div className="pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-accent-cyan/20 border border-accent-cyan/40 flex items-center justify-center shadow-[0_0_15px_rgba(103,232,249,0.3)]">
                <Shield className="w-4 h-4 text-accent-cyan" />
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Admin Command Center
              </h1>
            </div>
            <p className="text-xs text-muted font-mono mt-0.5">
              Live session gate control, moderation, dispute arbitration, and audit stream
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-7">
          {[
            { icon: <Timer className="w-4 h-4" />, label: "Users", value: stats.users, color: "text-emerald-400" },
            { icon: <Building2 className="w-4 h-4" />, label: "Pending Approvals", value: pendingCount, color: "text-accent-cyan" },
            { icon: <AlertTriangle className="w-4 h-4" />, label: "Bookings", value: stats.bookings, color: "text-rose-400" },
            { icon: <TrendingUp className="w-4 h-4" />, label: "Total Gross", value: `₹${(stats.revenuePaise / 100).toFixed(0)}`, color: "text-emerald-400", raw: true },
          ].map((stat) => (
            <GlassCard key={stat.label} tilt className="p-4 flex items-center gap-3.5">
              <div className={`w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${stat.color} shadow-[0_0_15px_rgba(255,255,255,0.05)]`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[9px] hud-label">{stat.label}</p>
                <p className={`font-mono text-xl font-black ${stat.color}`}>
                  {"raw" in stat && stat.raw ? stat.value : stat.value}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.08] overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-medium
                  whitespace-nowrap cursor-pointer transition-colors select-none
                  ${isActive ? "text-white font-bold" : "text-muted hover:text-white"}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="admin-active-tab-pill"
                    className="absolute inset-0 rounded-xl bg-accent-cyan/15 border border-accent-cyan/40 shadow-[0_0_15px_rgba(103,232,249,0.25)] -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded-full border ${
                    tab.id === "sessions"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Viewport */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {/* Live Sessions */}
            {activeTab === "sessions" && (
              <div className="space-y-3.5">
                {activeSessions.length === 0 ? (
                  <GlassCard className="p-10 text-center space-y-3">
                    <Timer className="w-10 h-10 text-muted mx-auto" />
                    <p className="text-muted font-mono text-sm">No active parking sessions.</p>
                    <p className="text-xs text-muted/60 font-mono">
                      Sessions will appear here once a vehicle enters via FASTag barrier.
                    </p>
                    <Link href="/meter">
                      <NeonButton variant="chrome" size="sm" magnetic>
                        Start a Demo Session
                      </NeonButton>
                    </Link>
                  </GlassCard>
                ) : (
                  activeSessions.map((session) => (
                    <LiveSessionRow key={session.id} session={session} />
                  ))
                )}
              </div>
            )}

            {/* Moderation Queue */}
            {activeTab === "listings" && (
              <div className="space-y-3.5">
                {listings.map((listing) => (
                  <GlassCard key={listing.id} tilt className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap font-mono">
                          <span className="text-xs text-accent-cyan font-bold">{listing.id}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                            listing.status === "DRAFT"
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              : listing.status === "PUBLISHED"
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                          }`}>
                            {listing.status === "DRAFT" ? "PENDING" : listing.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="font-heading font-bold text-base text-white">{listing.location}</p>
                        <p className="text-xs text-muted font-mono">{listing.city} · {listing.totalSpots} spots · ₹{listing.pricePerHour}/hr</p>
                        <p className="text-xs text-slate-400">Host: <span className="text-white font-medium">{listing.ownerName}</span> · Submitted {listing.submittedAt}</p>
                      </div>

                      {listing.status === "DRAFT" && (
                        <div className="flex gap-2 shrink-0">
                          <NeonButton size="sm" variant="primary" magnetic onClick={() => approveListing(listing.id)}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve Space
                          </NeonButton>
                          <NeonButton size="sm" variant="destructive" magnetic onClick={() => rejectListing(listing.id)}>
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </NeonButton>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            {/* Dispute Desk */}
            {activeTab === "disputes" && (
              <div className="space-y-3.5">
                {disputes.map((dispute) => (
                  <GlassCard key={dispute.id} tilt className="p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap font-mono">
                          <span className="text-xs text-rose-400 font-bold">{dispute.id}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
                            dispute.status === "open"
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              : dispute.status === "resolved"
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : "bg-sky-500/15 text-sky-300 border-sky-500/30"
                          }`}>
                            {dispute.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="font-heading font-bold text-base text-white">{dispute.location}</p>
                        <p className="text-xs text-muted font-mono">
                          Driver: <span className="text-white font-medium">{dispute.driverName}</span> · <span className="text-accent-cyan font-bold">₹{dispute.amount}</span> claim
                        </p>
                        <p className="text-xs text-slate-300 italic">&ldquo;{dispute.reason}&rdquo;</p>
                        <p className="text-[10px] text-muted font-mono">{dispute.submittedAt}</p>
                      </div>

                      {dispute.status === "open" && (
                        <div className="flex flex-col gap-2 shrink-0">
                          <NeonButton size="sm" variant="primary" magnetic onClick={() => refundDispute(dispute.id)}>
                            <IndianRupee className="w-3.5 h-3.5" />
                            Refund ₹{dispute.amount}
                          </NeonButton>
                          <NeonButton size="sm" variant="chrome" magnetic onClick={() => resolveDispute(dispute.id)}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark Resolved
                          </NeonButton>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            {/* Audit Stream */}
            {activeTab === "audit" && (
              <GlassCard className="p-5 space-y-3.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <p className="hud-label text-xs flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent-cyan" />
                    FASTag Gateway & Manager Override Audit Stream
                  </p>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    LIVE LOG
                  </span>
                </div>
                <div className="space-y-2 font-mono text-xs">
                  {serverAuditLogs.map((entry, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/8 text-slate-300"
                    >
                      <span className="text-muted shrink-0 text-[10px]">
                        {new Date(entry.createdAt).toLocaleTimeString("en-IN")}
                      </span>
                      <span className="shrink-0 uppercase text-[8px] font-bold px-1.5 py-0.2 rounded bg-emerald-400 text-black">
                        INFO
                      </span>
                      <span className="text-slate-200 leading-relaxed">
                        {entry.actor?.name || 'Unknown'} performed {entry.action} on {entry.entityType} {entry.entityId}
                      </span>
                    </div>
                  ))}
                  {auditLog.map((entry, i) => (
                    <div
                      key={`local-${i}`}
                      className={`flex items-start gap-2.5 p-3 rounded-xl ${
                        entry.level === "error"
                          ? "bg-rose-500/10 border border-rose-500/25 text-rose-200"
                          : entry.level === "warn"
                          ? "bg-amber-500/10 border border-amber-500/25 text-amber-200"
                          : "bg-white/5 border border-white/8 text-slate-300"
                      }`}
                    >
                      <span className="text-muted shrink-0 text-[10px]">
                        {new Date(entry.ts).toLocaleTimeString("en-IN")}
                      </span>
                      <span className={`shrink-0 uppercase text-[8px] font-bold px-1.5 py-0.2 rounded ${
                        entry.level === "error"
                          ? "bg-rose-500 text-white"
                          : entry.level === "warn"
                          ? "bg-amber-400 text-black"
                          : "bg-emerald-400 text-black"
                      }`}>
                        {entry.level}
                      </span>
                      <span className="text-slate-200 leading-relaxed">{entry.message}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
