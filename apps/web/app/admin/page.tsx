"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft, Shield, CheckCircle2, XCircle, AlertTriangle,
  FileText, TrendingUp, IndianRupee, Building2, Cpu
} from "lucide-react";
import GlassCard from "@web/components/ui/GlassCard";
import NeonButton from "@web/components/ui/NeonButton";
import Navbar from "@web/components/layout/Navbar";

const AIVisionInspector = dynamic(
  () => import("@web/components/admin/AIVisionInspector"),
  { ssr: false, loading: () => <div className="py-12 text-center text-sm font-mono text-muted animate-pulse">Initializing ESP32 & Computer Vision Stream…</div> }
);

type ListingStatus = "pending" | "approved" | "rejected";
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

const MOCK_LISTINGS: PendingListing[] = [
  { id: "LST-001", ownerName: "Rahul Mehta", location: "Koramangala 5th Block", city: "Bengaluru", totalSpots: 12, pricePerHour: 50, submittedAt: "25 Aug, 09:10", status: "pending" },
  { id: "LST-002", ownerName: "Aisha Qureshi", location: "Powai Hiranandani", city: "Mumbai", totalSpots: 8, pricePerHour: 80, submittedAt: "24 Aug, 18:45", status: "pending" },
  { id: "LST-003", ownerName: "Suresh Pillai", location: "Anna Nagar West", city: "Chennai", totalSpots: 20, pricePerHour: 35, submittedAt: "24 Aug, 11:00", status: "pending" },
  { id: "LST-004", ownerName: "Priya Nair", location: "Jubilee Hills Rd 36", city: "Hyderabad", totalSpots: 15, pricePerHour: 45, submittedAt: "23 Aug, 14:22", status: "approved" },
];

const MOCK_DISPUTES: Dispute[] = [
  { id: "DSP-101", driverName: "Arjun Singh", location: "MG Road Metro Multi-Level", amount: 320, reason: "Overcharged by 2 hours — bay sensor glitch", submittedAt: "25 Aug, 11:05", status: "open" },
  { id: "DSP-102", driverName: "Sneha Verma", location: "Cyber Hub Plaza", amount: 180, reason: "Gate did not open, could not park", submittedAt: "24 Aug, 16:30", status: "open" },
  { id: "DSP-103", driverName: "Karan Malhotra", location: "Sector 17 Chandigarh", amount: 80, reason: "Booking cancelled but charged", submittedAt: "23 Aug, 09:00", status: "refunded" },
];

const MOCK_AUDIT_LOG = [
  { time: "20:45:12", level: "warn", msg: "ANPR mismatch: KA01EQ5678 (expected) vs MH12AB1234 (detected) at L3-Gate-A" },
  { time: "20:32:07", level: "error", msg: "Ultrasonic sensor L2-05 timeout — last heartbeat >120s ago" },
  { time: "20:15:44", level: "info", msg: "Gate barrier opened: booking BKG-20260825-C07 verified" },
  { time: "20:01:30", level: "info", msg: "EV bay L3-04: 50 kWh delivered — charge complete" },
  { time: "19:48:12", level: "warn", msg: "CV violation: double_bay detected at Bay L2-08, plate DL08CX9900" },
  { time: "19:30:01", level: "info", msg: "Rush-hour simulation started by admin user" },
];

type AdminTab = "listings" | "disputes" | "vision" | "audit";

