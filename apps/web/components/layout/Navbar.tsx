"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Search, MapPin, Cpu, LayoutDashboard, Wifi, Timer, Shield, ChevronDown
} from "lucide-react";
import NeonButton from "@web/components/ui/NeonButton";
import ThemeToggle from "@web/components/ui/ThemeToggle";
import { useCurrencyStore, CURRENCIES, type CurrencyCode } from "@web/lib/currency-store";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Find Parking", href: "/search", icon: <Search className="w-3.5 h-3.5" /> },
  { label: "Live Meter", href: "/meter", icon: <Timer className="w-3.5 h-3.5" />, badge: "LIVE" },
  { label: "HUD Deck", href: "/deck", icon: <Cpu className="w-3.5 h-3.5" /> },
  { label: "Host Studio", href: "/owner/dashboard", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
  { label: "Admin Vision", href: "/admin", icon: <Shield className="w-3.5 h-3.5" /> },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const { active, setActive } = useCurrencyStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-3 sm:px-6 pt-3">
      <nav
        className={`
          max-w-7xl mx-auto rounded-2xl transition-all duration-300
          ${
            scrolled
              ? "bg-bg-deep/80 backdrop-blur-2xl border border-white/12 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
              : "bg-bg-deep/40 backdrop-blur-xl border border-white/8"
          }
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="px-4 sm:px-5">
          <div className="flex items-center justify-between h-16">
            {/* Logo with 3D Chrome Emblem */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-white/15 to-white/5 border border-white/20 flex items-center justify-center shadow-[0_0_20px_rgba(103,232,249,0.25)] group-hover:border-accent-cyan group-hover:shadow-[0_0_28px_rgba(103,232,249,0.5)] transition-all duration-300">
                <MapPin className="w-4 h-4 text-accent-cyan" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-base font-bold tracking-tight text-white flex items-center gap-1">
                  Smart<span className="text-accent-cyan text-glow">Park</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-chrome border border-white/10 font-normal">3D</span>
                </span>
                <span className="text-[9px] text-muted -mt-0.5 tracking-wider font-mono">SPATIAL HUD</span>
              </div>
            </Link>

            {/* Desktop Nav Items with Sliding Pill Indicator */}
            <div
              className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]"
              onMouseLeave={() => setHoveredPath(null)}
            >
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const isHovered = hoveredPath === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onMouseEnter={() => setHoveredPath(item.href)}
                    className={`
                      relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                      transition-colors duration-200 z-10 select-none
                      ${isActive ? "text-white font-semibold" : "text-muted hover:text-white"}
                    `}
                  >
                    {/* Active or Hovered Sliding Background Pill */}
                    {(isActive || isHovered) && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className={`absolute inset-0 rounded-lg -z-10 ${
                          isActive
                            ? "bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(103,232,249,0.2)]"
                            : "bg-white/5 border border-white/10"
                        }`}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}

                    {item.icon}
                    <span>{item.label}</span>

                    {item.badge && (
                      <span className="text-[8px] font-mono px-1.5 py-0.2 rounded-full bg-status-confirmed/20 text-status-confirmed border border-status-confirmed/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right side widgets: IoT Status + Currency + Theme + CTAs */}
            <div className="hidden lg:flex items-center gap-2.5">
              {/* IoT Live Status */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-400 font-medium">IoT: 99.8%</span>
              </div>

              {/* Currency Selector */}
              <div className="relative">
                <select
                  id="navbar-currency-select"
                  value={active}
                  onChange={(e) => setActive(e.target.value as CurrencyCode)}
                  className="appearance-none pl-2.5 pr-7 py-1.5 rounded-xl bg-white/5 border border-white/12 text-xs font-mono text-accent-cyan hover:border-accent-cyan/40 focus:border-accent-cyan/60 focus:outline-none cursor-pointer transition-colors backdrop-blur-md"
                  aria-label="Select display currency"
                >
                  {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                    <option key={code} value={code} className="bg-bg-deep text-white">
                      {CURRENCIES[code].symbol} {code}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted pointer-events-none" />
              </div>

              <ThemeToggle />

              <NeonButton variant="chrome" size="sm">
                Sign In
              </NeonButton>

              <NeonButton variant="primary" size="sm" pulse>
                Launch App
              </NeonButton>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-muted hover:text-white rounded-xl bg-white/5 border border-white/10 transition-colors cursor-pointer"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden border-t border-white/10 px-4 py-4 space-y-2 overflow-hidden"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center justify-between px-3.5 py-2.5 text-sm rounded-xl transition-all
                    ${
                      pathname === item.href
                        ? "bg-accent-cyan/15 border border-accent-cyan/30 text-white font-semibold"
                        : "text-muted hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-status-confirmed/20 text-status-confirmed border border-status-confirmed/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}

              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <div className="relative">
                  <select
                    value={active}
                    onChange={(e) => setActive(e.target.value as CurrencyCode)}
                    className="appearance-none pl-2.5 pr-7 py-1.5 rounded-xl bg-white/5 border border-white/12 text-xs font-mono text-accent-cyan focus:outline-none cursor-pointer"
                    aria-label="Select display currency"
                  >
                    {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                      <option key={code} value={code} className="bg-bg-deep text-white">
                        {CURRENCIES[code].symbol} {code}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted pointer-events-none" />
                </div>

                <div className="flex gap-2 flex-1">
                  <NeonButton variant="chrome" size="sm" fullWidth>
                    Sign In
                  </NeonButton>
                  <NeonButton variant="primary" size="sm" fullWidth>
                    Launch
                  </NeonButton>
                </div>
                <ThemeToggle />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
