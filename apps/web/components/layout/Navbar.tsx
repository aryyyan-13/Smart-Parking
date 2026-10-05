"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrencyStore, CURRENCIES, type CurrencyCode } from "@web/lib/currency-store";
import { useParkingSessionStore } from "@web/lib/parking-session-store";
import { createClient } from "@web/utils/supabase/client";
import { signout } from "@web/app/login/actions";

interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

const BASE_NAV_ITEMS: NavItem[] = [
  { label: "Explore & Map", href: "/search" },
  { label: "3D Garage Bay", href: "/parking" },
  { label: "Live Meter", href: "/meter" },
  { label: "My Passes", href: "/bookings" },
  { label: "Host Studio", href: "/owner/dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { active, setActive } = useCurrencyStore();
  const activeSession = useParkingSessionStore((s) => s.getActiveSession());
  const [user, setUser] = useState<import("@supabase/supabase-js").User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const navItems: NavItem[] = BASE_NAV_ITEMS.map((item) => {
    if (item.href === "/meter" && activeSession) return { ...item, badge: "LIVE" };
    return item;
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(14,14,18,0.90)"
          : "rgba(14,14,18,0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled
          ? "1px solid rgba(58,74,73,0.6)"
          : "1px solid rgba(255,255,255,0.04)",
        boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.5)" : "none",
      }}
      role="banner"
    >
      <div className="h-20 w-full px-6 lg:px-8 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
            style={{
              background: "rgba(0,251,251,0.08)",
              border: "1px solid rgba(0,251,251,0.20)",
              boxShadow: "0 0 16px rgba(0,251,251,0.12)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[#00fbfb]">
              <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.9" />
              <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
              <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.2" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span
              className="text-base font-bold tracking-tight text-white leading-none"
              style={{ fontFamily: "var(--font-space-grotesk, Space Grotesk, sans-serif)" }}
            >
              SmartParking<span className="text-[#00fbfb]">.AI</span>
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6ffbbe] animate-pulse shadow-[0_0_6px_rgba(111,251,190,0.8)]" />
              <span className="text-[9px] font-mono text-[#4edea3] tracking-widest uppercase">
                ONLINE // SATELLITE HUD v2.4
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav
          className="hidden xl:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-3 py-1.5 rounded-lg text-xs font-mono tracking-wide transition-all flex items-center gap-1.5"
                style={
                  isActive
                    ? {
                        background: "rgba(0,251,251,0.12)",
                        color: "#00fbfb",
                        border: "1px solid rgba(0,251,251,0.25)",
                        boxShadow: "0 0 12px rgba(0,251,251,0.20)",
                        fontWeight: 700,
                      }
                    : {
                        color: "#b9cac9",
                        border: "1px solid transparent",
                      }
                }
              >
                {item.label}
                {item.badge && (
                  <span
                    className="text-[8px] font-mono px-1.5 py-0.5 rounded-full font-bold"
                    style={{
                      background: "rgba(111,251,190,0.15)",
                      color: "#6ffbbe",
                      border: "1px solid rgba(111,251,190,0.30)",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right widgets */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {/* IoT status */}
          <div
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono"
            style={{
              background: "rgba(111,251,190,0.06)",
              border: "1px solid rgba(111,251,190,0.15)",
              color: "#4edea3",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#6ffbbe] animate-pulse" />
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
            </svg>
            IoT: 99.8%
          </div>

          {/* Currency */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer"
            style={{ background: "rgba(27,27,31,0.8)", border: "1px solid rgba(58,74,73,0.5)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00dddd" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
              <path d="M12 18V6" />
            </svg>
            <select
              id="navbar-currency-select"
              value={active}
              onChange={(e) => setActive(e.target.value as CurrencyCode)}
              className="bg-transparent text-xs font-mono text-[#00fbfb] cursor-pointer focus:outline-none"
              aria-label="Select display currency"
            >
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                <option key={code} value={code} className="bg-[#1b1b1f] text-[#e5e1e7]">
                  {CURRENCIES[code].symbol} {code}
                </option>
              ))}
            </select>
          </div>

          {/* Host a Spot */}
          <Link
            href="/owner/dashboard"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
            style={{
              background: "rgba(27,27,31,0.8)",
              border: "1px solid rgba(0,251,251,0.20)",
              color: "#00fbfb",
              boxShadow: "0 0 12px rgba(0,251,251,0.15)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            + Host a Spot
          </Link>

          {/* Profile / Auth */}
          <button
            onClick={() => user ? startSignout() : (window.location.href = "/login")}
            className="flex items-center gap-2.5 pl-2 cursor-pointer bg-transparent border-0"
          >
            {user && (
              <div className="hidden md:flex flex-col text-right">
                <span className="text-[10px] font-mono text-[#00fbfb] font-semibold tracking-wider">
                  #{user.email?.split("@")[0]?.toUpperCase().slice(0, 8) ?? "USER"}
                </span>
                <span className="text-[9px] font-mono text-[#4edea3]">FASTag VIP</span>
              </div>
            )}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{
                background: user ? "rgba(0,251,251,0.15)" : "rgba(255,255,255,0.08)",
                border: user ? "1px solid rgba(0,251,251,0.35)" : "1px solid rgba(255,255,255,0.12)",
                boxShadow: user ? "0 0 12px rgba(0,251,251,0.20)" : "none",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={user ? "#00fbfb" : "#b9cac9"} strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </button>

          {user && (
            <button
              onClick={() => signout()}
              className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer"
              style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.20)", color: "#F43F5E" }}
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="xl:hidden p-2.5 rounded-lg transition-colors cursor-pointer"
          style={{
            background: "rgba(27,27,31,0.8)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#b9cac9",
          }}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            ) : (
              <>
                <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="xl:hidden overflow-hidden"
            style={{ borderTop: "1px solid rgba(58,74,73,0.4)" }}
          >
            <div className="px-6 py-5 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-lg transition-all text-sm font-mono"
                    style={
                      isActive
                        ? {
                            background: "rgba(0,251,251,0.10)",
                            border: "1px solid rgba(0,251,251,0.25)",
                            color: "#00fbfb",
                          }
                        : {
                            background: "transparent",
                            border: "1px solid transparent",
                            color: "#b9cac9",
                          }
                    }
                  >
                    {item.label}
                    {item.badge && (
                      <span
                        className="text-[8px] font-mono px-1.5 py-0.5 rounded-full"
                        style={{
                          background: "rgba(111,251,190,0.15)",
                          color: "#6ffbbe",
                          border: "1px solid rgba(111,251,190,0.30)",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              <div className="pt-4 border-t flex items-center justify-between gap-3" style={{ borderColor: "rgba(58,74,73,0.4)" }}>
                <select
                  value={active}
                  onChange={(e) => setActive(e.target.value as CurrencyCode)}
                  className="px-3 py-2 rounded-lg text-xs font-mono text-[#00fbfb] cursor-pointer focus:outline-none"
                  style={{ background: "rgba(27,27,31,0.8)", border: "1px solid rgba(58,74,73,0.5)" }}
                  aria-label="Select display currency"
                >
                  {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                    <option key={code} value={code} className="bg-[#1b1b1f]">
                      {CURRENCIES[code].symbol} {code}
                    </option>
                  ))}
                </select>

                {user ? (
                  <button
                    onClick={() => signout()}
                    className="px-4 py-2 rounded-lg text-xs font-mono cursor-pointer"
                    style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.20)", color: "#F43F5E" }}
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link href="/login">
                    <button
                      className="px-4 py-2 rounded-lg text-xs font-mono cursor-pointer"
                      style={{ background: "#00fbfb", color: "#002020", fontWeight: 700 }}
                    >
                      Sign In
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// Helper to avoid calling signout inline (avoids unused import warning)
function startSignout() {
  signout();
}
