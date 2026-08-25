"use client";

import { ReactNode } from "react";

interface HUDLabelProps {
  children: ReactNode;
  className?: string;
  /** Optional numeric value displayed in accent color */
  value?: string | number;
  /** Icon element to display before label */
  icon?: ReactNode;
}

export default function HUDLabel({
  children,
  className = "",
  value,
  icon,
}: HUDLabelProps) {
  return (
    <div
      className={`
        glass neon-border
        inline-flex items-center gap-2
        px-3 py-2 rounded-lg
        ${className}
      `}
    >
      {icon && (
        <span className="text-accent-cyan" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="hud-label">{children}</span>
      {value !== undefined && (
        <span className="font-mono text-lg font-bold text-accent-cyan text-glow">
          {value}
        </span>
      )}
    </div>
  );
}
