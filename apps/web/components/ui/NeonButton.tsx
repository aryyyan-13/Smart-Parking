"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, type HTMLMotionProps } from "framer-motion";

export type ChromeButtonVariant = "primary" | "secondary" | "chrome" | "ghost" | "destructive";
export type ChromeButtonSize = "sm" | "md" | "lg";

export interface NeonButtonProps extends Omit<HTMLMotionProps<"button">, "size"> {
  variant?: ChromeButtonVariant;
  size?: ChromeButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  pulse?: boolean;
  magnetic?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ChromeButtonVariant, string> = {
  primary: `
    bg-gradient-to-b from-white/15 to-white/5 text-white
    border border-accent-cyan/40 shadow-[0_0_25px_rgba(103,232,249,0.22)]
    hover:border-accent-cyan hover:shadow-[0_0_35px_rgba(103,232,249,0.4)]
    hover:from-white/20 hover:to-white/10
  `,
  chrome: `
    bg-gradient-to-b from-white/12 to-white/4 text-chrome-bright
    border border-white/20 shadow-[0_0_20px_rgba(160,160,176,0.15)]
    hover:border-white/40 hover:shadow-[0_0_28px_rgba(160,160,176,0.25)]
    hover:from-white/18 hover:to-white/8
  `,
  secondary: `
    bg-white/5 text-chrome-bright border border-white/10
    hover:bg-white/10 hover:border-white/25
  `,
  ghost: `
    bg-transparent text-muted border border-transparent
    hover:text-foreground hover:bg-white/5 hover:border-white/10
  `,
  destructive: `
    bg-status-cancelled/10 text-status-cancelled border border-status-cancelled/30
    hover:bg-status-cancelled/20 hover:border-status-cancelled/60
    hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]
  `,
};

const sizeStyles: Record<ChromeButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs rounded-lg gap-1.5 font-medium",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2 font-medium",
  lg: "px-7 py-3.5 text-base rounded-2xl gap-2.5 font-semibold",
};

export default function NeonButton({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  pulse = false,
  magnetic = true,
  disabled,
  className = "",
  children,
  onClick,
  ...props
}: NeonButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  // Framer Motion spring physics for magnetic cursor attraction
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 18, stiffness: 220, mass: 0.2 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || disabled || loading) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * 0.28;
    const distanceY = (e.clientY - centerY) * 0.28;
    mouseX.set(distanceX);
    mouseY.set(distanceY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.96 }}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        relative inline-flex items-center justify-center select-none cursor-pointer
        backdrop-blur-xl transition-colors duration-200 overflow-hidden
        disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${pulse ? "neon-glow-cyan" : ""}
        ${className}
      `}
      {...props}
    >
      {/* Subtle top chrome highlight reflection */}
      <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

      {/* Loading state spinner */}
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Processing…</span>
        </>
      ) : (
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      )}
    </motion.button>
  );
}
