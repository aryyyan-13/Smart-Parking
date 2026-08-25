"use client";

import React, { ReactNode, forwardRef, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export interface GlassCardProps {
  children?: ReactNode;
  front?: ReactNode;
  back?: ReactNode;
  className?: string;
  glow?: boolean;
  tilt?: boolean;
  flip?: boolean;
  isFlipped?: boolean;
  onFlipChange?: (flipped: boolean) => void;
  onClick?: () => void;
  hover?: boolean;
  as?: "div" | "article" | "section";
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      front,
      back,
      className = "",
      glow = false,
      tilt = false,
      flip = false,
      isFlipped: controlledFlipped,
      onFlipChange,
      onClick,
      hover = false,
    },
    ref
  ) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [uncontrolledFlipped, setUncontrolledFlipped] = useState(false);
    const isCardFlipped = controlledFlipped !== undefined ? controlledFlipped : uncontrolledFlipped;

    // 3D Perspective Tilt Motion Values
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 20, stiffness: 260, mass: 0.1 };
    const rotateX = useSpring(mouseY, springConfig);
    const rotateY = useSpring(mouseX, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!tilt) return;
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = rect.width;
      const height = rect.height;
      const x = e.clientX - rect.left - width / 2;
      const y = e.clientY - rect.top - height / 2;
      // Max rotation: +/- 10 degrees
      mouseX.set((x / width) * 16);
      mouseY.set(-(y / height) * 16);
    };

    const handleMouseLeave = () => {
      if (tilt) {
        mouseX.set(0);
        mouseY.set(0);
      }
      if (flip && controlledFlipped === undefined) {
        setUncontrolledFlipped(false);
      }
    };

    const handleMouseEnter = () => {
      if (flip && controlledFlipped === undefined) {
        setUncontrolledFlipped(true);
      }
    };

    const handleClick = () => {
      if (onClick) onClick();
      if (flip) {
        const next = !isCardFlipped;
        setUncontrolledFlipped(next);
        if (onFlipChange) onFlipChange(next);
      }
    };

    // If flip mode is enabled with front and back content:
    if (flip && (front || back)) {
      return (
        <div
          ref={ref || cardRef}
          className={`perspective-1200 cursor-pointer ${className}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <motion.div
            animate={{ rotateY: isCardFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full preserve-3d relative"
          >
            {/* Front Face */}
            <div
              className={`
                w-full h-full backface-hidden glass p-5 relative overflow-hidden transition-all duration-300
                ${glow ? "neon-border neon-glow-cyan" : "hover:border-white/25"}
              `}
            >
              <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
              {front || children}
            </div>

            {/* Back Face */}
            <div
              className={`
                w-full h-full backface-hidden rotate-y-180 absolute inset-0 glass-elevated p-5 overflow-hidden
                border border-accent-cyan/40 shadow-[0_0_30px_rgba(103,232,249,0.2)]
              `}
            >
              <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-accent-cyan/60 to-transparent pointer-events-none" />
              {back}
            </div>
          </motion.div>
        </div>
      );
    }

    return (
      <motion.div
        ref={ref || cardRef}
        style={tilt ? { rotateX, rotateY, transformStyle: "preserve-3d" } : undefined}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        whileHover={hover ? { y: -3, transition: { duration: 0.2 } } : undefined}
        className={`
          glass relative overflow-hidden transition-all duration-300
          ${glow ? "neon-border neon-glow-cyan" : ""}
          ${hover ? "hover:border-white/25 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]" : ""}
          ${onClick ? "cursor-pointer" : ""}
          ${className}
        `}
      >
        {/* Subtle top metallic highlight reflection */}
        <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;
