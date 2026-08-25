"use client";

import React, { useMemo } from "react";

interface ParticleFieldProps {
  count?: number;
  className?: string;
}

export default function ParticleField({ count = 28, className = "" }: ParticleFieldProps) {
  // Precompute deterministic particle coordinates to avoid hydration mismatch
  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      // Deterministic pseudo-random values based on index
      const left = ((i * 37 + 13) % 100);
      const top = ((i * 47 + 29) % 100);
      const size = (i % 3) + 1.5;
      const duration = 12 + (i % 10) * 2;
      const delay = (i % 7) * 1.5;
      const opacity = 0.2 + (i % 5) * 0.12;
      const isCyan = i % 3 === 0;
      const isViolet = i % 3 === 1;

      return {
        id: i,
        left: `${left}%`,
        top: `${top}%`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: isCyan
          ? "#67E8F9"
          : isViolet
          ? "#818CF8"
          : "#FFFFFF",
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        opacity,
        boxShadow: isCyan
          ? "0 0 8px rgba(103, 232, 249, 0.8)"
          : isViolet
          ? "0 0 8px rgba(129, 140, 248, 0.8)"
          : "0 0 6px rgba(255, 255, 255, 0.6)",
      };
    });
  }, [count]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle-item"
          style={{
            left: p.left,
            top: p.top,
            width: p.width,
            height: p.height,
            backgroundColor: p.backgroundColor,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
            boxShadow: p.boxShadow,
          }}
        />
      ))}
    </div>
  );
}
