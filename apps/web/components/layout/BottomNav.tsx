"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Timer, Cpu, LayoutDashboard, CalendarCheck } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const items: NavItem[] = [
  { label: "Search", href: "/search", icon: <Search className="w-4 h-4" /> },
  { label: "Meter", href: "/meter", icon: <Timer className="w-4 h-4" /> },
  { label: "HUD Deck", href: "/deck", icon: <Cpu className="w-4 h-4" /> },
  { label: "Bookings", href: "/bookings", icon: <CalendarCheck className="w-4 h-4" /> },
  { label: "Host", href: "/owner/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-4 md:hidden pointer-events-none">
      <nav
        className="pointer-events-auto flex items-center gap-1 px-3 py-2 rounded-2xl bg-bg-deep/85 backdrop-blur-2xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.7)]"
        role="navigation"
        aria-label="Bottom navigation dock"
      >
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl
                transition-colors duration-200 select-none min-w-[56px]
                ${isActive ? "text-white font-semibold" : "text-muted hover:text-white"}
              `}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-active-pill"
                  className="absolute inset-0 rounded-xl bg-white/10 border border-white/20 shadow-[0_0_15px_rgba(103,232,249,0.25)] -z-10"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className={isActive ? "text-accent-cyan drop-shadow-[0_0_8px_rgba(103,232,249,0.6)]" : ""}>
                {item.icon}
              </span>
              <span className="text-[10px] tracking-tight font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
