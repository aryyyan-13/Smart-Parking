"use client";

import React from "react";

export default function AuroraBackground() {
  return (
    <div className="aurora-container" aria-hidden="true">
      <div className="aurora-blob-1" />
      <div className="aurora-blob-2" />
      <div className="aurora-blob-3" />
      <div className="absolute inset-0 bg-spatial-grid pointer-events-none opacity-60" />
    </div>
  );
}
