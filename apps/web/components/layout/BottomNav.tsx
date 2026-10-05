"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

function ExploreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2C12 2 8 6.5 8 12s4 10 4 10M12 2c0 0 4 4.5 4 10s-4 10-4 10M2 12h20" />
    </svg>
  );
}

function MeterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" strokeLinecap="round" />
    </svg>
  );
}

function PassesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="7" width="20" height="10" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M12 12h.01" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const items: NavItem[] = [
  { label: "Explore", href: "/search", icon: <ExploreIcon /> },
  { label: "Meter", href: "/meter", icon: <MeterIcon /> },
  { label: "Passes", href: "/bookings", icon: <PassesIcon /> },
  { label: "Profile", href: "/login", icon: <ProfileIcon /> },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="xl:hidden fixed bottom-0 inset-x-0 z-50 h-16 flex items-center justify-around px-4"
      style={{
        background: "rgba(14,14,18,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(58,74,73,0.4)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.5)",
      }}
      role="navigation"
      aria-label="Bottom navigation"
    >
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 min-w-[60px] transition-all"
            aria-current={isActive ? "page" : undefined}
            style={{ color: isActive ? "#00fbfb" : "#839493" }}
          >
            <span
              style={
                isActive
                  ? { filter: "drop-shadow(0 0 6px rgba(0,251,251,0.6))" }
                  : undefined
              }
            >
              {item.icon}
            </span>
            <span
              className="text-[10px] font-mono uppercase tracking-wider"
              style={{ fontWeight: isActive ? 700 : 400 }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