export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("listings");
  const [listings, setListings] = useState<PendingListing[]>(MOCK_LISTINGS);
  const [disputes, setDisputes] = useState<Dispute[]>(MOCK_DISPUTES);

  const pendingCount = listings.filter((l) => l.status === "pending").length;
  const openDisputeCount = disputes.filter((d) => d.status === "open").length;

  const approveListing = (id: string) =>
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: "approved" } : l));
  const rejectListing = (id: string) =>
    setListings((prev) => prev.map((l) => l.id === id ? { ...l, status: "rejected" } : l));

  const resolveDispute = (id: string) =>
    setDisputes((prev) => prev.map((d) => d.id === id ? { ...d, status: "resolved" } : d));
  const refundDispute = (id: string) =>
    setDisputes((prev) => prev.map((d) => d.id === id ? { ...d, status: "refunded" } : d));

  const TABS: { id: AdminTab; icon: React.ReactNode; label: string; badge?: number }[] = [
    { id: "listings", icon: <Building2 className="w-4 h-4" />, label: "Moderation Queue", badge: pendingCount || undefined },
    { id: "disputes", icon: <AlertTriangle className="w-4 h-4" />, label: "Dispute Desk", badge: openDisputeCount || undefined },
    { id: "vision", icon: <Cpu className="w-4 h-4" />, label: "AI Vision & Sensors" },
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
              Global space moderation, dispute arbitration, and ESP32 camera telemetry
            </p>
          </div>
        </div>

        {/* 3D Perspective Stat Cards */}
        <div className="grid grid-cols-3 gap-3.5 mb-7">
          {[
            { icon: <Building2 className="w-4 h-4" />, label: "Pending Approvals", value: pendingCount, color: "text-accent-cyan" },
            { icon: <AlertTriangle className="w-4 h-4" />, label: "Open Disputes", value: openDisputeCount, color: "text-rose-400" },
            { icon: <TrendingUp className="w-4 h-4" />, label: "Monthly Gross", value: "₹1.24 L", color: "text-emerald-400", raw: true },
          ].map((stat) => (
            <GlassCard key={stat.label} tilt className="p-4 flex items-center gap-3.5">
              <div className={`w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${stat.color} shadow-[0_0_15px_rgba(255,255,255,0.05)]`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[9px] hud-label">{stat.label}</p>
                <p className={`font-mono text-xl font-black ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Sliding Tab Navigation Bar */}
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
                  <span className="text-[8px] font-mono px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
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
                            listing.status === "pending"
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              : listing.status === "approved"
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                          }`}>
                            {listing.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="font-heading font-bold text-base text-white">{listing.location}</p>
                        <p className="text-xs text-muted font-mono">{listing.city} · {listing.totalSpots} spots · ₹{listing.pricePerHour}/hr</p>
                        <p className="text-xs text-slate-400">Host: <span className="text-white font-medium">{listing.ownerName}</span> · Submitted {listing.submittedAt}</p>
                      </div>

                      {listing.status === "pending" && (
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

            {/* AI Vision & Hardware Inspector */}
            {activeTab === "vision" && <AIVisionInspector />}

            {/* Audit Log */}
            {activeTab === "audit" && (
              <GlassCard className="p-5 space-y-3.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <p className="hud-label text-xs flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent-cyan" />
                    Spatial Sensor & Violation Audit Stream
                  </p>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    LIVE LOG STREAMING
                  </span>
                </div>
                <div className="space-y-2 font-mono text-xs">
                  {MOCK_AUDIT_LOG.map((entry, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2.5 p-3 rounded-xl ${
                        entry.level === "error"
                          ? "bg-rose-500/10 border border-rose-500/25 text-rose-200"
                          : entry.level === "warn"
                          ? "bg-amber-500/10 border border-amber-500/25 text-amber-200"
                          : "bg-white/5 border border-white/8 text-slate-300"
                      }`}
                    >
                      <span className="text-muted shrink-0">{entry.time}</span>
                      <span className={`shrink-0 uppercase text-[8px] font-bold px-1.5 py-0.2 rounded ${
                        entry.level === "error"
                          ? "bg-rose-500 text-white"
                          : entry.level === "warn"
                          ? "bg-amber-400 text-black"
                          : "bg-emerald-400 text-black"
                      }`}>
                        {entry.level}
                      </span>
                      <span className="text-slate-200">{entry.msg}</span>
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
