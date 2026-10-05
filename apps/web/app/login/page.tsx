"use client";

import { useState, useTransition } from "react";
import { login, signup } from "./actions";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);

    startTransition(async () => {
      try {
        if (tab === "signin") {
          await login(data);
        } else {
          await signup(data);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Authentication failed");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#0e0e12] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Tactical grid overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,251,251,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0,251,251,0.12) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Ambient glow blobs */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-[#00fbfb]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-[#6ffbbe]/5 blur-3xl pointer-events-none" />

      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-[#b9cac9] hover:text-[#00fbfb] transition-colors text-xs font-mono tracking-wider uppercase"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Hub
      </Link>

      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div
          className="relative rounded-2xl border border-white/10 p-8 overflow-hidden"
          style={{
            background: "rgba(24, 24, 28, 0.95)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 25px 70px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.05) inset",
          }}
        >
          {/* Top-edge lighting gradient (Stitch Level 2 spec) */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(0,251,251,0.4), transparent)" }}
          />

          {/* Logo + brand */}
          <div className="flex flex-col items-center text-center gap-3 mb-8">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-1 relative"
              style={{
                background: "rgba(0,251,251,0.08)",
                border: "1px solid rgba(0,251,251,0.20)",
                boxShadow: "0 0 20px rgba(0,251,251,0.15)",
              }}
            >
              {/* Radar icon */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-[#00fbfb]">
                <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.9" />
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
                <path d="M12 5C8.13 5 5 8.13 5 12s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
              </svg>
              {/* Pulse dot */}
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#6ffbbe] animate-pulse shadow-[0_0_8px_rgba(111,251,190,0.8)]" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-space-grotesk, Space Grotesk, sans-serif)" }}>
                Welcome to{" "}
                <span className="text-[#00fbfb]" style={{ textShadow: "0 0 20px rgba(0,251,251,0.4)" }}>
                  SmartParking
                </span>
              </h1>
              <p className="text-xs text-[#b9cac9] mt-1.5 leading-relaxed font-mono">
                ONLINE // SATELLITE HUD v2.4 · FASTag NETC Grid
              </p>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex p-1 rounded-lg mb-6" style={{ background: "rgba(14,14,18,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
            {(["signin", "signup"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setError(null); }}
                className="flex-1 py-2 rounded-md text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
                style={
                  tab === t
                    ? {
                        background: "rgba(0,251,251,0.12)",
                        border: "1px solid rgba(0,251,251,0.30)",
                        color: "#00fbfb",
                        boxShadow: "0 0 12px rgba(0,251,251,0.20)",
                      }
                    : { color: "#839493", border: "1px solid transparent" }
                }
              >
                {t === "signin" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider text-[#b9cac9]">
                Mobile / Email / Vehicle Plate
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com or +91 98400 00000"
                  required
                  className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder:text-[#839493] transition-all"
                  style={{
                    background: "rgba(14,14,18,0.7)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontFamily: "var(--font-jetbrains-mono, JetBrains Mono, monospace)",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(0,251,251,0.4)";
                    e.target.style.boxShadow = "0 0 10px rgba(0,251,251,0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.08)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-xs font-mono uppercase tracking-wider text-[#b9cac9]">
                  Passcode / OTP
                </label>
                {tab === "signin" && (
                  <button type="button" className="text-xs font-mono text-[#00fbfb] hover:underline cursor-pointer">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="6-digit code or password"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-lg text-sm text-white placeholder:text-[#839493] transition-all tracking-widest"
                  style={{
                    background: "rgba(14,14,18,0.7)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontFamily: "var(--font-jetbrains-mono, JetBrains Mono, monospace)",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(0,251,251,0.4)";
                    e.target.style.boxShadow = "0 0 10px rgba(0,251,251,0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.08)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#839493] hover:text-[#b9cac9] transition-colors cursor-pointer"
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember device */}
            {tab === "signin" && (
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded cursor-pointer"
                  style={{ accentColor: "#00fbfb" }}
                />
                <span className="text-xs text-[#b9cac9] font-mono">Remember this device</span>
              </label>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-lg text-xs font-mono text-[#F43F5E]"
                  style={{ background: "rgba(244,63,94,0.10)", border: "1px solid rgba(244,63,94,0.30)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E] shrink-0 animate-pulse" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 px-6 rounded-lg text-sm font-bold tracking-normal transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-70"
              style={{
                background: isPending ? "rgba(0,251,251,0.6)" : "#00fbfb",
                color: "#002020",
                fontFamily: "var(--font-jetbrains-mono, JetBrains Mono, monospace)",
                boxShadow: "0 0 20px rgba(0,251,251,0.30)",
              }}
              onMouseEnter={(e) => {
                if (!isPending) e.currentTarget.style.boxShadow = "0 0 32px rgba(0,251,251,0.55)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 0 20px rgba(0,251,251,0.30)";
              }}
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#002020]/30 border-t-[#002020] rounded-full animate-spin" />
                  VERIFYING CREDENTIAL HASH...
                </>
              ) : (
                <>
                  {tab === "signin" ? "CONTINUE — LAUNCH BAY" : "REGISTER FASTAG IDENTITY"}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider + OAuth */}
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
              <span className="text-xs font-mono text-[#839493] uppercase tracking-wider">or continue with</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Google", icon: "G" },
                { label: "Apple", icon: "🍎" },
              ].map(({ label, icon }) => (
                <button
                  key={label}
                  type="button"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer text-[#e5e1e7]"
                  style={{
                    background: "rgba(27,27,31,0.60)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(27,27,31,0.90)";
                    e.currentTarget.style.borderColor = "rgba(0,251,251,0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(27,27,31,0.60)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  }}
                >
                  <span className="text-base">{icon}</span>
                  <span className="font-mono text-xs">{label}</span>
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-[#839493] font-mono">
              {tab === "signin" ? "New driver or fleet asset? " : "Already registered? "}
              <button
                type="button"
                onClick={() => setTab(tab === "signin" ? "signup" : "signin")}
                className="text-[#00fbfb] hover:underline cursor-pointer"
              >
                {tab === "signin" ? "Register FASTag" : "Sign In"}
              </button>
            </p>
          </div>
        </div>

        {/* Footer telemetry */}
        <p className="text-center mt-4 text-[10px] font-mono text-[#839493] uppercase tracking-widest">
          Secure Protocol TLSv1.3 · FASTag Grid v4.2 · NPCI NETC
        </p>
      </motion.div>
    </div>
  );
}
