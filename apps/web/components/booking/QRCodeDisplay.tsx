"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export default function QRCodeDisplay({
  value,
  size = 160,
  className = "",
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 2,
        color: {
          dark: "#00FFFF",   // neon cyan for dots
          light: "#00000000", // transparent background
        },
        errorCorrectionLevel: "H",
      },
      (err) => {
        if (err) setError(true);
      }
    );
  }, [value, size]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-bg-elevated border border-border text-muted text-xs ${className}`}
        style={{ width: size, height: size }}
      >
        QR unavailable
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl p-3 bg-bg-elevated border border-accent-cyan/30 inline-flex ${className}`}
      style={{ boxShadow: "0 0 20px rgba(0,255,255,0.08)" }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        aria-label={`QR code for booking entry: ${value}`}
        style={{ display: "block", borderRadius: 8 }}
      />
    </div>
  );
}
